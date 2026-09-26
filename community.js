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
    const bar = document.createElement('span');
    bar.className = 'member-bar';
    bar.style.setProperty('--fill', `${member.value / leader * 100}%`);
    details.append(name, bar);
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
    renderMembers(document.querySelector('#content-list'), data.mostContent, 'content');
    renderMembers(document.querySelector('#reputation-list'), data.mostReputation, 'points');
  })
  .catch(() => {
    document.querySelector('#rankings').insertAdjacentHTML('afterbegin', '<p class="load-error" role="alert">The archived rankings could not be loaded. Please try again later.</p>');
  });
