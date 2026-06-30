// Renders the home "Reading Now" ticker and the /bookshelf/ grid from
// Goodreads RSS feeds, via a self-hosted Val Town proxy that fetches the
// feeds server-side (Goodreads itself sends no CORS headers) and returns
// parsed JSON with CORS scoped to this site.
(function () {
  const PROXY_BASE = 'https://niallxd--08620c4074c811f19cf01607ee4eb77e.web.val.run';

  async function fetchBooks(shelf) {
    const res = await fetch(`${PROXY_BASE}/?shelf=${encodeURIComponent(shelf)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const books = await res.json();
    if (!Array.isArray(books)) throw new Error('Unexpected proxy response');
    return books;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function truncate(str, max) {
    return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
  }

  function readingCardHtml(book) {
    return `
      <a href="/bookshelf/" class="home-reading-card">
        ${book.cover ? `<img class="home-reading-cover" src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy">` : ''}
        <div class="home-reading-info">
          <p class="home-reading-title">${escapeHtml(book.title)}</p>
          ${book.author ? `<p class="home-reading-author">${escapeHtml(book.author)}</p>` : ''}
        </div>
      </a>
    `;
  }

  async function initHomeReading() {
    const root = document.getElementById('home-reading-root');
    if (!root) return;
    const shelf = root.dataset.shelf;
    try {
      const books = await fetchBooks(shelf);
      if (!books.length) throw new Error('No books currently reading');

      if (books.length === 1) {
        root.innerHTML = readingCardHtml(books[0]);
        return;
      }

      root.innerHTML = `
        <div class="home-reading-ticker">
          ${books.map((b, i) => `<div class="home-reading-ticker-slide${i === 0 ? ' active' : ''}">${readingCardHtml(b)}</div>`).join('')}
        </div>
        <div class="home-reading-ticker-dots">
          ${books.map((_, i) => `<span class="home-reading-ticker-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
        </div>
      `;

      const slides = root.querySelectorAll('.home-reading-ticker-slide');
      const dots = root.querySelectorAll('.home-reading-ticker-dot');
      let active = 0;
      setInterval(() => {
        slides[active].classList.remove('active');
        dots[active].classList.remove('active');
        active = (active + 1) % slides.length;
        slides[active].classList.add('active');
        dots[active].classList.add('active');
      }, 5000);
    } catch (err) {
      root.innerHTML = `
        <div class="home-reading-card home-reading-card--empty">
          <p class="home-reading-empty">Nothing on the shelf right now.</p>
        </div>
      `;
    }
  }

  async function initBookshelfGrid() {
    const root = document.getElementById('bookshelf-grid-root');
    if (!root) return;
    const shelf = root.dataset.shelf;
    try {
      const books = await fetchBooks(shelf);
      books.sort((a, b) => new Date(b.readAt || b.dateAdded) - new Date(a.readAt || a.dateAdded));

      root.innerHTML = books.map((book) => `
        <div class="book-card">
          <div class="book-card-cover">
            ${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy">` : '<div class="book-card-placeholder"></div>'}
          </div>
          <div class="book-card-body">
            <div class="book-card-title">${escapeHtml(truncate(book.title, 35))}</div>
            ${book.author ? `<div class="book-card-author">${escapeHtml(book.author)}</div>` : ''}
            ${book.readAt ? `<div class="book-card-date">Read ${new Date(book.readAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>` : ''}
            ${book.rating ? `
              <div class="book-card-rating">
                ${Array.from({ length: book.rating }, () => '<span class="star filled">★</span>').join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      root.innerHTML = '<p class="empty-state">Could not load the bookshelf right now — try refreshing.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHomeReading();
    initBookshelfGrid();
  });
}());
