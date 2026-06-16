const LANG = window.I18N?.lang || 'zh';

const EP_TEXT = {
  zh: {
    brand: '时髦小姨',
    navHome: '首页',
    navEpisodes: '节目',
    navAbout: '主持人',
    navContact: '联系',
    eyebrow: '全部节目',
    title: '按主题浏览每一集',
    desc: '点击任意一集进入单集页面，收听、收藏或分享给朋友。',
    filterAll: '全部',
    filterGrowth: '个人成长|碎碎念',
    filterCity: '何以丰荣|城市切片',
    filterTalk: '对谈Talk',
    view: '查看',
    listen: '收听',
    noResults: '暂无节目。',
    footer: '© 2026 时髦小姨 Podcast',
    categoryMap: {
      '个人成长|碎碎念': '个人成长|碎碎念',
      '何以丰荣|城市切片': '何以丰荣|城市切片',
      '对谈Talk': '对谈Talk'
    }
  },
  en: {
    brand: 'Chic Auntie',
    navHome: 'Home',
    navEpisodes: 'Episodes',
    navAbout: 'Host',
    navContact: 'Contact',
    eyebrow: 'All Episodes',
    title: 'Browse by Topic',
    desc: 'Open any episode page to listen, save, or share.',
    filterAll: 'All',
    filterGrowth: 'Personal Growth',
    filterCity: 'City Narratives',
    filterTalk: 'Talks',
    view: 'View',
    listen: 'Listen',
    noResults: 'No episodes found.',
    footer: '© 2026 Chic Auntie Podcast',
    categoryMap: {
      '个人成长|碎碎念': 'Personal Growth',
      '何以丰荣|城市切片': 'City Narratives',
      '对谈Talk': 'Talks'
    }
  }
};

const t = EP_TEXT[LANG];

const episodeGrid = document.querySelector('#episodeGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

function setText(id, value) {
  const node = document.querySelector(`#${id}`);
  if (node) node.textContent = value;
}

function localizeCategory(category) {
  return t.categoryMap[category] || category;
}

function applyPageTranslations() {
  setText('brandText', t.brand);
  setText('navHomeText', t.navHome);
  setText('navEpisodesText', t.navEpisodes);
  setText('navAboutText', t.navAbout);
  setText('navContactText', t.navContact);
  setText('episodesEyebrowText', t.eyebrow);
  setText('episodesTitleText', t.title);
  setText('episodesDescText', t.desc);
  setText('filterAllText', t.filterAll);
  setText('filterGrowthText', t.filterGrowth);
  setText('filterCityText', t.filterCity);
  setText('filterTalkText', t.filterTalk);
  setText('footerText', t.footer);

  if (window.I18N?.localizeLinks) {
    window.I18N.localizeLinks();
  }
}

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
  if (!episodes || episodes.length === 0) {
    episodeGrid.innerHTML = `<p class="no-results">${t.noResults}</p>`;
    return;
  }

  episodes.forEach((ep) => {
    const episodeUrl = window.I18N ? window.I18N.withLang(`episode.html?id=${ep.id}`, LANG) : `episode.html?id=${ep.id}`;
    const displayTitle = window.I18N?.getBilingualEpisodeTitle ? window.I18N.getBilingualEpisodeTitle(ep, LANG) : ep.title;
    const card = document.createElement('article');
    card.className = 'episode-card';
    card.innerHTML = `
      <h3><a href="${episodeUrl}">${displayTitle}</a></h3>
      <p>${ep.description}</p>
      <div class="episode-meta">
        <span>${localizeCategory(ep.category)}</span>
        <span>${ep.duration}</span>
      </div>
      <div class="episode-actions">
        <a class="btn btn-secondary" href="${episodeUrl}">${t.view}</a>
        <a class="btn btn-primary" href="${episodeUrl}">${t.listen}</a>
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
  applyPageTranslations();
  const eps = await loadEpisodes();
  renderList(eps);
})();
