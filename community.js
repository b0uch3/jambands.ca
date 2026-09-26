const number = new Intl.NumberFormat('en-CA');

function renderMembers(list, members, unit) {
  const leader = members[0].value;
  members.forEach((member, index) => {
    const item = document.createElement('li');
    item.className = index < 3 ? 'member featured' : 'member';
    const rank = document.createElement('span');
    rank.className = 'member-rank';
    rank.textContent = String(index + 1).padStart(2, '0');
    const avatar = document.createElement('span');
    avatar.className = 'member-avatar';
    if (member.avatar) {
      const image = document.createElement('img');
      image.src = member.avatar;
      image.alt = '';
      image.loading = 'lazy';
      avatar.append(image);
    } else {
      avatar.textContent = member.name.slice(0, 1).toUpperCase();
      avatar.setAttribute('aria-hidden', 'true');
    }
    const details = document.createElement('span');
    details.className = 'member-details';
    const name = document.createElement('strong');
    name.textContent = member.name;
    if (member.memberId === 80) {
      const remembrance = document.createElement('a');
      remembrance.className = 'member-remembrance';
      remembrance.href = 'bradm.html';
      remembrance.textContent = 'In rememberance · 2017';
      details.append(name, remembrance);
    } else {
      details.append(name);
    }
    const bar = document.createElement('span');
    bar.className = 'member-bar';
    bar.style.setProperty('--fill', `${member.value / leader * 100}%`);
    details.append(bar);
    const score = document.createElement('span');
    score.className = 'member-score';
    const value = document.createElement('strong');
    value.textContent = number.format(member.value);
    const label = document.createElement('small');
    label.textContent = unit;
    score.append(value, label);
    item.append(rank, avatar, details, score);
    list.append(item);
  });
}

fetch('data/top-members.json')
  .then(response => {
    if (!response.ok) throw new Error('Could not load the archived rankings.');
    return response.json();
  })
  .then(data => {
    renderMembers(document.querySelector('#content-list'), data.mostContent.slice(0, 10), 'content');
    renderMembers(document.querySelector('#reputation-list'), data.mostReputation.slice(0, 10), 'points');
  })
  .catch(() => {
    document.querySelector('#rankings').insertAdjacentHTML('afterbegin', '<p class="load-error" role="alert">The archived rankings could not be loaded. Please try again later.</p>');
  });

function renderThreads(list, ids, threads, focus) {
  ids.forEach((id, index) => {
    const thread = threads.get(id);
    if (!thread) return;
    const item = document.createElement('li');
    item.className = 'thread-item';
    const heading = document.createElement('div');
    heading.className = 'thread-item-heading';
    const rank = document.createElement('span');
    rank.className = 'thread-rank';
    rank.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('h4');
    title.textContent = thread.title;
    heading.append(rank, title);
    const byline = document.createElement('p');
    byline.className = 'thread-byline';
    byline.append('Started by ');
    const author = document.createElement('strong');
    author.textContent = thread.author;
    byline.append(author, ` · ${thread.started}`);
    const description = document.createElement('p');
    description.className = 'thread-description';
    description.textContent = thread.description;
    const counts = document.createElement('p');
    counts.className = 'thread-counts';
    const primary = document.createElement('strong');
    primary.textContent = `${focus === 'replies' ? thread.replies : thread.views} ${focus}`;
    counts.append(primary, ` · ${focus === 'replies' ? `${thread.views} views` : `${thread.replies} replies`}`);
    item.append(heading, byline, description);
    if (thread.example && index < 2) {
      const example = document.createElement('p');
      example.className = 'thread-example';
      example.textContent = `From the conversation: ${thread.example}`;
      item.append(example);
    }
    item.append(counts);
    list.append(item);
  });
}

fetch('data/top-threads.json')
  .then(response => {
    if (!response.ok) throw new Error('Could not load the archived threads.');
    return response.json();
  })
  .then(data => {
    const threads = new Map(data.threads.map(thread => [thread.id, thread]));
    renderThreads(document.querySelector('#thread-replies-list'), data.mostReplies, threads, 'replies');
    renderThreads(document.querySelector('#thread-views-list'), data.mostViews, threads, 'views');
  })
  .catch(() => {
    document.querySelector('#thread-rankings').insertAdjacentHTML('afterbegin', '<p class="load-error" role="alert">The archived threads could not be loaded. Please try again later.</p>');
  });
