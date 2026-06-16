function qs(param) {
  return new URLSearchParams(location.search).get(param);
}

const LANG = window.I18N?.lang || 'zh';
const T = {
  zh: {
    brand: '时髦小姨',
    navHome: '首页',
    navEpisodes: '节目',
    navAbout: '主持人',
    navContact: '联系',
    notFoundTitle: '未找到该集',
    notFoundBody: '可能链接已过期或输入错误，',
    backToList: '返回节目列表',
    audioUnsupported: '你的浏览器不支持音频播放。',
    notesTitle: '节目时间轴',
    saveEpisode: '收藏本集',
    openAudioFallback: '在新窗口打开音频文件（备用）',
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
    notFoundTitle: 'Episode Not Found',
    notFoundBody: 'The link may be expired or invalid. ',
    backToList: 'Back to Episodes',
    audioUnsupported: 'Your browser does not support audio playback.',
    notesTitle: 'Show Notes Timeline',
    saveEpisode: 'Save Episode',
    openAudioFallback: 'Open audio in a new tab (fallback)',
    footer: '© 2026 Chic Auntie Podcast',
    categoryMap: {
      '个人成长|碎碎念': 'Personal Growth',
      '何以丰荣|城市切片': 'City Narratives',
      '对谈Talk': 'Talks'
    }
  }
}[LANG];

function setText(id, value) {
  const node = document.querySelector(`#${id}`);
  if (node) node.textContent = value;
}

function localizedCategory(category) {
  return T.categoryMap[category] || category;
}

function localizedEpisodeTitle(ep) {
  if (window.I18N?.getBilingualEpisodeTitle) {
    return window.I18N.getBilingualEpisodeTitle(ep, LANG);
  }
  return ep?.title || '';
}

function applyShellTranslations() {
  setText('brandText', T.brand);
  setText('navHomeText', T.navHome);
  setText('navEpisodesText', T.navEpisodes);
  setText('navAboutText', T.navAbout);
  setText('navContactText', T.navContact);
  setText('footerText', T.footer);

  if (window.I18N?.localizeLinks) {
    window.I18N.localizeLinks();
  }

  const episodeId = qs('id');
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const nextLang = btn.getAttribute('data-lang') || 'zh';
    btn.setAttribute('href', `episode.html?id=${episodeId || ''}&lang=${nextLang}`);
  });
}

async function loadEpisodes() {
  try {
    const res = await fetch('episodes.json');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderEpisode(ep) {
  const root = document.getElementById('episodeRoot');
  if (!ep) {
    const backUrl = window.I18N ? window.I18N.withLang('episodes.html', LANG) : 'episodes.html';
    root.innerHTML = `<div class="card"><h3>${T.notFoundTitle}</h3><p>${T.notFoundBody}<a href="${backUrl}">${T.backToList}</a></p></div>`;
    return;
  }

  const audioId = 'episodeAudio';
  const backUrl = window.I18N ? window.I18N.withLang('episodes.html', LANG) : 'episodes.html';
  root.innerHTML = `
    <article class="episode-card">
      <h1 style="font-size:1.8rem; margin-bottom:8px;">${localizedEpisodeTitle(ep)}</h1>
      <div style="color:var(--muted); margin-bottom:14px;">${localizedCategory(ep.category)} · ${ep.duration} ${ep.date ? '· ' + ep.date : ''}</div>
      <p style="margin-bottom:18px; color:var(--muted);">${ep.description}</p>
      <audio controls id="${audioId}" style="width:100%; margin-bottom:16px;" crossorigin="anonymous">
        ${T.audioUnsupported}
      </audio>
      ${ep.showNotes && ep.showNotes.length ? `<section class="show-notes" style="margin-bottom:16px;"><h4>${T.notesTitle}</h4><ol id="showNotesList" style="padding-left:18px;"></ol></section>` : ''}
      <div style="display:flex; gap:12px;"><a class="btn btn-secondary" href="${backUrl}">${T.backToList}</a><a class="btn btn-primary" href="#">${T.saveEpisode}</a></div>
    </article>
  `;

  // render show notes and attach click-to-seek handlers
  const audioEl = document.getElementById(audioId);
  // ensure audio src is set and loaded; use audio/mp4 for .m4a files
  if (ep.audio && audioEl) {
    try {
      audioEl.src = ep.audio;
      audioEl.type = 'audio/mp4';
      audioEl.load();
    } catch (err) {
      console.warn('设置音频源失败：', err);
    }
  }
  // add error handler to show fallback link if browser aborts or fails to load
  if (audioEl) {
    audioEl.addEventListener('error', () => {
      console.warn('Audio error', audioEl.error);
      // avoid duplicating fallback
      if (document.getElementById('audioFallbackLink')) return;
      const link = document.createElement('a');
      link.id = 'audioFallbackLink';
      link.href = ep.audio || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = T.openAudioFallback;
      link.style.display = 'inline-block';
      link.style.marginTop = '8px';
      audioEl.parentNode.insertBefore(link, audioEl.nextSibling);
    });
  }

  if (ep.showNotes && ep.showNotes.length) {
    const list = document.getElementById('showNotesList');
    ep.showNotes.forEach((note) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = `${note.time} — ${note.text}`;
      a.style.color = 'var(--accent-dark)';
      a.style.textDecoration = 'none';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        // parse time string mm:ss or hh:mm:ss
        const parts = note.time.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
        else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (audioEl && !isNaN(seconds)) {
          try { audioEl.currentTime = seconds; audioEl.play(); } catch (err) { console.warn('无法跳转音频：', err); }
        }
      });
      li.appendChild(a);
      list.appendChild(li);
    });
  }
}

(async function() {
  applyShellTranslations();
  const id = qs('id');
  const eps = await loadEpisodes();
  const ep = eps.find((e) => String(e.id) === String(id));
  renderEpisode(ep);
})();
