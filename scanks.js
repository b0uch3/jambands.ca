const grid = document.querySelector('#scanks-grid');
const progress = document.querySelector('#scanks-progress');
const shuffleButton = document.querySelector('#scanks-shuffle');
const revealButton = document.querySelector('#scanks-reveal');
let scanks = [];

function updateProgress() {
  const revealed = grid.querySelectorAll('.scank-card[aria-pressed="true"]').length;
  progress.textContent = `${revealed} of ${scanks.length} Scanks revealed · Tap an avatar to ${revealed === scanks.length ? 'hide' : 'reveal'} a name`;
  revealButton.textContent = revealed === scanks.length ? 'Hide all' : 'Reveal all';
}

function setRevealed(button, revealed) {
  button.setAttribute('aria-pressed', String(revealed));
  button.querySelector('.scank-name').textContent = revealed ? button.dataset.name : '?';
  button.setAttribute('aria-label', revealed ? `${button.dataset.name}. Hide name` : `Reveal Scank ${button.dataset.position}`);
}

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function render() {
  const fragment = document.createDocumentFragment();
  shuffled(scanks).forEach(({name, avatar}, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const image = document.createElement('img');
    const label = document.createElement('span');
    button.type = 'button';
    button.className = 'scank-card';
    button.dataset.name = name;
    button.dataset.position = index + 1;
    image.src = avatar;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 100;
    image.height = 100;
    label.className = 'scank-name';
    button.append(image, label);
    setRevealed(button, false);
    button.addEventListener('click', () => {
      setRevealed(button, button.getAttribute('aria-pressed') !== 'true');
      updateProgress();
    });
    item.append(button);
    fragment.append(item);
  });
  grid.replaceChildren(fragment);
  updateProgress();
}

shuffleButton.disabled = true;
revealButton.disabled = true;
shuffleButton.addEventListener('click', render);
revealButton.addEventListener('click', () => {
  const reveal = revealButton.textContent === 'Reveal all';
  grid.querySelectorAll('.scank-card').forEach(button => setRevealed(button, reveal));
  updateProgress();
});

fetch('./data/scanks.json')
  .then(response => { if (!response.ok) throw new Error('Scank archive unavailable'); return response.json(); })
  .then(data => {
    if (!Array.isArray(data.scanks)) throw new Error('Invalid Scank archive');
    scanks = data.scanks.filter(person => typeof person.name === 'string' && /^assets\/members\/\d+\.(?:jpg|jpeg|png|gif|webp)$/i.test(person.avatar));
    if (!scanks.length) throw new Error('No saved avatars');
    shuffleButton.disabled = false;
    revealButton.disabled = false;
    render();
  })
  .catch(() => { progress.textContent = 'The avatar archive could not be loaded. Try refreshing this page.'; });
