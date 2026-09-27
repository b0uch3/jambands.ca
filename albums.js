const list = document.querySelector('#album-list');
const status = document.querySelector('#album-status');
const search = document.querySelector('#album-search');
const year = document.querySelector('#album-year');
const more = document.querySelector('#album-more');
let entries = [];
let avatars = {};
let shown = 0;
const PAGE_SIZE = 40;

function filtered() {
  const query = search.value.trim().toLocaleLowerCase();
  return entries.filter(entry => {
    if (year.value && !entry.date.startsWith(year.value)) return false;
    return !query || [entry.artist, entry.album, entry.poster, entry.comment]
      .some(value => String(value || '').toLocaleLowerCase().includes(query));
  });
}
function renderCard(entry) {
  const card = document.createElement('article');
  card.className = 'album-card';
  const artist = document.createElement('p'); artist.className = 'album-artist'; artist.textContent = entry.artist;
  const album = document.createElement('h2'); album.textContent = entry.album;
  card.append(artist, album);
  if (entry.comment) {
    const comment = document.createElement('p'); comment.className = 'album-comment';
    comment.textContent = `“${entry.comment}”`; card.append(comment);
  }
  const youtube = document.createElement('a');
  youtube.className = 'album-youtube';
  const youtubeSearch = new URL('https://www.youtube.com/results');
  youtubeSearch.searchParams.set('search_query', `${entry.artist} ${entry.album}`);
  youtube.href = youtubeSearch.href;
  youtube.target = '_blank';
  youtube.rel = 'noopener noreferrer';
  youtube.textContent = 'Find on YouTube ↗';
  youtube.setAttribute('aria-label', `Search YouTube for ${entry.artist} — ${entry.album} (opens in a new tab)`);
  card.append(youtube);
  const meta = document.createElement('div'); meta.className = 'album-meta';
  const poster = document.createElement('strong'); poster.textContent = entry.poster || 'Forum member';
  const identity = document.createElement('span'); identity.className = 'album-poster';
  const avatar = avatars[entry.poster];
  if (avatar) {
    const photo = document.createElement('img');
    photo.className = 'album-avatar';
    photo.src = avatar;
    photo.alt = '';
    photo.width = 34;
    photo.height = 34;
    photo.loading = 'lazy';
    photo.decoding = 'async';
    identity.append(photo);
  }
  identity.append(poster);
  const date = document.createElement('time'); date.dateTime = entry.date; date.textContent = entry.date;
  meta.append(identity, date); card.append(meta);
  return card;
}
function render(reset = false) {
  if (reset) { shown = 0; list.replaceChildren(); }
  const results = filtered();
  const next = results.slice(shown, shown + PAGE_SIZE);
  list.append(...next.map(renderCard));
  shown += next.length;
  status.textContent = `${results.length.toLocaleString()} album mention${results.length === 1 ? '' : 's'}${search.value || year.value ? ' found' : ' from the thread'}`;
  more.hidden = shown >= results.length;
}
search.addEventListener('input', () => render(true));
year.addEventListener('change', () => render(true));
more.addEventListener('click', () => render());
Promise.all([
  Promise.all(Array.from({length: 8}, (_, index) => fetch(`./albums-${index + 1}.json`)
    .then(response => { if (!response.ok) throw new Error('Album archive unavailable'); return response.json(); }))),
  fetch('./data/album-avatars.json')
    .then(response => response.ok ? response.json() : {})
    .catch(() => ({})),
]).then(([parts, memberAvatars]) => {
    avatars = memberAvatars;
    if (parts.some(part => !Array.isArray(part.albums))) throw new Error('Invalid album archive');
    entries = parts.flatMap(part => part.albums).filter(item => item.artist && item.album && item.date)
      .sort((a, b) => b.date.localeCompare(a.date));
    [...new Set(entries.map(item => item.date.slice(0, 4)))].sort().reverse().forEach(value => {
      const option = document.createElement('option'); option.value = value; option.textContent = value;
      year.append(option);
    });
    render(true);
  })
  .catch(() => { status.textContent = 'The album archive is being prepared.'; });
