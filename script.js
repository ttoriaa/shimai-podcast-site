const API_BASE = window.__API_BASE__ || '';

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
  const card = document.createElement('article');
  card.className = 'episode-card';
  card.innerHTML = `
    <h3>${ep.title}</h3>
    <p>${ep.description || ''}</p>
    <div class="episode-meta">
      <span>${ep.category || ''}</span>
      <span>${ep.duration || ''}</span>
    </div>
    <div class="episode-actions">
      <a class="btn btn-secondary" href="episode.html?id=${ep.id}">查看</a>
      <a class="btn btn-primary" href="episode.html?id=${ep.id}">立即收听</a>
    </div>
  `;
  return card;
}

function renderEpisodeGrid(list, container) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = '<p class="no-results">暂无节目。</p>';
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
        <a href="episode.html?id=${ep.id}">${ep.title}</a>
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
    if (category === 'all') renderEpisodeGrid(episodes, episodeGrid);
    else renderEpisodeGrid(episodes.filter((e) => e.category === category), episodeGrid);
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
    if (formNote) formNote.textContent = '感谢你的留言，Vickie 会尽快回复你！';
    contactForm.reset();
  });
}

function createAssistantMessage(text, variant = 'assistant') {
  const message = document.createElement('div');
  message.className = `assistant-message ${variant}`;
  message.textContent = text;
  return message;
}

function setupAssistant() {
  const assistantForm = document.querySelector('#assistantForm');
  const assistantInput = document.querySelector('#assistantInput');
  const assistantMessages = document.querySelector('#assistantMessages');
  const quickContainer = document.querySelector('.assistant-quick');

  if (!assistantForm || !assistantInput || !assistantMessages) return;

  if (quickContainer && !quickContainer.querySelector('[data-rss-helper="1"]')) {
    const rssButton = document.createElement('button');
    rssButton.type = 'button';
    rssButton.className = 'assistant-quick-btn';
    rssButton.dataset.rssHelper = '1';
    rssButton.textContent = '解析 RSS 文本';
    quickContainer.appendChild(rssButton);
  }

  const quickButtons = document.querySelectorAll('.assistant-quick-btn');

  async function sendAssistantQuery(question) {
    const trimmed = question.trim();
    if (!trimmed) return;

    assistantMessages.appendChild(createAssistantMessage(trimmed, 'assistant-user'));
    assistantInput.value = '';

    const loadingMessage = createAssistantMessage('正在为你整理答案...', 'assistant-loading');
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
        assistantMessages.appendChild(createAssistantMessage('抱歉，助手暂时无法响应，请稍后再试。', 'assistant-error'));
      }
    } catch (error) {
      loadingMessage.remove();
      assistantMessages.appendChild(createAssistantMessage('网络请求失败，请检查后端服务是否已启动。', 'assistant-error'));
    } finally {
      assistantMessages.scrollTop = assistantMessages.scrollHeight;
    }
  }

  assistantInput.placeholder = '例如：解析一下 RSS 文本内容，并给我关键词';

  assistantForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendAssistantQuery(assistantInput.value);
  });

  quickButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.textContent.trim();
      assistantInput.value = preset;
      sendAssistantQuery(preset);
    });
  });
}

(async function init() {
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
