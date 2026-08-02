document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) return;

  let timeout = null;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('show');
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) {
          searchResults.innerHTML = '<div class="empty">Няма намерени резултати.</div>';
          searchResults.classList.add('show');
          return;
        }

        searchResults.innerHTML = data.results.slice(0, 6).map(item => {
          const title = item.title || item.name || '';
          const year = (item.release_date || item.first_air_date || '').slice(0, 4);
          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://placehold.co/36x54/17171b/8d8a92?text=No';
          const type = item.media_type || (item.title ? 'movie' : 'tv');

          return `
            <a href="/${type}/${item.id}" class="sr-item">
              <img src="${poster}" alt="${title}">
              <div>
                <div class="sr-title">${title}</div>
                <div class="sr-meta">${year} • ★ ${item.vote_average ? item.vote_average.toFixed(1) : '-'}</div>
              </div>
            </a>
          `;
        }).join('');

        searchResults.classList.add('show');
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });
});
