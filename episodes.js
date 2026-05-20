const episodeGrid = document.querySelector('#episodeGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

async function loadEpisodes() {
  try {
    const res = await fetch('episodes.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('加载节目数据失败', err);
    return [];
  }
}

function renderList(episodes) {
  episodeGrid.innerHTML = '';
  episodes.forEach((ep) => {
    const card = document.createElement('article');
    card.className = 'episode-card';
    card.innerHTML = `
      <h3><a href="episode.html?id=${ep.id}">${ep.title}</a></h3>
      <p>${ep.description}</p>
      <div class="episode-meta">
        <span>${ep.category}</span>
        <span>${ep.duration}</span>
      </div>
      <div class="episode-actions">
        <a class="btn btn-secondary" href="episode.html?id=${ep.id}">查看</a>
        <a class="btn btn-primary" href="episode.html?id=${ep.id}">收听</a>
      </div>
    `;
    episodeGrid.appendChild(card);
  });
}

function applyFilter(episodes, category) {
  if (category === 'all') return episodes;
  return episodes.filter((e) => e.category === category);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const category = button.dataset.category;
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    const eps = await loadEpisodes();
    renderList(applyFilter(eps, category));
  });
});

(async function init() {
  const eps = await loadEpisodes();
  renderList(eps);
})();
