const parameters = new URLSearchParams(location.search);
const topicId = parameters.get('id') || '';
const requestedPage = Number(parameters.get('page') || 1);
const title = document.querySelector('#topic-title');
const meta = document.querySelector('#topic-meta');
const posts = document.querySelector('#topic-posts');

function pageLink(page) {
  return `topic.html?id=${encodeURIComponent(topicId)}&page=${page}`;
}

function pager(element, page, total) {
  const previous = document.createElement('a');
  previous.textContent = '← Previous';
  previous.href = pageLink(Math.max(1, page - 1));
  if (page === 1) previous.setAttribute('aria-disabled', 'true');
  const status = document.createElement('span');
  status.textContent = `Page ${page.toLocaleString('en-CA')} of ${total.toLocaleString('en-CA')}`;
  const next = document.createElement('a');
  next.textContent = 'Next →';
  next.href = pageLink(Math.min(total, page + 1));
  if (page === total) next.setAttribute('aria-disabled', 'true');
  element.replaceChildren(previous, status, next);
}

function showError(message) {
  title.textContent = 'Conversation unavailable';
  posts.replaceChildren();
  const error = document.createElement('p');
  error.className = 'topic-error';
  error.setAttribute('role', 'alert');
  error.textContent = message;
  posts.append(error);
}

async function showTopic() {
  if (!/^\d{1,8}$/.test(topicId) || !Number.isSafeInteger(requestedPage) || requestedPage < 1) {
    throw new Error('Choose a conversation from Community Stats.');
  }
  const manifestResponse = await fetch('data/threads/manifest.json');
  if (!manifestResponse.ok) throw new Error('The archived conversations are not available yet.');
  const manifest = await manifestResponse.json();
  const info = manifest.topics[topicId];
  if (!info) throw new Error('That conversation is not in the archive.');
  if (requestedPage > info.pages) throw new Error('That page is not in the archive.');
  const response = await fetch(`data/threads/${topicId}/page-${requestedPage}.json`);
  if (!response.ok) throw new Error('This page of posts could not be loaded.');
  const data = await response.json();
  if (data.topicId !== Number(topicId) || data.page !== requestedPage || !Array.isArray(data.posts)) {
    throw new Error('This page of posts could not be read.');
  }
  document.title = `${info.title} · Jambands.ca archive`;
  title.textContent = info.title;
  meta.textContent = `Started by ${info.starter} · ${info.started} · ${info.posts.toLocaleString('en-CA')} preserved posts`;
  const fragment = document.createDocumentFragment();
  data.posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'topic-post';
    article.id = `post-${post.id}`;
    const author = document.createElement('div');
    author.className = 'topic-post-author';
    author.textContent = post.author || 'Guest';
    const date = document.createElement('time');
    date.className = 'topic-post-date';
    date.dateTime = post.date;
    date.textContent = post.date;
    author.append(date);
    const body = document.createElement('div');
    body.className = 'topic-post-body';
    body.textContent = post.text;
    article.append(author, body);
    fragment.append(article);
  });
  posts.replaceChildren(fragment);
  pager(document.querySelector('#topic-pager-top'), requestedPage, info.pages);
  pager(document.querySelector('#topic-pager-bottom'), requestedPage, info.pages);
}

showTopic().catch(error => showError(error.message));
