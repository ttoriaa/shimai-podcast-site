const API_BASE = window.__API_BASE__ || '';
const LANG = window.I18N?.lang || 'zh';

const TEXT = {
  zh: {
    navBrand: '时髦小姨',
    navHome: '首页',
    navEpisodes: '节目',
    navAbout: '主持人',
    navContact: '联系',
    heroEyebrow: '新一季上线',
    heroTitle: '时髦小姨：熵增世界做熵减',
    heroDesc: '是 00 后初入职场的时髦小姨，也在狠狠经历奥德赛：在巴厘岛和小猴斗智斗勇、在罗马听海鸥的声音寻找古迹与现代的链接、在波伏娃幕前沉思、在加州当过 homeless、在夏威夷种地做园艺，以及各种待解锁形态……',
    heroPrimaryBtn: '立即收听',
    heroSecondaryBtn: '认识小姨',
    featuredEyebrow: '热门节目',
    featuredTitle: '时髦小姨的精选播客',
    featuredDesc: '每一集都有一句你会记住的日常提醒。跟着小姨，从听完到行动，都升级一点。',
    filterAll: '全部',
    filterGrowth: '个人成长|碎碎念',
    filterCity: '何以丰荣|城市切片',
    filterTalk: '对谈Talk',
    hostEyebrow: '主持人介绍',
    hostTitle: '时髦小姨｜李好烦',
    hostDesc: '在熵增世界做熵减。是初入职场的时髦小姨，也在狠狠经历奥德赛：在巴厘岛和小猴斗智斗勇、在罗马听海鸥寻找古迹与现代连接、在夏威夷种地做园艺、在加州做 homeless，在巴黎坐在波伏娃前沉思，以及各种待解锁形态。',
    hostBullet1: '女性主义｜一间属于自己的房间、波伏娃、上野千鹤子、伍尔夫...',
    hostBullet2: '何以丰荣｜城市切片、罗马在停留、巴黎在流动...',
    hostBullet3: '个人成长｜熵增世界做熵减...',
    hostNote: '“在熵增世界做熵减。”',
    ctaTitle: '订阅小姨的每一集',
    ctaDesc: '连载内容会优先推送给你：节目洞察、选题灵感、城市叙事与自我整理。',
    ctaBtn: '立即订阅',
    contactEyebrow: '联系我们',
    contactTitle: '有话想说？欢迎来信',
    contactDesc: '如果你想推荐话题、分享听后感，或者想和小姨一起做一集特别专辑，发邮件或扫码关注小姨社交。',
    emailLabel: '邮箱：',
    instagramLabel: 'Instagram：',
    nameLabel: '你的名字',
    emailInputLabel: '你的邮件',
    topicLabel: '想聊的话题',
    contactSubmit: '发送消息',
    footer: '© 2026 时髦小姨 Podcast · 熵增世界做熵减',
    modalTitle: '最新一期预览',
    modalDesc: '小姨带你快速听一段节目预览，9分钟轻松入门。',
    audioFallback: '你的浏览器不支持音频播放。',
    view: '查看',
    listenNow: '立即收听',
    noResults: '暂无节目。',
    formThanks: '感谢你的留言，Vickie 会尽快回复你！',
    assistantLoading: '正在为你整理答案...',
    assistantNoResponse: '抱歉，助手暂时无法响应，请稍后再试。',
    assistantNetworkError: '网络请求失败，请检查后端服务是否已启动。',
    assistantPlaceholder: '例如：一个介绍 / 一些新话题 / 最近在聊什么',
    categoryMap: {
      '个人成长|碎碎念': '个人成长|碎碎念',
      '何以丰荣|城市切片': '何以丰荣|城市切片',
      '对谈Talk': '对谈Talk'
    }
  },
  en: {
    navBrand: 'Chic Auntie',
    navHome: 'Home',
    navEpisodes: 'Episodes',
    navAbout: 'Host',
    navContact: 'Contact',
    heroEyebrow: 'New Season Live',
    heroTitle: 'Chic Auntie: Creating Order in an Entropic World',
    heroDesc: 'A Gen Z host stepping into work life while living her own odyssey, from Bali and Rome to Hawaii, California, and Paris. This podcast connects culture, growth, and everyday clarity.',
    heroPrimaryBtn: 'Listen Now',
    heroSecondaryBtn: 'Meet Vickie',
    featuredEyebrow: 'Trending Episodes',
    featuredTitle: 'Featured Episodes',
    featuredDesc: 'Each episode gives you one practical idea worth taking into real life.',
    filterAll: 'All',
    filterGrowth: 'Personal Growth',
    filterCity: 'City Narratives',
    filterTalk: 'Talks',
    hostEyebrow: 'Host Profile',
    hostTitle: 'Chic Auntie | Vickie Li',
    hostDesc: 'Vickie explores how to build personal order in a fast-moving world, with stories across cities, culture, and growth moments.',
    hostBullet1: 'Feminism: A Room of One\'s Own, Beauvoir, Chizuko Ueno, Woolf...',
    hostBullet2: 'City Narratives: Rome in stillness, Paris in motion...',
    hostBullet3: 'Personal Growth: reducing noise in an entropic world...',
    hostNote: '"Create order where entropy keeps rising."',
    ctaTitle: 'Subscribe to Every Episode',
    ctaDesc: 'Get episode insights, story ideas, and thoughtful notes delivered first.',
    ctaBtn: 'Subscribe',
    contactEyebrow: 'Contact',
    contactTitle: 'Have Something to Share?',
    contactDesc: 'Suggest topics, share your thoughts, or co-create a special episode with us.',
    emailLabel: 'Email:',
    instagramLabel: 'Instagram:',
    nameLabel: 'Your Name',
    emailInputLabel: 'Your Email',
    topicLabel: 'Your Topic',
    contactSubmit: 'Send Message',
    footer: '© 2026 Chic Auntie Podcast · Creating Order in an Entropic World',
    modalTitle: 'Latest Episode Preview',
    modalDesc: 'A quick 9-minute preview to help you jump in fast.',
    audioFallback: 'Your browser does not support audio playback.',
    view: 'View',
    listenNow: 'Listen',
    noResults: 'No episodes found.',
    formThanks: 'Thanks for your message. Vickie will get back to you soon.',
    assistantLoading: 'Thinking through your question...',
    assistantNoResponse: 'Sorry, the assistant is unavailable for now. Please try again later.',
    assistantNetworkError: 'Network request failed. Please check whether the backend service is running.',
    assistantPlaceholder: 'e.g. Overview / New topic ideas / What have we discussed lately',
    categoryMap: {
      '个人成长|碎碎念': 'Personal Growth',
      '何以丰荣|城市切片': 'City Narratives',
      '对谈Talk': 'Talks'
    }
  }
};

