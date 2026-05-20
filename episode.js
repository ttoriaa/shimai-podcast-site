function qs(param) {
  return new URLSearchParams(location.search).get(param);
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
    root.innerHTML = `<div class="card"><h3>未找到该集</h3><p>可能链接已过期或输入错误，<a href="episodes.html">返回节目列表</a></p></div>`;
    return;
  }

  const audioId = 'episodeAudio';
  root.innerHTML = `
    <article class="episode-card">
      <h1 style="font-size:1.8rem; margin-bottom:8px;">${ep.title}</h1>
      <div style="color:var(--muted); margin-bottom:14px;">${ep.category} · ${ep.duration} ${ep.date ? '· ' + ep.date : ''}</div>
      <p style="margin-bottom:18px; color:var(--muted);">${ep.description}</p>
      <audio controls id="${audioId}" style="width:100%; margin-bottom:16px;" crossorigin="anonymous">
        你的浏览器不支持音频播放。
      </audio>
      ${ep.showNotes && ep.showNotes.length ? '<section class="show-notes" style="margin-bottom:16px;"><h4>节目时间轴</h4><ol id="showNotesList" style="padding-left:18px;"></ol></section>' : ''}
      <div style="display:flex; gap:12px;"><a class="btn btn-secondary" href="episodes.html">返回列表</a><a class="btn btn-primary" href="#">收藏本集</a></div>
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
      link.textContent = '在新窗口打开音频文件（备用）';
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
  const id = qs('id');
  const eps = await loadEpisodes();
  const ep = eps.find((e) => String(e.id) === String(id));
  renderEpisode(ep);
})();
