(function () {
  const API_BASE = window.__API_BASE__ || "https://shimai-podcast-site.onrender.com";
  const PAGE_CONTEXT = window.__ASSISTANT_CONTEXT__ || "当前页面";
  const STORAGE_KEY = "vickie_assistant_widget_state";

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
      '<button type="button" class="assistant-widget-launcher" aria-label="打开 AI 助手">问小姨</button>',
      '<section class="assistant-widget-panel" aria-label="AI 助手聊天窗口">',
      '  <header class="assistant-widget-header">',
      '    <div>',
      '      <strong>AI 助手</strong>',
      '      <p>当前：' + PAGE_CONTEXT + '</p>',
      "    </div>",
      '    <div class="assistant-widget-actions">',
      '      <button type="button" class="assistant-widget-min" aria-label="最小化">-</button>',
      '      <button type="button" class="assistant-widget-close" aria-label="关闭">x</button>',
      "    </div>",
      "  </header>",
      '  <div class="assistant-widget-body">',
      '    <div class="assistant-quick assistant-widget-quick">',
      '      <button type="button" class="assistant-quick-btn">整体 overview</button>',
      '      <button type="button" class="assistant-quick-btn">新话题建议</button>',
      '      <button type="button" class="assistant-quick-btn">解析 RSS 文本</button>',
      "    </div>",
      '    <div class="assistant-messages assistant-widget-messages">',
      '      <div class="assistant-message assistant-welcome">你好，我是时髦小姨的 AI 助手。你可以问我当前页面相关问题。</div>',
      "    </div>",
      '    <form class="assistant-form assistant-widget-form">',
      '      <textarea rows="3" placeholder="例如：结合当前页面，给我 3 个深一点的话题" required></textarea>',
      '      <button class="btn btn-primary" type="submit">发送</button>',
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
    const quickButtons = root.querySelectorAll(".assistant-widget-quick .assistant-quick-btn");

    const state = loadState();

    function syncUI() {
      root.classList.toggle("is-closed", !!state.closed);
      root.classList.toggle("is-minimized", !!state.minimized);
      panel.setAttribute("aria-hidden", state.closed ? "true" : "false");
      body.hidden = !!state.minimized;
      minBtn.textContent = state.minimized ? "+" : "-";
      minBtn.setAttribute("aria-label", state.minimized ? "展开" : "最小化");
      launcher.style.display = state.closed ? "inline-flex" : "none";
    }

    async function sendQuestion(rawQuestion) {
      const question = String(rawQuestion || "").trim();
      if (!question) return;

      messages.appendChild(createMessage(question, "assistant-user"));
      messages.scrollTop = messages.scrollHeight;
      input.value = "";

      const loading = createMessage("正在为你整理答案...", "assistant-loading");
      messages.appendChild(loading);
      messages.scrollTop = messages.scrollHeight;

      try {
        const contextualQuery = "[页面上下文: " + PAGE_CONTEXT + "] " + question;
        const response = await fetch(API_BASE + "/api/assistant/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: contextualQuery })
        });
        const payload = await response.json();
        loading.remove();

        if (response.ok && payload && payload.answer) {
          messages.appendChild(createMessage(payload.answer, "assistant"));
        } else if (payload && payload.error) {
          messages.appendChild(createMessage(payload.error, "assistant-error"));
        } else {
          messages.appendChild(createMessage("抱歉，助手暂时无法响应，请稍后再试。", "assistant-error"));
        }
      } catch (error) {
        loading.remove();
        messages.appendChild(createMessage("网络请求失败，请稍后再试。", "assistant-error"));
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
      sendQuestion(input.value);
    });

    quickButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const preset = button.textContent || "";
        input.value = preset;
        sendQuestion(preset);
      });
    });

    syncUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      const root = createWidget();
      attachHandlers(root);
    });
  } else {
    const root = createWidget();
    attachHandlers(root);
  }
})();
