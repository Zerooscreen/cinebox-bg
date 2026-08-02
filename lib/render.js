const SITE_NAME = 'CineBox';
const DEFAULT_TITLE = 'Филми онлайн 2026';
const DEFAULT_DESC = 'Гледайте любимите си филми и сериали онлайн с високо качество и български субтитри напълно безплатно.';

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
    <meta name="google-site-verification" content="M-_SCpf4h0A8JcaYgk3_kEfeagIFV6cKmqsg0iROtiI" />
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:url" content="${url}">
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
    <link rel="stylesheet" href="/style.css">
    <!-- Social Bar Adsterra -->
    <script src="https://pl30557736.effectivecpmnetwork.com/af/c1/6d/afc16d8a70f1f493abf2098939fca8f7.js"></script>
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
      <!-- Histats.com (div with counter hidden) -->
      <div id="histats_counter" style="display:none;"></div>
      <!-- Histats.com START (aync) -->
      <script type="text/javascript">var _Hasync= _Hasync|| [];
      _Hasync.push(['Histats.start', '1,5014113,4,1,120,40,00011111']);
      _Hasync.push(['Histats.fasi', '1']);
      _Hasync.push(['Histats.track_hits', '']);
      (function() {
      var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
      hs.src = ('//s10.histats.com/js15_as.js');
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
      })();</script>
      <noscript><a href="/" target="_blank"><img src="//sstatic1.histats.com/0.gif?5014113&101" alt="" border="0" style="display:none;"></a></noscript>
      <!-- Histats.com END -->
    </div>
  </footer>
  <!-- Popunder Adsterra -->
  <script src="https://pl30557735.effectivecpmnetwork.com/51/65/ed/5165ed7649b06fc95e9d3bbc1839dcd9.js"></script>
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

function detailTitle(item, tab = 'movie') {
  const title = item.title || item.name || 'Филм';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  return `[Гледай!!]— ${title} [${year}] Целият филм онлайн бг аудио`;
}

function genreRow(genres = []) {
  if (!genres.length) return '';
  return `<div class="genre-row">${genres.map(g => `<span class="genre-tag">${escapeHtml(g.name)}</span>`).join('')}</div>`;
}

function watchButtonBlock(id, title, tab = 'movie') {
  const itemSlug = slugify(title) || 'film';
  const targetUrl = `https://zeromovies4k.net/bg/${tab}/${id}/${itemSlug}`;

  return `
    <div class="watch-section" style="margin: 20px 0; text-align: left;">
      <button id="watch-btn" class="hero-btn" style="cursor:pointer; background: #e50914; color: #fff; padding: 12px 28px; font-size: 16px; font-weight: bold; border: none; border-radius: 4px; display: inline-flex; align-items: center; gap: 8px;">
        ▶ Гледай сега (Watch)
      </button>
    </div>
    <div id="countdown-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center;">
      <div style="background:#18181b; padding:30px; border-radius:8px; text-align:center; color:#fff; max-width:400px; width:90%; border:1px solid #333;">
        <h3 style="margin-bottom:15px; font-size:20px;">Подготовка на стрийма...</h3>
        <p style="margin-bottom:20px; color:#aaa;">Моля изчакайте, пренасочване към плейъра след:</p>
        <div id="countdown-number" style="font-size:48px; font-weight:bold; color:#e50914; margin-bottom:20px;">5</div>
        <p style="font-size:13px; color:#666;">zeromovies4k.net</p>
      </div>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const watchBtn = document.getElementById('watch-btn');
        const modal = document.getElementById('countdown-modal');
        const numEl = document.getElementById('countdown-number');
        if(watchBtn) {
          watchBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            let timeLeft = 5;
            numEl.textContent = timeLeft;
            const timer = setInterval(function() {
              timeLeft--;
              numEl.textContent = timeLeft;
              if(timeLeft <= 0) {
                clearInterval(timer);
                window.location.href = '${targetUrl}';
              }
            }, 1000);
          });
        }
      });
    </script>
  `;
}

function trailerBlock(videos = {}) {
  const results = videos.results || [];
  const trailer = results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || 
                    results.find(v => v.type === 'Teaser' && v.site === 'YouTube') || 
                    results.find(v => v.site === 'YouTube');
  if (!trailer) return '';
  return `
    <div class="section-block">
      <h3>Трейлър</h3>
      <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px;">
        <iframe src="https://www.youtube-nocookie.com/embed/${trailer.key}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function castGrid(credits = {}) {
  const cast = (credits.cast || []).slice(0, 12);
  if (!cast.length) return '<div class="empty-cast">Няма данни за актьорския състав.</div>';
  return `
    <div class="cast-grid">
      ${cast.map(c => `
        <a href="https://www.themoviedb.org/person/${c.id}" target="_blank" rel="nofollow" class="cast-card" style="text-decoration:none; color:inherit; display:block;">
          <img src="${img(c.profile_path, 'w185')}" alt="${escapeHtml(c.name)}" loading="lazy">
          <div class="cast-name">${escapeHtml(c.name)}</div>
          <div class="cast-character">${escapeHtml(c.character || '')}</div>
        </a>
      `).join('')}
    </div>
  `;
}

function similarGrid(items = [], tab = 'movie') {
  const filtered = (items || []).slice(0, 6);
  if (!filtered.length) return '';
  return `
    <div class="section-block">
      <h3>Подобни заглавия</h3>
      <div class="grid">
        ${filtered.map(item => posterCard(item, tab)).join('')}
      </div>
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

function banner728x90() {
  return `
    <div class="ad-container" style="text-align: center; margin: 20px 0; overflow-x: auto;">
      <script type="text/javascript">
        atOptions = {
          'key' : '9eab15e2d0d97de74e3ee971fe615a5e',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="https://www.highperformanceformat.com/9eab15e2d0d97de74e3ee971fe615a5e/invoke.js"></script>
    </div>
  `;
}

function banner468x60() {
  return `
    <div class="ad-container" style="text-align: center; margin: 20px 0; overflow-x: auto;">
      <script type="text/javascript">
        atOptions = {
          'key' : 'b4c5edd71dd22f2f3a51a8206816e9ac',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="https://www.highperformanceformat.com/b4c5edd71dd22f2f3a51a8206816e9ac/invoke.js"></script>
    </div>
  `;
}

function nativeBannerAd() {
  return `
    <div class="ad-container" style="text-align: center; margin: 20px 0;">
      <script async="async" data-cfasync="false" src="https://pl30557737.effectivecpmnetwork.com/6f7b03feb080b4884047d6210ed8268e/invoke.js"></script>
      <div id="container-6f7b03feb080b4884047d6210ed8268e"></div>
    </div>
  `;
}

module.exports = {
  head,
  layout,
  posterCard,
  genreRow,
  watchButtonBlock,
  trailerBlock,
  castGrid,
  similarGrid,
  escapeHtml,
  movieJsonLd,
  tvJsonLd,
  banner728x90,
  banner468x60,
  nativeBannerAd,
  detailTitle,
  DEFAULT_TITLE,
  DEFAULT_DESC,
  SITE_NAME,
};
