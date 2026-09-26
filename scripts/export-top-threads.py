#!/usr/bin/env python3
"""Export the ranked public Soundboard topics from a local Invision SQL backup.

Usage:
  python3 scripts/export-top-threads.py ~/Downloads/z281087-backup.sql.gz \
    --output ~/Desktop/top-threads-archive.zip

The backup remains on this computer. The ZIP contains only approved topics and
visible, undeleted posts, without the backup's IP addresses or account data.
Review the ZIP's JSON before publishing it: public posts may contain contact
details that their authors chose to include in the text.
"""

import argparse
import gzip
import html
import json
import re
import sys
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RANKINGS = ROOT / 'data' / 'top-threads.json'
INSERT = re.compile(rb'^INSERT INTO `(?P<table>forums_archive_posts|forums_posts|forums_topics)` VALUES ')
PAGE_SIZE = 50
PAGES_PER_CHUNK = 10
EMAIL = re.compile(r'(?<![\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?![\w.-])')


def rows(statement, start):
    """Parse tuples in the mysqldump format used by the Invision backup."""
    i, size = start, len(statement)
    while i < size:
        while i < size and statement[i] in b' \t\r\n,':
            i += 1
        if i >= size or statement[i] == 59:
            return
        if statement[i] != 40:
            raise ValueError('Unexpected INSERT tuple format')
        i += 1
        fields, value, quoted = [], bytearray(), False
        while i < size:
            char = statement[i]
            if quoted:
                if char == 92 and i + 1 < size:
                    i += 1
                    value.append({48: 0, 98: 8, 110: 10, 114: 13, 116: 9, 90: 26}.get(statement[i], statement[i]))
                elif char == 39:
                    if i + 1 < size and statement[i + 1] == 39:
                        value.append(39)
                        i += 1
                    else:
                        quoted = False
                else:
                    value.append(char)
            elif char == 39:
                quoted = True
            elif char in (44, 41):
                fields.append(None if value == b'NULL' else bytes(value).strip())
                value.clear()
                if char == 41:
                    yield fields
                    break
            else:
                value.append(char)
            i += 1
        if quoted or i >= size:
            raise ValueError('Incomplete INSERT tuple')
        i += 1


def integer(value):
    return int(value) if value not in (None, b'') else 0


def decode(value):
    return value.decode('utf-8', 'replace') if value is not None else ''


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').lower()
        skip = tag in ('blockquote', 'script', 'style') or any(
            word in classes for word in ('ipsquote', 'ipssignature', 'quotetop', 'quotemain'))
        self.stack.append((tag, skip or self.hidden))
        if tag in ('p', 'br', 'div', 'li', 'hr') and not self.hidden:
            self.parts.append('\n')
        if tag == 'img' and not self.hidden:
            self.parts.append(' [Image omitted] ')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
        if tag in ('p', 'div', 'li') and not self.hidden:
            self.parts.append('\n')

    @property
    def hidden(self):
        return bool(self.stack and self.stack[-1][1])

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def clean_post(raw):
    parser = VisibleText()
    parser.feed(decode(raw))
    text = html.unescape(''.join(parser.parts)).replace('\xa0', ' ')
    text = re.sub(r'\[quote(?:\s+[^]]*)?\].*?\[/quote\]', '', text, flags=re.I | re.S)
    text = EMAIL.sub('[email removed]', text)
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(line.strip() for line in text.splitlines())).strip()


def collect(backup, ids):
    topics, posts = {}, defaultdict(dict)
    with gzip.open(backup, 'rb') as source:
        for line_number, line in enumerate(source, 1):
            match = INSERT.match(line)
            if not match:
                continue
            if not line.rstrip().endswith(b';'):
                raise ValueError(f'INSERT spans multiple lines at SQL line {line_number}')
            table = match.group('table')
            for row in rows(line, match.end()):
                if table == b'forums_topics':
                    tid = integer(row[0])
                    if tid in ids:
                        topics[tid] = {
                            'title': html.unescape(decode(row[1])),
                            'forum_id': integer(row[13]),
                            'approved': integer(row[14]),
                        }
                elif table == b'forums_archive_posts':
                    tid = integer(row[7])
                    if tid in ids and integer(row[6]) == 0:
                        pid = integer(row[0])
                        posts[tid][pid] = (row[2], row[4], row[5])
                else:
                    tid = integer(row[9])
                    if tid in ids and integer(row[8]) == 0 and integer(row[16]) == 0:
                        pid = integer(row[0])
                        posts[tid][pid] = (row[4], row[6], row[7])
    missing = sorted(ids - topics.keys())
    if missing:
        raise ValueError(f'Topic IDs missing from backup: {missing}')
    invalid = [tid for tid in ids if topics[tid]['forum_id'] != 11 or topics[tid]['approved'] != 1]
    if invalid:
        raise ValueError(f'Topics outside approved Soundboard: {sorted(invalid)}')
    return topics, posts


def archive(backup, output):
    if output.exists():
        raise ValueError(f'Output already exists: {output}. Choose a new filename.')
    ranking = json.loads(RANKINGS.read_text(encoding='utf-8'))
    ids = set(ranking['mostReplies'] + ranking['mostViews'])
    info = {thread['id']: thread for thread in ranking['threads']}
    topics, posts = collect(backup, ids)
    manifest = {'pageSize': PAGE_SIZE, 'pagesPerChunk': PAGES_PER_CHUNK, 'topics': {}}
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as target:
        for tid in sorted(ids):
            entries = []
            for pid, (name, stamp, body) in sorted(posts[tid].items(), key=lambda row: (integer(row[1][1]), row[0])):
                if not integer(stamp):
                    continue
                text = clean_post(body)
                if not text:
                    continue
                entries.append({'id': pid, 'author': decode(name),
                                'date': datetime.fromtimestamp(integer(stamp), timezone.utc).date().isoformat(),
                                'text': text})
            if not entries:
                raise ValueError(f'Topic {tid} has no visible posts in the backup')
            total_pages = (len(entries) + PAGE_SIZE - 1) // PAGE_SIZE
            manifest['topics'][str(tid)] = {
                'title': topics[tid]['title'], 'starter': info[tid]['author'],
                'started': info[tid]['started'], 'posts': len(entries), 'pages': total_pages,
            }
            chunk_size = PAGE_SIZE * PAGES_PER_CHUNK
            for chunk in range(1, (len(entries) + chunk_size - 1) // chunk_size + 1):
                content = entries[(chunk - 1) * chunk_size:chunk * chunk_size]
                target.writestr(f'data/threads/{tid}/chunk-{chunk}.json',
                                json.dumps({'topicId': tid, 'chunk': chunk, 'posts': content}, ensure_ascii=False))
            print(f'{tid}: {len(entries)} posts across {total_pages} pages', flush=True)
        target.writestr('data/threads/manifest.json', json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f'Created {output} ({output.stat().st_size:,} bytes). Review before publishing.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('backup', type=Path, help='Local Invision .sql.gz backup')
    parser.add_argument('--output', type=Path, default=Path('top-threads-archive.zip'),
                        help='ZIP to create (must not exist already)')
    args = parser.parse_args()
    try:
        archive(args.backup.expanduser(), args.output.expanduser())
    except (OSError, ValueError, IndexError, OverflowError, KeyError) as error:
        parser.exit(1, f'Export stopped: {error}\n')
