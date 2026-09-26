const list = document.querySelector('#album-list');
const status = document.querySelector('#album-status');
const search = document.querySelector('#album-search');
const year = document.querySelector('#album-year');
const more = document.querySelector('#album-more');
let entries = [];
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
  const meta = document.createElement('div'); meta.className = 'album-meta';
  const poster = document.createElement('strong'); poster.textContent = entry.poster || 'Forum member';
  const date = document.createElement('time'); date.dateTime = entry.date; date.textContent = entry.date;
  meta.append(poster, date); card.append(meta);
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
fetch('./albums.json')
  .then(response => { if (!response.ok) throw new Error('Album archive unavailable'); return response.json(); })
  .then(data => {
    if (!Array.isArray(data.albums)) throw new Error('Invalid album archive');
    entries = data.albums.filter(item => item.artist && item.album && item.date)
      .sort((a, b) => b.date.localeCompare(a.date));
    [...new Set(entries.map(item => item.date.slice(0, 4)))].sort().reverse().forEach(value => {
      const option = document.createElement('option'); option.value = value; option.textContent = value;
      year.append(option);
    });
    render(true);
  })
  .catch(() => { status.textContent = 'The album archive is being prepared.'; });
