document.addEventListener('DOMContentLoaded', () => {
  // Search handling
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (searchInput && searchResults) {
    let timeout = null;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
        return;
      }

      timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();

          if (!data.results || data.results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 15px; text-align: center; font-size: 13px; color: #b3b3b3;">Няма намерени резултати</div>';
            searchResults.classList.add('active');
            return;
          }

          searchResults.innerHTML = data.results.map(item => `
            <a href="/${item.type}/${item.id}/${encodeURIComponent(item.slug)}" class="search-item">
              <img src="${item.poster}" alt="${item.title}">
              <div class="search-item-info">
                <div class="s-title">${item.title}</div>
                <div class="s-year">${item.type === 'movie' ? 'Филм' : 'Сериал'} · ${item.year || 'Няма дата'}</div>
              </div>
            </a>
          `).join('');

          searchResults.classList.add('active');
        } catch (err) {
          console.error(err);
        }
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }

  // Season & Episode accordion handling
  const seasonList = document.getElementById('season-list');
  if (seasonList) {
    seasonList.addEventListener('click', async (e) => {
      const item = e.target.closest('.season-item');
      if (!item) return;

      item.classList.toggle('open');
      const panel = item.querySelector('.episode-panel');

      if (item.classList.contains('open') && panel.innerHTML.trim() === '') {
        const tvId = item.dataset.tv;
        const seasonNumber = item.dataset.season;

        panel.innerHTML = '<div style="padding: 10px; text-align: center; color: #b3b3b3; font-size: 13px;">Зареждане на епизодите...</div>';

        try {
          const res = await fetch(`/api/season/${tvId}/${seasonNumber}`);
          const data = await res.json();

          if (!data.episodes || data.episodes.length === 0) {
            panel.innerHTML = '<div style="padding: 10px; text-align: center; color: #b3b3b3; font-size: 13px;">Няма налични епизоди.</div>';
            return;
          }

          panel.innerHTML = `
            <div class="episode-grid">
              ${data.episodes.map(ep => `
                <div class="episode-card">
                  <img src="${ep.still}" alt="${ep.name}" loading="lazy">
                  <div class="episode-info">
                    <div class="episode-title">${ep.number}. ${ep.name}</div>
                    <div class="episode-meta">Излъчен на: ${ep.airDate || 'Неизвестно'} · ★ ${ep.rating}</div>
                    <div class="episode-overview">${ep.overview ? ep.overview.slice(0, 120) + (ep.overview.length > 120 ? '...' : '') : 'Няма описания за този епизод.'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        } catch (err) {
          panel.innerHTML = '<div style="padding: 10px; text-align: center; color: #e50914; font-size: 13px;">Грешка при зареждане.</div>';
        }
      }
    });
  }
});