const t = TEXT[LANG];

const PRESET_QUERY_MAP = {
  '一个介绍': '给我一个整体 overview',
  '一些新话题': '帮我想新的播客话题',
  '最近在聊什么': '总结最新一集内容'
};

function setText(id, value) {
  const node = document.querySelector(`#${id}`);
  if (node) node.textContent = value;
}

function applyStaticTranslations() {
  setText('brandText', t.navBrand);
  setText('navHomeText', t.navHome);
  setText('navEpisodesText', t.navEpisodes);
  setText('navAboutText', t.navAbout);
  setText('navContactText', t.navContact);
  setText('heroEyebrowText', t.heroEyebrow);
  setText('heroTitleText', t.heroTitle);
  setText('heroDescText', t.heroDesc);
  setText('heroPrimaryBtnText', t.heroPrimaryBtn);
  setText('heroSecondaryBtnText', t.heroSecondaryBtn);
  setText('featuredEyebrowText', t.featuredEyebrow);
  setText('featuredTitleText', t.featuredTitle);
  setText('featuredDescText', t.featuredDesc);
  setText('filterAllText', t.filterAll);
  setText('filterGrowthText', t.filterGrowth);
  setText('filterCityText', t.filterCity);
  setText('filterTalkText', t.filterTalk);
  setText('hostEyebrowText', t.hostEyebrow);
  setText('hostTitleText', t.hostTitle);
  setText('hostDescText', t.hostDesc);
  setText('hostBullet1Text', t.hostBullet1);
  setText('hostBullet2Text', t.hostBullet2);
  setText('hostBullet3Text', t.hostBullet3);
  setText('hostNoteText', t.hostNote);
  setText('ctaTitleText', t.ctaTitle);
  setText('ctaDescText', t.ctaDesc);
  setText('ctaBtnText', t.ctaBtn);
  setText('contactEyebrowText', t.contactEyebrow);
  setText('contactTitleText', t.contactTitle);
  setText('contactDescText', t.contactDesc);
  setText('emailLabelText', t.emailLabel);
  setText('instagramLabelText', t.instagramLabel);
  setText('nameLabelText', t.nameLabel);
  setText('emailInputLabelText', t.emailInputLabel);
  setText('topicLabelText', t.topicLabel);
  setText('contactSubmitText', t.contactSubmit);
  setText('footerText', t.footer);
  setText('modalTitleText', t.modalTitle);
  setText('modalDescText', t.modalDesc);
  setText('audioFallbackText', t.audioFallback);

  const nameInput = document.querySelector('#nameInput');
  const emailInput = document.querySelector('#emailInput');
  const messageInput = document.querySelector('#messageInput');
  if (nameInput) nameInput.placeholder = LANG === 'en' ? 'E.g. Jackie' : 'E.G. Jackie...';
  if (emailInput) emailInput.placeholder = 'example@mail.com';
  if (messageInput) {
    messageInput.placeholder =
      LANG === 'en'
        ? 'I would love to talk about episode ideas, city narratives, or collaborations...'
        : '我想聊节目内容、选题灵感或城市叙事...';
  }
}

