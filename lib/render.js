const SITE_NAME = 'CineBox';
const DEFAULT_TITLE = 'Филми онлайн 2026';
const DEFAULT_DESC = 'Гледайте любимите си филми и сериали онлайн с високо качество и български субтитри напълно безплатно.';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function head({ title = DEFAULT_TITLE, description = DEFAULT_DESC, url = '', image = '', type = 'website', robots = 'index, follow' }) {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="${escapeHtml(robots)}">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:url" content="${url}">
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
    <link rel="stylesheet" href="/style.css">
  `;
}

function layout({ headHtml, bodyHtml, activeTab = 'movie' }) {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
  ${headHtml}
</head>
<body>
  <header id="header">
    <div class="header-inner">
      <a class="logo" href="/">Cine<span>Box</span></a>
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Търсене на филми и сериали..." autocomplete="off">
        <div id="search-results"></div>
      </div>
      <nav class="nav-links">
        <a href="/movie" class="${activeTab === 'movie' ? 'active' : ''}">Филми</a>
        <a href="/tv" class="${activeTab === 'tv' ? 'active' : ''}">Сериали</a>
      </nav>
    </div>
  </header>
  <main id="main">
    ${bodyHtml}
  </main>
  <footer id="footer">
    <div class="footer-inner">
      <p>&copy; ${new Date().getFullYear()} CineBox. Всички права запазени.</p>
    </div>
  </footer>
  <script src="/app.js"></script>
</body>
</html>`;
}

function posterCard(item, tab = 'movie') {
  const title = item.title || item.name || 'media';
  const itemSlug = slugify(title) || 'details';
  const urlPath = `/${tab}/${item.id}/${encodeURIComponent(itemSlug)}`;

  return `
    <div class="poster-card">
      <a href="${urlPath}">
        <div class="poster-img-wrap">
          <img src="${img(item.poster_path)}" alt="${escapeHtml(title)}" loading="lazy">
          <div class="poster-rating">★ ${item.vote_average ? item.vote_average.toFixed(1) : '-'}</div>
        </div>
        <div class="poster-title">${escapeHtml(title)}</div>
        <div class="poster-year">${(item.release_date || item.first_air_date || '').slice(0, 4)}</div>
      </a>
    </div>
  `;
}

// Format judul halaman detail film sesuai permintaan
function detailTitle(item, tab = 'movie') {
  const title = item.title || item.name || 'Филм';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  return `[Гледай!!]— ${title} [${year}] Целият филм онлайн бг аудио`;
}

function genreRow(genres = []) {
  if (!genres.length) return '';
  return `<div class="genre-row">${genres.map(g => `<span class="genre-tag">${escapeHtml(g.name)}</span>`).join('')}</div>`;
}

function trailerBlock(videos = {}) {
  const results = videos.results || [];
  const trailer = results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || results.find(v => v.site === 'YouTube');
  if (!trailer) return '<div class="empty-trailer">Няма наличен трейлър.</div>';
  return `
    <div class="video-container">
      <iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(trailer.key)}" title="YouTube trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
  `;
}

function castGrid(credits = {}) {
  const cast = (credits.cast || []).slice(0, 12);
  if (!cast.length) return '<div class="empty-cast">Няма данни за актьорския състав.</div>';
  return `
    <div class="cast-grid">
      ${cast.map(c => `
        <div class="cast-card">
          <img src="${img(c.profile_path, 'w185')}" alt="${escapeHtml(c.name)}" loading="lazy">
          <div class="cast-name">${escapeHtml(c.name)}</div>
          <div class="cast-character">${escapeHtml(c.character || '')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function movieJsonLd(data, url) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": data.title,
    "description": data.overview,
    "image": img(data.poster_path, 'original'),
    "datePublished": data.release_date,
    "url": url,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.vote_average,
      "ratingCount": data.vote_count || 1
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

function tvJsonLd(data, url) {
  const json = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": data.name,
    "description": data.overview,
    "image": img(data.poster_path, 'original'),
    "startDate": data.first_air_date,
    "url": url,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.vote_average,
      "ratingCount": data.vote_count || 1
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

function sideBannerAd() {
  return `<div class="ad-banner side-banner"></div>`;
}

function nativeBannerAd() {
  return `<div class="ad-banner native-banner"></div>`;
}

function slugify(title = '') {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function img(path, size = 'w500') {
  const IMG = 'https://image.tmdb.org/t/p/';
  return path ? IMG + size + path : 'https://placehold.co/342x513/17171b/8d8a92?text=No+Image';
}

module.exports = {
  head,
  layout,
  posterCard,
  genreRow,
  trailerBlock,
  castGrid,
  escapeHtml,
  movieJsonLd,
  tvJsonLd,
  sideBannerAd,
  nativeBannerAd,
  detailTitle,
  DEFAULT_TITLE,
  DEFAULT_DESC,
  SITE_NAME,
};
