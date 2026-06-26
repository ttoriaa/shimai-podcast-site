(function () {
  const API_BASE = window.__API_BASE__ || "https://shimai-podcast-site.onrender.com";
  const PAGE_CONTEXT = window.__ASSISTANT_CONTEXT__ || "当前页面";
  const STORAGE_KEY = "vickie_assistant_widget_state";
  const STYLE_KEY = "vickie_assistant_style";
  const PRESET_QUERY_MAP = {
    "一个介绍": "给我一个整体 overview",
    "一些新话题": "帮我想新的播客话题",
    "最近在聊什么": "总结最新一集内容"
  };
  const UI_COPY = {
    zh: {
      launcher: "问问Jackie",
      title: "问问Jackie",
      currentPrefix: "当前：",
      windowLabel: "问问Jackie 聊天窗口",
      ariaOpen: "打开",
      ariaClose: "关闭",
      ariaMinimize: "最小化",
      ariaExpand: "展开",
      styleAria: "回复风格",
      intro: "Jackie是我的小猫，我不在家，他会回答你的。",
      quickIntro: "一个介绍",
      quickTopics: "一些新话题",
      quickRecent: "最近在聊什么",
      showNotes: "生成本期 show notes",
      style: "风格",
      styleWarm: "温柔",
      styleSharp: "犀利",
      styleAcademic: "学术",
      statusPrefix: "状态：",
      statusWaiting: "等待提问",
      statusRequesting: "正在请求...",
      statusDone: "回答完成",
      statusLocal: "本地兜底",
      statusFailed: "请求失败",
      statusEmpty: "无可用回答",
      statusNetwork: "网络异常",
      statusLlm: "LLM回答",
      loading: "正在为你整理答案...",
      welcome: "想聊什么，直接点上面的快捷入口，或者自己输入问题。",
      placeholder: "例如：结合当前页面，给我 3 个深一点的话题",
      send: "发送",
      copy: "复制到剪贴板",
      copied: "已复制",
      copyFail: "复制失败",
      notesPrompt: "请生成本期 show notes",
      notesDisplay: "生成本期 show notes",
      langHint: "请使用中文回答。",
      langLabel: "回答语言"
    },
    en: {
      launcher: "Ask Jackie",
      title: "Ask Jackie",
      currentPrefix: "Current: ",
      windowLabel: "Ask Jackie chat window",
      ariaOpen: "Open",
      ariaClose: "Close",
      ariaMinimize: "Minimize",
      ariaExpand: "Expand",
      styleAria: "Response style",
      intro: "Jackie is my cat. When I'm away, he can answer you.",
      quickIntro: "Quick intro",
      quickTopics: "New topics",
      quickRecent: "Recent highlights",
      showNotes: "Generate show notes",
      style: "Style",
      styleWarm: "Warm",
      styleSharp: "Sharp",
      styleAcademic: "Academic",
      statusPrefix: "Status: ",
      statusWaiting: "Waiting for your question",
      statusRequesting: "Requesting...",
      statusDone: "Answer ready",
      statusLocal: "Local fallback",
      statusFailed: "Request failed",
      statusEmpty: "No answer available",
      statusNetwork: "Network error",
      statusLlm: "LLM reply",
      loading: "Drafting your answer...",
      welcome: "Pick a quick starter above or type your own question.",
      placeholder: "For example: Based on this page, give me 3 deeper topics",
      send: "Send",
      copy: "Copy",
      copied: "Copied",
      copyFail: "Copy failed",
      notesPrompt: "Please generate show notes for this episode",
      notesDisplay: "Generate show notes",
      langHint: "Please answer in English.",
      langLabel: "Response language"
    }
  };

  function detectPageLang() {
    try {
      const urlLang = new URLSearchParams(window.location.search).get("lang");
      if (urlLang === "en") return "en";
      if (urlLang === "zh") return "zh";
    } catch (error) {
      // ignore parse failures
    }
    const htmlLang = String(document.documentElement.lang || "").toLowerCase();
    return htmlLang.indexOf("en") === 0 ? "en" : "zh";
  }

  function ensureStyles() {
    if (document.getElementById("assistant-widget-style")) return;
    const style = document.createElement("style");
    style.id = "assistant-widget-style";
    style.textContent = [
      ".assistant-widget{position:fixed;right:18px;bottom:18px;z-index:60;font-family:inherit;}",
      ".assistant-widget-launcher{border:none;border-radius:999px;background:var(--accent-dark,#1a7a86);color:#fff;padding:12px 18px;font-weight:700;cursor:pointer;box-shadow:0 16px 30px rgba(26,122,134,.25);}",
      ".assistant-widget-panel{width:min(360px,calc(100vw - 30px));border-radius:20px;background:linear-gradient(180deg,#fff 0%,#eaf6f8 100%);border:1px solid rgba(44,168,181,.25);box-shadow:0 20px 60px rgba(26,122,134,.08);overflow:hidden;}",
      ".assistant-widget-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(44,168,181,.2);}",
      ".assistant-widget-header p{margin:4px 0 0;color:var(--muted,#6b95a0);font-size:.85rem;}",
      ".assistant-widget-intro{margin:0;padding:10px 16px;color:var(--muted,#6b95a0);font-size:.84rem;line-height:1.5;border-bottom:1px solid rgba(44,168,181,.14);}",
      ".assistant-widget-actions{display:flex;gap:8px;}",
      ".assistant-widget-actions button{width:30px;height:30px;border-radius:999px;border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);cursor:pointer;}",
      ".assistant-widget-body{padding:12px;display:flex;flex-direction:column;gap:10px;}",
      ".assistant-widget-controls{display:flex;align-items:center;gap:7px;overflow-x:auto;padding-bottom:2px;scrollbar-width:thin;}",
      ".assistant-widget-controls .assistant-chip,.assistant-widget-controls .assistant-show-notes{height:34px;border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);padding:0 11px;border-radius:999px;cursor:pointer;font-size:.84rem;font-weight:600;white-space:nowrap;}",
      ".assistant-widget-controls .assistant-chip:hover,.assistant-widget-controls .assistant-show-notes:hover{background:var(--accent,#2ca8b5);color:#fff;}",
      ".assistant-widget-status-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}",
      ".assistant-widget-status-row .assistant-meta{display:flex;align-items:center;gap:8px;margin-left:auto;}",
      ".assistant-widget-status-row .assistant-style{display:flex;align-items:center;gap:6px;color:var(--muted,#6b95a0);font-size:.8rem;white-space:nowrap;}",
      ".assistant-widget-status-row .assistant-style-select{height:32px;border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);padding:0 10px;border-radius:999px;cursor:pointer;font-size:.82rem;font-weight:600;min-width:72px;}",
      ".assistant-widget-status-row .assistant-lang-switch{display:inline-flex;align-items:center;padding:2px;border:1px solid rgba(26,122,134,.2);border-radius:999px;background:#fff;}",
      ".assistant-widget-status-row .assistant-lang-btn{height:28px;border:none;background:transparent;color:var(--muted,#6b95a0);padding:0 9px;border-radius:999px;cursor:pointer;font-size:.78rem;font-weight:700;}",
      ".assistant-widget-status-row .assistant-lang-btn.is-active{background:var(--accent,#2ca8b5);color:#fff;}",
      ".assistant-widget-messages{min-height:120px;max-height:min(34vh,220px);overflow-y:auto;padding:10px;border-radius:14px;background:#fff;border:1px solid rgba(44,168,181,.14);}",
      ".assistant-widget-form{display:flex;flex-direction:column;gap:10px;}",
      ".assistant-widget-form textarea{width:100%;min-height:74px;border-radius:12px;border:1px solid rgba(44,168,181,.2);padding:10px 12px;resize:vertical;max-height:140px;}",
      ".assistant-widget-form button{align-self:flex-end;border:none;border-radius:999px;background:var(--accent,#2ca8b5);color:#fff;padding:9px 16px;font-weight:700;cursor:pointer;}",
      ".assistant-widget .assistant-message{margin-bottom:10px;padding:12px;border-radius:12px;background:#f8ffff;line-height:1.55;}",
      ".assistant-widget .assistant-user{text-align:right;background:rgba(44,168,181,.12);}",
      ".assistant-widget .assistant-loading{font-style:italic;color:var(--muted,#6b95a0);}",
      ".assistant-widget .assistant-error{background:#ffe8e8;color:#9f2b2b;}",
      ".assistant-widget .assistant-copy-btn{display:inline-flex;align-items:center;gap:4px;margin-top:8px;border:1px solid rgba(26,122,134,.24);background:#fff;color:var(--accent-dark,#1a7a86);padding:4px 10px;border-radius:999px;font-size:.78rem;cursor:pointer;}",
      ".assistant-widget .assistant-copy-btn:hover{background:rgba(44,168,181,.1);}",
      ".assistant-widget .assistant-status{margin:0;padding:8px 10px;border-radius:10px;background:rgba(44,168,181,.08);color:var(--muted,#6b95a0);font-size:.82rem;line-height:1.4;}",
      ".assistant-widget .assistant-status strong{color:var(--accent-dark,#1a7a86);}",
      ".assistant-widget.is-closed .assistant-widget-panel{display:none;}",
      ".assistant-widget:not(.is-closed) .assistant-widget-launcher{display:none;}",
      "@media (max-width:700px){.assistant-widget{right:10px;left:10px;bottom:10px;}.assistant-widget-panel{width:auto;max-height:min(76vh,620px);}.assistant-widget-body{gap:9px;padding:10px;}.assistant-widget-status-row{align-items:flex-start;}.assistant-widget-status-row .assistant-meta{gap:6px;}.assistant-widget-status-row .assistant-style{font-size:.78rem;}.assistant-widget-status-row .assistant-style-select{height:30px;min-width:64px;}.assistant-widget-status-row .assistant-lang-btn{height:26px;padding:0 8px;}.assistant-widget-messages{max-height:min(28vh,180px);}.assistant-widget-form textarea{min-height:64px;max-height:110px;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { closed: false, minimized: false };
    } catch (error) {
      return { closed: false, minimized: false };
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // ignore storage failure
    }
  }

  function mapPresetToQuery(preset) {
    const label = String(preset || "").trim();
    return PRESET_QUERY_MAP[label] || label;
  }

  function createMessage(text, variant) {
    const node = document.createElement("div");
    node.className = "assistant-message " + (variant || "assistant");
    node.textContent = text;
    return node;
  }

  async function copyTextToClipboard(text) {
    const content = String(text || "");
    if (!content) return false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(content);
        return true;
      } catch (error) {
        // fallback below
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch (error) {
      return false;
    }
  }

  function createWidget() {
    const root = document.createElement("div");
    root.className = "assistant-widget";
    root.innerHTML = [
      '<button type="button" class="assistant-widget-launcher" aria-label="打开 问问Jackie">问问Jackie</button>',
      '<section class="assistant-widget-panel" aria-label="问问Jackie 聊天窗口">',
      '  <header class="assistant-widget-header">',
      '    <div>',
      '      <strong>问问Jackie</strong>',
      '      <p>当前：' + PAGE_CONTEXT + '</p>',
      "    </div>",
      '    <div class="assistant-widget-actions">',
      '      <button type="button" class="assistant-widget-min" aria-label="最小化">-</button>',
      '      <button type="button" class="assistant-widget-close" aria-label="关闭">x</button>',
      "    </div>",
      "  </header>",
      '  <p class="assistant-widget-intro" data-copy="intro">Jackie是我的小猫，我不在家，他会回答你的。</p>',
      '  <div class="assistant-widget-body">',
      '    <div class="assistant-widget-controls">',
      '      <button type="button" class="assistant-chip" data-query="一个介绍" data-copy="quickIntro">一个介绍</button>',
      '      <button type="button" class="assistant-chip" data-query="一些新话题" data-copy="quickTopics">一些新话题</button>',
      '      <button type="button" class="assistant-chip" data-query="最近在聊什么" data-copy="quickRecent">最近在聊什么</button>',
      '      <button type="button" class="assistant-show-notes" data-copy="showNotes">生成本期 show notes</button>',
      '    </div>',
      '    <div class="assistant-widget-status-row">',
      '      <p class="assistant-status" aria-live="polite">状态：<strong>等待提问</strong></p>',
      '      <div class="assistant-meta">',
      '        <label class="assistant-style" data-copy="style">',
      '          风格',
      '          <select id="assistant-style-select" class="assistant-style-select" aria-label="回复风格">',
      '            <option value="warm" data-copy="styleWarm">温柔</option>',
      '            <option value="sharp" data-copy="styleSharp">犀利</option>',
      '            <option value="academic" data-copy="styleAcademic">学术</option>',
      '          </select>',
      '        </label>',
      '        <div class="assistant-lang-switch" role="group" aria-label="回答语言" data-aria-copy="langLabel">',
      '          <button type="button" class="assistant-lang-btn is-active" data-lang="zh">中</button>',
      '          <button type="button" class="assistant-lang-btn" data-lang="en">EN</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="assistant-widget-messages">',
      '      <div class="assistant-message" data-copy="welcome">想聊什么，直接点上面的快捷入口，或者自己输入问题。</div>',
      "    </div>",
      '    <form class="assistant-widget-form">',
      '      <textarea rows="3" placeholder="例如：结合当前页面，给我 3 个深一点的话题" required></textarea>',
      '      <button type="submit" data-copy="send">发送</button>',
      "    </form>",
      "  </div>",
      "</section>"
    ].join("\n");

    document.body.appendChild(root);
    return root;
  }

  function attachHandlers(root) {
    const launcher = root.querySelector(".assistant-widget-launcher");
    const panel = root.querySelector(".assistant-widget-panel");
    const body = root.querySelector(".assistant-widget-body");
    const minBtn = root.querySelector(".assistant-widget-min");
    const closeBtn = root.querySelector(".assistant-widget-close");
    const form = root.querySelector(".assistant-widget-form");
    const input = root.querySelector("textarea");
    const messages = root.querySelector(".assistant-widget-messages");
    const statusNode = root.querySelector(".assistant-status");
    const quickButtons = root.querySelectorAll(".assistant-widget-controls .assistant-chip");
    const styleSelect = root.querySelector(".assistant-style-select");
    const langButtons = root.querySelectorAll(".assistant-lang-btn");
    const showNotesBtn = root.querySelector(".assistant-show-notes");
    const state = loadState();

    function loadStyle() {
      try {
        const s = sessionStorage.getItem(STYLE_KEY);
        if (s === "warm" || s === "sharp" || s === "academic") return s;
      } catch (error) {
        // ignore
      }
      return "warm";
    }

    function saveStyle(value) {
      try {
        sessionStorage.setItem(STYLE_KEY, value);
      } catch (error) {
        // ignore
      }
    }

    let currentLang = detectPageLang();
    let currentStatusText = "";

    function copy() {
      return UI_COPY[currentLang] || UI_COPY.zh;
    }

    function updateStaticCopy() {
      const dict = copy();
      const launcherBtn = root.querySelector(".assistant-widget-launcher");
      const panelNode = root.querySelector(".assistant-widget-panel");
      const titleNode = root.querySelector(".assistant-widget-header strong");
      const currentNode = root.querySelector(".assistant-widget-header p");
      if (launcherBtn) {
        launcherBtn.textContent = dict.launcher;
        launcherBtn.setAttribute("aria-label", dict.ariaOpen + " " + dict.title);
      }
      if (panelNode) panelNode.setAttribute("aria-label", dict.windowLabel);
      if (titleNode) titleNode.textContent = dict.title;
      if (currentNode) currentNode.textContent = dict.currentPrefix + PAGE_CONTEXT;

      root.querySelectorAll("[data-copy]").forEach(function (node) {
        const key = node.getAttribute("data-copy");
        if (!key || !dict[key]) return;
        if (node.tagName === "LABEL") {
          const select = node.querySelector("select");
          const first = node.childNodes[0];
          if (first && first.nodeType === Node.TEXT_NODE) {
            first.nodeValue = dict[key] + " ";
          } else if (select) {
            node.insertBefore(document.createTextNode(dict[key] + " "), select);
          }
          return;
        }
        if (node.tagName === "TEXTAREA") {
          node.setAttribute("placeholder", dict[key]);
          return;
        }
        node.textContent = dict[key];
      });

      root.querySelectorAll("[data-aria-copy]").forEach(function (node) {
        const key = node.getAttribute("data-aria-copy");
        if (key && dict[key]) {
          node.setAttribute("aria-label", dict[key]);
        }
      });

      const textarea = root.querySelector(".assistant-widget-form textarea");
      if (textarea) textarea.setAttribute("placeholder", dict.placeholder);
      if (styleSelect) styleSelect.setAttribute("aria-label", dict.styleAria);
      closeBtn.setAttribute("aria-label", dict.ariaClose);
    }

    function syncLangButtons() {
      langButtons.forEach(function (btn) {
        const isActive = String(btn.getAttribute("data-lang") || "") === currentLang;
        btn.classList.toggle("is-active", isActive);
      });
    }

    if (styleSelect) {
      styleSelect.value = loadStyle();
      styleSelect.setAttribute("aria-label", copy().styleAria);
      styleSelect.addEventListener("change", function () {
        saveStyle(styleSelect.value || "warm");
      });
    }

    langButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const next = String(btn.getAttribute("data-lang") || "zh");
        currentLang = next === "en" ? "en" : "zh";
        syncLangButtons();
        updateStaticCopy();
        setStatus(currentStatusText || copy().statusWaiting);
      });
    });
    syncLangButtons();
    updateStaticCopy();

    function setStatus(text) {
      if (!statusNode) return;
      currentStatusText = text;
      statusNode.innerHTML = copy().statusPrefix + '<strong>' + text + '</strong>';
    }

    setStatus(copy().statusWaiting);

    function syncUI() {
      root.classList.toggle("is-closed", !!state.closed);
      root.classList.toggle("is-minimized", !!state.minimized);
      panel.setAttribute("aria-hidden", state.closed ? "true" : "false");
      body.hidden = !!state.minimized;
      minBtn.textContent = state.minimized ? "+" : "-";
      minBtn.setAttribute("aria-label", state.minimized ? copy().ariaExpand : copy().ariaMinimize);
      launcher.style.display = state.closed ? "inline-flex" : "none";
    }

    async function sendQuestion(rawQuestion, userDisplayQuestion, mode) {
      const question = String(rawQuestion || "").trim();
      if (!question) return;

      const visibleQuestion = String(userDisplayQuestion || question).trim() || question;
      messages.appendChild(createMessage(visibleQuestion, "assistant-user"));
      messages.scrollTop = messages.scrollHeight;
      input.value = "";

      const loading = createMessage(copy().loading, "assistant-loading");
      messages.appendChild(loading);
      messages.scrollTop = messages.scrollHeight;
      setStatus(copy().statusRequesting);

      try {
        const langHint = copy().langHint;
        const contextualQuery = "[页面上下文: " + PAGE_CONTEXT + "][回答语言: " + (currentLang === "en" ? "English" : "Chinese") + "] " + question + "\n" + langHint;
        const selectedStyle = styleSelect ? String(styleSelect.value || "warm") : "warm";
        const response = await fetch(API_BASE + "/api/assistant/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: contextualQuery, style: selectedStyle, mode: mode || "chat" })
        });
        const payload = await response.json();

        loading.remove();

        if (response.ok && payload && payload.answer) {
          const assistantNode = createMessage(payload.answer, "assistant");
          const modeName = String(payload.mode || "").toLowerCase();
          if (modeName === "show_notes") {
            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.className = "assistant-copy-btn";
            copyBtn.textContent = copy().copy;
            copyBtn.addEventListener("click", async function () {
              const ok = await copyTextToClipboard(payload.answer);
              copyBtn.textContent = ok ? copy().copied : copy().copyFail;
              setTimeout(function () {
                copyBtn.textContent = copy().copy;
              }, 1500);
            });
            assistantNode.appendChild(copyBtn);
          }
          messages.appendChild(assistantNode);
          const source = String(payload.source || "").toLowerCase();
          if (source === "llm") {
            const provider = payload.provider ? String(payload.provider).toUpperCase() : "LLM";
            const model = payload.model ? String(payload.model) : "";
            const dict = copy();
            const styleLabel = payload.style === "sharp" ? dict.styleSharp : payload.style === "academic" ? dict.styleAcademic : dict.styleWarm;
            const llmPrefix = dict.statusLlm;
            setStatus(llmPrefix + "（" + provider + (model ? "/" + model : "") + " | " + styleLabel + "）");
          } else if (source === "local") {
            setStatus(copy().statusLocal);
          } else {
            setStatus(copy().statusDone);
          }
        } else if (payload && payload.error) {
          messages.appendChild(createMessage(currentLang === "en" ? "Request failed. Please try again." : "请求失败，请稍后再试。", "assistant-error"));
          setStatus(copy().statusFailed);
        } else {
          messages.appendChild(createMessage(currentLang === "en" ? "Sorry, the assistant is temporarily unavailable. Please try again later." : "抱歉，助手暂时无法响应，请稍后再试。", "assistant-error"));
          setStatus(copy().statusEmpty);
        }
      } catch (error) {
        loading.remove();
        messages.appendChild(createMessage(currentLang === "en" ? "Network request failed. Please try again later." : "网络请求失败，请稍后再试。", "assistant-error"));
        setStatus(copy().statusNetwork);
      }

      messages.scrollTop = messages.scrollHeight;
    }

    launcher.addEventListener("click", function () {
      state.closed = false;
      saveState(state);
      syncUI();
    });

    closeBtn.addEventListener("click", function () {
      state.closed = true;
      saveState(state);
      syncUI();
    });

    minBtn.addEventListener("click", function () {
      state.minimized = !state.minimized;
      saveState(state);
      syncUI();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendQuestion(input.value, undefined, "chat");
    });

    quickButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const presetKey = String(button.getAttribute("data-query") || "").trim();
        const display = String(button.textContent || presetKey).trim();
        const mappedQuery = mapPresetToQuery(presetKey || display);
        input.value = display;
        sendQuestion(mappedQuery, display, "chat");
      });
    });

    if (showNotesBtn) {
      showNotesBtn.addEventListener("click", function () {
        const notesPrompt = copy().notesPrompt;
        sendQuestion(notesPrompt, copy().notesDisplay, "show_notes");
      });
    }

    syncUI();
  }

  function mount() {
    if (document.querySelector(".assistant-widget")) return;
    ensureStyles();
    const root = createWidget();
    attachHandlers(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