function localizeCategory(category) {
  return t.categoryMap[category] || category;
}

async function fetchEpisodes() {
  try {
    const res = await fetch('episodes.json');
    return await res.json();
  } catch (err) {
    console.error('加载 episodes.json 失败：', err);
    return [];
  }
}

function createEpisodeCard(ep) {
  const episodeUrl = window.I18N ? window.I18N.withLang(`episode.html?id=${ep.id}`, LANG) : `episode.html?id=${ep.id}`;
  const displayTitle = window.I18N?.getBilingualEpisodeTitle ? window.I18N.getBilingualEpisodeTitle(ep, LANG) : ep.title;
  const card = document.createElement('article');
  card.className = 'episode-card';
  card.innerHTML = `
    <h3>${displayTitle}</h3>
    <p>${ep.description || ''}</p>
    <div class="episode-meta">
      <span>${localizeCategory(ep.category || '')}</span>
      <span>${ep.duration || ''}</span>
    </div>
    <div class="episode-actions">
      <a class="btn btn-secondary" href="${episodeUrl}">${t.view}</a>
      <a class="btn btn-primary" href="${episodeUrl}">${t.listenNow}</a>
    </div>
  `;
  return card;
}

function renderEpisodeGrid(list, container) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = `<p class="no-results">${t.noResults}</p>`;
    return;
  }
  list.forEach((ep) => container.appendChild(createEpisodeCard(ep)));
}

function renderHeroEpisodes(list, root, count = 3) {
  if (!root) return;
  const subset = list.slice(0, count);
  root.innerHTML = subset
    .map(
      (ep) => `
      <div class="hero-ep">
        <a href="${window.I18N ? window.I18N.withLang(`episode.html?id=${ep.id}`, LANG) : `episode.html?id=${ep.id}`}">${window.I18N?.getBilingualEpisodeTitle ? window.I18N.getBilingualEpisodeTitle(ep, LANG) : ep.title}</a>
        <div class="meta">${ep.date || ''} · ${ep.duration || ''}</div>
      </div>
    `
    )
    .join('');
}

function setupFilters(episodes) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const episodeGrid = document.querySelector('#episodeGrid');
  if (!episodeGrid) return;

  function applyFilter(category) {
    if (category === 'all') {
      renderEpisodeGrid(episodes, episodeGrid);
    } else {
      renderEpisodeGrid(episodes.filter((e) => e.category === category), episodeGrid);
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.category);
    });
  });
}

