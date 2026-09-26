# Export the most popular Soundboard conversations

Run this on the Mac that has your Invision database backup. You need Python 3 and the files in this repository; you do not need to install packages or load the database into a server.

From the repository folder:

```bash
python3 scripts/export-top-threads.py ~/Downloads/z281087-backup.sql.gz \
  --output ~/Desktop/top-threads-archive.zip
```

Change the backup path if your file lives elsewhere. The exporter reads the 17 topics already listed in `data/top-threads.json`, checks that each is approved and belongs to the public Soundboard, and writes up to 50 posts in each JSON page. It combines current and archived posts, omits queued and deleted posts, and does not read private message tables, account records, or IP addresses. Email addresses inside public post text are replaced with `[email removed]`. Quotes, signatures, scripts and external images are omitted.

Review the resulting ZIP before sharing or publishing it. It contains public usernames and post text, which may include personal details beyond email addresses. Send the ZIP to Codex to integrate and check the archive; **do not upload the full SQL backup to GitHub**. If the ZIP is too large to attach, tell Codex its size so it can split the export into smaller topic groups.

After import, each thread will open at `topic.html?id=TOPIC_ID&page=1` with next and previous page links. The existing links on Community Stats can then be changed to these local pages. Until the ZIP is imported, those links continue to open the original forum threads.
