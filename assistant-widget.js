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

  function ensureStyles() {
    if (document.getElementById("assistant-widget-style")) return;
    const style = document.createElement("style");
    style.id = "assistant-widget-style";
    style.textContent = [
      ".assistant-widget{position:fixed;right:22px;bottom:22px;z-index:60;font-family:inherit;}",
      ".assistant-widget-launcher{border:none;border-radius:999px;background:var(--accent-dark,#1a7a86);color:#fff;padding:12px 18px;font-weight:700;cursor:pointer;box-shadow:0 16px 30px rgba(26,122,134,.25);}",
      ".assistant-widget-panel{width:min(420px,calc(100vw - 28px));border-radius:24px;background:linear-gradient(180deg,#fff 0%,#eaf6f8 100%);border:1px solid rgba(44,168,181,.25);box-shadow:0 20px 60px rgba(26,122,134,.08);overflow:hidden;}",
      ".assistant-widget-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(44,168,181,.2);}",
      ".assistant-widget-header p{margin:4px 0 0;color:var(--muted,#6b95a0);font-size:.85rem;}",
      ".assistant-widget-actions{display:flex;gap:8px;}",
      ".assistant-widget-actions button{width:30px;height:30px;border-radius:999px;border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);cursor:pointer;}",
      ".assistant-widget-body{padding:14px;display:flex;flex-direction:column;gap:12px;}",
      ".assistant-widget-quick{display:flex;flex-wrap:wrap;gap:8px;}",
      ".assistant-widget-quick .assistant-quick-btn{border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);padding:8px 12px;border-radius:999px;cursor:pointer;}",
      ".assistant-widget-quick .assistant-quick-btn:hover{background:var(--accent,#2ca8b5);color:#fff;}",
      ".assistant-widget-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}",
      ".assistant-widget-tools select{border-radius:10px;border:1px solid rgba(44,168,181,.24);padding:7px 10px;background:#fff;color:#174e58;}",
      ".assistant-widget-tools .assistant-show-notes{border:1px solid rgba(26,122,134,.2);background:#fff;color:var(--accent-dark,#1a7a86);padding:7px 12px;border-radius:999px;cursor:pointer;font-weight:600;}",
      ".assistant-widget-tools .assistant-show-notes:hover{background:var(--accent,#2ca8b5);color:#fff;}",
      ".assistant-widget-messages{min-height:180px;max-height:280px;overflow-y:auto;padding:12px;border-radius:16px;background:#fff;border:1px solid rgba(44,168,181,.14);}",
      ".assistant-widget-form{display:flex;flex-direction:column;gap:10px;}",
      ".assistant-widget-form textarea{width:100%;min-height:90px;border-radius:12px;border:1px solid rgba(44,168,181,.2);padding:10px 12px;resize:vertical;}",
      ".assistant-widget-form button{align-self:flex-end;border:none;border-radius:999px;background:var(--accent,#2ca8b5);color:#fff;padding:10px 18px;font-weight:700;cursor:pointer;}",
      ".assistant-widget .assistant-message{margin-bottom:10px;padding:12px;border-radius:12px;background:#f8ffff;line-height:1.55;}",
      ".assistant-widget .assistant-user{text-align:right;background:rgba(44,168,181,.12);}",
      ".assistant-widget .assistant-loading{font-style:italic;color:var(--muted,#6b95a0);}",
      ".assistant-widget .assistant-error{background:#ffe8e8;color:#9f2b2b;}",
      ".assistant-widget .assistant-status{margin:0;padding:8px 10px;border-radius:10px;background:rgba(44,168,181,.08);color:var(--muted,#6b95a0);font-size:.82rem;line-height:1.4;}",
      ".assistant-widget .assistant-status strong{color:var(--accent-dark,#1a7a86);}",
      ".assistant-widget.is-closed .assistant-widget-panel{display:none;}",
      ".assistant-widget:not(.is-closed) .assistant-widget-launcher{display:none;}",
      "@media (max-width:700px){.assistant-widget{right:10px;left:10px;bottom:10px;}.assistant-widget-panel{width:auto;}}"
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
      '  <div class="assistant-widget-body">',
      '    <div class="assistant-widget-quick">',
      '      <button type="button" class="assistant-quick-btn">一个介绍</button>',
      '      <button type="button" class="assistant-quick-btn">一些新话题</button>',
      '      <button type="button" class="assistant-quick-btn">最近在聊什么</button>',
      "    </div>",
      '    <div class="assistant-widget-tools">',
      '      <label for="assistant-style-select">风格</label>',
      '      <select id="assistant-style-select" class="assistant-style-select" aria-label="回复风格">',
      '        <option value="warm">温柔</option>',
      '        <option value="sharp">犀利</option>',
      '        <option value="academic">学术</option>',
      '      </select>',
      '      <button type="button" class="assistant-show-notes">生成本期 show notes</button>',
      '    </div>',
      '    <p class="assistant-status" aria-live="polite">状态：<strong>等待提问</strong></p>',
      '    <div class="assistant-widget-messages">',
      '      <div class="assistant-message">Jackie是我的小猫，我不在家，他会回答你的。</div>',
      "    </div>",
      '    <form class="assistant-widget-form">',
      '      <textarea rows="3" placeholder="例如：结合当前页面，给我 3 个深一点的话题" required></textarea>',
      '      <button type="submit">发送</button>',
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
    const quickButtons = root.querySelectorAll(".assistant-widget-quick .assistant-quick-btn");
    const styleSelect = root.querySelector(".assistant-style-select");
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

    if (styleSelect) {
      styleSelect.value = loadStyle();
      styleSelect.addEventListener("change", function () {
        saveStyle(styleSelect.value || "warm");
      });
    }

    function setStatus(text) {
      if (!statusNode) return;
      statusNode.innerHTML = '状态：<strong>' + text + '</strong>';
    }

    function syncUI() {
      root.classList.toggle("is-closed", !!state.closed);
      root.classList.toggle("is-minimized", !!state.minimized);
      panel.setAttribute("aria-hidden", state.closed ? "true" : "false");
      body.hidden = !!state.minimized;
      minBtn.textContent = state.minimized ? "+" : "-";
      minBtn.setAttribute("aria-label", state.minimized ? "展开" : "最小化");
      launcher.style.display = state.closed ? "inline-flex" : "none";
    }

    async function sendQuestion(rawQuestion, userDisplayQuestion, mode) {
      const question = String(rawQuestion || "").trim();
      if (!question) return;

      const visibleQuestion = String(userDisplayQuestion || question).trim() || question;
      messages.appendChild(createMessage(visibleQuestion, "assistant-user"));
      messages.scrollTop = messages.scrollHeight;
      input.value = "";

      const loading = createMessage("正在为你整理答案...", "assistant-loading");
      messages.appendChild(loading);
      messages.scrollTop = messages.scrollHeight;
      setStatus("正在请求...");

      try {
        const contextualQuery = "[页面上下文: " + PAGE_CONTEXT + "] " + question;
        const selectedStyle = styleSelect ? String(styleSelect.value || "warm") : "warm";
        const response = await fetch(API_BASE + "/api/assistant/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: contextualQuery, style: selectedStyle, mode: mode || "chat" })
        });
        const payload = await response.json();

        loading.remove();

        if (response.ok && payload && payload.answer) {
          messages.appendChild(createMessage(payload.answer, "assistant"));
          const source = String(payload.source || "").toLowerCase();
          if (source === "llm") {
            const provider = payload.provider ? String(payload.provider).toUpperCase() : "LLM";
            const model = payload.model ? String(payload.model) : "";
            const styleLabel = payload.style === "sharp" ? "犀利" : payload.style === "academic" ? "学术" : "温柔";
            setStatus("LLM回答（" + provider + (model ? "/" + model : "") + " | " + styleLabel + "）");
          } else if (source === "local") {
            setStatus("本地兜底");
          } else {
            setStatus("回答完成");
          }
        } else if (payload && payload.error) {
          messages.appendChild(createMessage(payload.error, "assistant-error"));
          setStatus("请求失败");
        } else {
          messages.appendChild(createMessage("抱歉，助手暂时无法响应，请稍后再试。", "assistant-error"));
          setStatus("无可用回答");
        }
      } catch (error) {
        loading.remove();
        messages.appendChild(createMessage("网络请求失败，请稍后再试。", "assistant-error"));
        setStatus("网络异常");
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
        const preset = String(button.textContent || "").trim();
        const mappedQuery = mapPresetToQuery(preset);
        input.value = preset;
        sendQuestion(mappedQuery, preset, "chat");
      });
    });

    if (showNotesBtn) {
      showNotesBtn.addEventListener("click", function () {
        const notesPrompt = "请生成本期 show notes";
        sendQuestion(notesPrompt, "生成本期 show notes", "show_notes");
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