function setupPreviewModal() {
  const heroPlayBtn = document.querySelector('#heroPlayBtn');
  const previewModal = document.querySelector('#previewModal');
  const modalCloseBtn = document.querySelector('#modalCloseBtn');

  if (!heroPlayBtn || !previewModal || !modalCloseBtn) return;

  heroPlayBtn.addEventListener('click', () => {
    previewModal.classList.add('open');
    previewModal.setAttribute('aria-hidden', 'false');
  });

  modalCloseBtn.addEventListener('click', () => {
    previewModal.classList.remove('open');
    previewModal.setAttribute('aria-hidden', 'true');
  });

  previewModal.addEventListener('click', (event) => {
    if (event.target === previewModal) {
      previewModal.classList.remove('open');
      previewModal.setAttribute('aria-hidden', 'true');
    }
  });
}

function setupContactForm() {
  const contactForm = document.querySelector('#contactForm');
  const formNote = document.querySelector('#formNote');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (formNote) formNote.textContent = t.formThanks;
    contactForm.reset();
  });
}

function createAssistantMessage(text, variant = 'assistant') {
  const message = document.createElement('div');
  message.className = `assistant-message ${variant}`;
  message.textContent = text;
  return message;
}

function mapPresetToQuery(preset) {
  const label = (preset || '').trim();
  return PRESET_QUERY_MAP[label] || label;
}

function setupAssistant() {
  const assistantForm = document.querySelector('#assistantForm');
  const assistantInput = document.querySelector('#assistantInput');
  const assistantMessages = document.querySelector('#assistantMessages');

  if (!assistantForm || !assistantInput || !assistantMessages) return;

  const quickButtons = document.querySelectorAll('.assistant-quick-btn');

  async function sendAssistantQuery(question, displayQuestion) {
    const trimmed = (question || '').trim();
    if (!trimmed) return;

    const visibleQuestion = (displayQuestion || trimmed).trim() || trimmed;
    assistantMessages.appendChild(createAssistantMessage(visibleQuestion, 'assistant-user'));
    assistantInput.value = '';

    const loadingMessage = createAssistantMessage(t.assistantLoading, 'assistant-loading');
    assistantMessages.appendChild(loadingMessage);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;

    try {
      const response = await fetch(`${API_BASE}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });
      const payload = await response.json();
      loadingMessage.remove();

      if (response.ok && payload && payload.answer) {
        assistantMessages.appendChild(createAssistantMessage(payload.answer, 'assistant'));
      } else if (payload && payload.error) {
        assistantMessages.appendChild(createAssistantMessage(payload.error, 'assistant-error'));
      } else {
        assistantMessages.appendChild(createAssistantMessage(t.assistantNoResponse, 'assistant-error'));
      }
    } catch (error) {
      loadingMessage.remove();
      assistantMessages.appendChild(createAssistantMessage(t.assistantNetworkError, 'assistant-error'));
    } finally {
      assistantMessages.scrollTop = assistantMessages.scrollHeight;
    }
  }

  assistantInput.placeholder = t.assistantPlaceholder;

  assistantForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendAssistantQuery(assistantInput.value);
  });

  quickButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.textContent.trim();
      const mapped = mapPresetToQuery(preset);
      assistantInput.value = preset;
      sendAssistantQuery(mapped, preset);
    });
  });
}

(async function init() {
  applyStaticTranslations();
  if (window.I18N?.localizeLinks) window.I18N.localizeLinks();

  const episodes = await fetchEpisodes();

  const episodeGrid = document.querySelector('#episodeGrid');
  const heroEpisodesRoot = document.querySelector('#heroEpisodes');

  if (episodeGrid) renderEpisodeGrid(episodes, episodeGrid);
  if (heroEpisodesRoot) renderHeroEpisodes(episodes, heroEpisodesRoot, 3);

  setupFilters(episodes);
  setupPreviewModal();
  setupContactForm();
  setupAssistant();
})();
