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

  function formatMultiline(raw) {
    if (!raw) return '';
    const withBreaks = raw.replace(/<br\s*\/?>/gi, '\n');
    const stripped = withBreaks.replace(/<[^>]+>/g, '');
    return escapeHtml(stripped).trim().replace(/\n{2,}/g, '\n\n').replace(/\n/g, '<br>');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

  function buildBookModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'book-modal-backdrop';
    backdrop.id = 'book-modal-backdrop';
    backdrop.innerHTML = `
      <div class="book-modal" role="dialog" aria-modal="true" aria-label="Book details">
        <button class="book-modal-close" id="book-modal-close" type="button" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="book-modal-body">
          <img class="book-modal-cover" id="book-modal-cover" src="" alt="">
          <div class="book-modal-info">
            <h2 class="book-modal-title" id="book-modal-title"></h2>
            <p class="book-modal-author" id="book-modal-author"></p>
            <div class="book-modal-rating" id="book-modal-rating"></div>
            <p class="book-modal-date" id="book-modal-date"></p>
            <div class="book-modal-review" id="book-modal-review"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const closeBtn = backdrop.querySelector('#book-modal-close');
    const close = () => {
      backdrop.classList.remove('open');
      backdrop.querySelector('.book-modal').classList.remove('open');
    };
    const open = (book) => {
      backdrop.querySelector('#book-modal-cover').src = book.cover || '';
      backdrop.querySelector('#book-modal-cover').alt = book.title;
      backdrop.querySelector('#book-modal-title').textContent = book.title;
      backdrop.querySelector('#book-modal-author').textContent = book.author || '';
      backdrop.querySelector('#book-modal-rating').innerHTML = book.rating
        ? Array.from({ length: book.rating }, () => '<span class="star filled">★</span>').join('')
        : '';
      backdrop.querySelector('#book-modal-date').textContent = book.readAt ? `Read ${formatDate(book.readAt)}` : '';
      const reviewText = book.review ? formatMultiline(book.review) : '';
      const reviewEl = backdrop.querySelector('#book-modal-review');
      reviewEl.innerHTML = reviewText ? `<p class="book-modal-review-label">My review</p><p>${reviewText}</p>` : '';
      reviewEl.style.display = reviewEl.innerHTML ? '' : 'none';
      backdrop.classList.add('open');
      backdrop.querySelector('.book-modal').classList.add('open');
    };

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
    });

    return { open };
  }

  async function initBookshelfGrid() {
    const root = document.getElementById('bookshelf-grid-root');
    if (!root) return;
    const shelf = root.dataset.shelf;
    try {
      const books = await fetchBooks(shelf);
      books.sort((a, b) => new Date(b.readAt || b.dateAdded) - new Date(a.readAt || a.dateAdded));

      root.innerHTML = books.map((book, i) => `
        <button type="button" class="book-card" data-idx="${i}">
          <div class="book-card-cover">
            ${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)}" loading="lazy">` : '<div class="book-card-placeholder"></div>'}
          </div>
          <div class="book-card-body">
            <div class="book-card-title">${escapeHtml(truncate(book.title, 35))}</div>
            ${book.author ? `<div class="book-card-author">${escapeHtml(book.author)}</div>` : ''}
            ${book.readAt ? `<div class="book-card-date">Read ${formatDate(book.readAt)}</div>` : ''}
            ${book.rating ? `
              <div class="book-card-rating">
                ${Array.from({ length: book.rating }, () => '<span class="star filled">★</span>').join('')}
              </div>
            ` : ''}
          </div>
        </button>
      `).join('');

      const modal = buildBookModal();
      root.addEventListener('click', (e) => {
        const card = e.target.closest('.book-card');
        if (!card) return;
        modal.open(books[Number(card.dataset.idx)]);
      });
    } catch (err) {
      root.innerHTML = '<p class="empty-state">Could not load the bookshelf right now — try refreshing.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHomeReading();
    initBookshelfGrid();
  });
}());
