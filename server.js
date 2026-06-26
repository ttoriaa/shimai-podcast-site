const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const ASSISTANT_DEBUG = ['1', 'true', 'yes', 'on'].includes(String(process.env.ASSISTANT_DEBUG || '').toLowerCase());
const STYLE_PROMPTS = {
  warm: '语气温柔、共情、有陪伴感，避免说教。',
  sharp: '语气犀利、观点鲜明、逻辑直接，但不攻击用户。',
  academic: '语气学术化、结构清晰、概念定义准确，适度引用分析框架。'
};

function cleanEnv(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function normalizeBaseUrl(url) {
  const raw = cleanEnv(url);
  if (!raw) return '';
  let out = raw.replace(/\/+$/, '');
  // Guard against misconfigured endpoint paths pasted into base URL.
  out = out.replace(/\/chat\/completions$/i, '');
  out = out.replace(/\/v1\/chat\/completions$/i, '/v1');
  out = out.replace(/\/api\/paas\/v4\/chat\/completions$/i, '/api/paas/v4');
  return out;
}

function resolveLlmConfig() {
  const glmApiKey = cleanEnv(process.env.GLM_API_KEY);
  const openaiApiKey = cleanEnv(process.env.OPENAI_API_KEY);
  const apiKey = glmApiKey || openaiApiKey;

  const glmBaseUrl = normalizeBaseUrl(process.env.GLM_BASE_URL) || 'https://open.bigmodel.cn/api/paas/v4';
  const configuredOpenaiBaseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL);
  const baseUrl = configuredOpenaiBaseUrl || (glmApiKey ? glmBaseUrl : 'https://api.openai.com/v1');

  const model = cleanEnv(process.env.OPENAI_MODEL)
    || cleanEnv(process.env.GLM_MODEL)
    || (glmApiKey ? 'glm-4-flash' : 'gpt-4o-mini');

  return {
    apiKey,
    baseURL: baseUrl,
    model,
    provider: glmApiKey ? 'glm' : 'openai',
    fromEnv: {
      hasGlmKey: Boolean(glmApiKey),
      hasOpenaiKey: Boolean(openaiApiKey),
      glmBaseUrl,
      openaiBaseUrl: configuredOpenaiBaseUrl
    }
  };
}

function classifyLlmError(errorMessage) {
  const msg = String(errorMessage || '').toLowerCase();
  if (!msg) return 'unknown';
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid api key')) return 'auth_failed';
  if (msg.includes('403') || msg.includes('forbidden') || msg.includes('permission')) return 'permission_denied';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) return 'quota_or_rate_limited';
  if (msg.includes('404') || msg.includes('not_found') || msg.includes('not found')) return 'endpoint_or_model_not_found';
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('econnreset') || msg.includes('enotfound')) return 'network_or_timeout';
  return 'unknown';
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const episodesFile = path.join(__dirname, 'episodes.json');
let episodes = [];

try {
  episodes = JSON.parse(fs.readFileSync(episodesFile, 'utf8')) || [];
} catch (error) {
  console.error('无法读取 episodes.json：', error);
}

let openaiClient = null;
let llmConfig = resolveLlmConfig();
if (llmConfig.apiKey) {
  try {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseURL
    });
  } catch (error) {
    console.warn('OpenAI 客户端初始化失败，将使用本地 demo 模式：', error.message);
  }
}

function getLatestEpisode() {
  return episodes[0] || null;
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEpisodeText(ep) {
  // 优先使用 RSS 解析后的正文/摘要字段，description 作为回退。
  const raw = [
    ep.summary,
    ep.content,
    ep.contentSnippet,
    ep.description,
    ep.subtitle
  ].filter(Boolean).join(' ');
  return normalizeText(raw);
}

function buildRssContext(limit = 6) {
  return episodes.slice(0, limit).map((ep, idx) => {
    const text = getEpisodeText(ep);
    return {
      index: idx + 1,
      title: ep.title || `第${idx + 1}集`,
      date: ep.date || '',
      duration: ep.duration || '',
      excerpt: text.slice(0, 240)
    };
  });
}

function getOverview() {
  const latest = getLatestEpisode();
  const categories = Array.from(new Set(episodes.slice(0, 8).map((ep) => ep.category))).join('、');
  return `“时髦小姨”播客的核心是：女性视角与城市生活交织，围绕主体性、审美、旅行体验、关系与精神自由展开。最近几集多以“对谈Talk”为主，话题包括驾驶与规则、离线生活、共识瓦解、审美自信、高敏感体验等。最新一集《${latest ? latest.title : '暂无最新集'}》继续保持真诚、思辨与温度，让听众在复杂时代里找到可用的生活感受。${categories ? `\n\n近期分类：${categories}` : ''}`;
}

function getTopicSuggestions() {
  const topics = [
    {
      title: '公共规则下的自我主场',
      description: '从家庭、社交、职场规则出发，聊“懂事”“体面”“共识瓦解”与女性主体性之间的张力。'
    },
    {
      title: '城市边缘的自由感',
      description: '在巴厘岛离线与北京城市节奏之间，探讨如何在现代城市里保留一段属于自己的慢时光。'
    },
    {
      title: '高敏感者的美学与力量',
      description: '把高敏感从“问题”翻转为天赋，讨论敏感如何成为审美、共情和创造力的来源。'
    },
    {
      title: '女性与物质审美：Prada 之外的自信',
      description: '以“女王”与审美为切入，讨论自信是否必须通过外在符号来获得。'
    },
    {
      title: '从无聊到有意义：慢内容的再造',
      description: '在注意力稀缺时代，聊“无聊”“脑卫生”“留白”，并给出可落地的慢生活建议。'
    }
  ];

  return topics
    .map((topic, index) => `${index + 1}. ${topic.title}\n${topic.description}`)
    .join('\n\n');
}

function getLatestSummary() {
  const latest = getLatestEpisode();
  if (!latest) {
    return '还没有可用的最新节目。请先添加一集，再来这里获取总结。';
  }

  const text = getEpisodeText(latest);
  return `最新一集是《${latest.title}》。\n\n从 RSS 文本提炼的核心内容：\n${text ? text.slice(0, 280) : '当前没有可用的正文/摘要。'}\n\n一句话建议：适合想要在规则与自我边界之间找到更稳内核的听众。`;
}

function getLatestShowNotes(style) {
  const latest = getLatestEpisode();
  if (!latest) {
    return '当前没有可用节目，暂时无法生成 show notes。';
  }

  const text = getEpisodeText(latest);
  const excerpt = text ? text.slice(0, 280) : '暂无可用正文摘要。';
  const styleTag = style === 'sharp' ? '犀利' : style === 'academic' ? '学术' : '温柔';

  return [
    `# Show Notes | ${latest.title || '本期节目'}`,
    '',
    `- 风格：${styleTag}`,
    `- 日期：${latest.date || '未知'}`,
    `- 时长：${latest.duration || '未知'}`,
    '',
    '## 本期摘要',
    excerpt,
    '',
    '## 关键词',
    '- 主体性',
    '- 关系边界',
    '- 城市生活',
    '',
    '## 3 个核心观点',
    '1. 复杂时代里，清晰表达是稀缺能力。',
    '2. 关系中的自由来自边界感与自我稳定。',
    '3. 生活选择不求标准答案，而求持续迭代。',
    '',
    '## 可延展讨论',
    '- 如果把本期观点放进职场场景，会发生什么？',
    '- 这些观点如何落地到一周行动计划？'
  ].join('\n');
}

function getRssTextAnalysisAnswer() {
  const rssContext = buildRssContext(5);
  if (!rssContext.length) {
    return '当前没有可用的 RSS 文本可解析。请先更新 episodes.json。';
  }

  const allText = rssContext.map((item) => item.excerpt).join(' ');
  const keywordMap = [
    '规则', '女性', '关系', '自由', '审美', '成长', '情绪', '城市', '离线', '职场', '生活'
  ];

  const hot = keywordMap
    .map((word) => ({
      word,
      count: (allText.match(new RegExp(word, 'g')) || []).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item) => item.word);

  const lines = rssContext
    .slice(0, 3)
    .map((item) => `- 《${item.title}》${item.date ? `（${item.date}）` : ''}：${item.excerpt || '暂无摘要文本'}`)
    .join('\n');

  return `我已根据 RSS 解析文本做了摘要提炼。\n\n高频主题词：${hot.length ? hot.join('、') : '（关键词不足）'}\n\n最近 3 集文本摘要：\n${lines}\n\n如果你愿意，我可以继续输出：\n1. 选题空白点\n2. 10 个可直接录制的新选题\n3. 每个选题的一分钟口播提纲`;
}

function normalizeStyle(style) {
  const s = String(style || '').toLowerCase();
  if (s === 'sharp' || s === 'academic' || s === 'warm') return s;
  return 'warm';
}

function localAssistantAnswer(query, options = {}) {
  const mode = String(options.mode || '').toLowerCase();
  const style = normalizeStyle(options.style);
  if (mode === 'show_notes') {
    return getLatestShowNotes(style);
  }

  const content = query.toLowerCase();

  if (content.includes('overview') || content.includes('整体') || content.includes('概览') || content.includes('风格')) {
    return getOverview();
  }

  if (content.includes('话题') || content.includes('建议') || content.includes('选题')) {
    return getTopicSuggestions();
  }

  if (content.includes('总结') || content.includes('最新') || content.includes('新博客') || content.includes('新集')) {
    return getLatestSummary();
  }

  if (content.includes('rss') || content.includes('文本') || content.includes('解析') || content.includes('原文') || content.includes('关键词')) {
    return getRssTextAnalysisAnswer();
  }

  return '我可以帮助你：\n- 给你一个时髦小姨播客的整体 overview\n- 提供 5 个新话题建议\n- 生成最新一集的总结\n- 基于 RSS 解析文本提取关键词和内容摘要\n\n你可以直接输入“解析一下 RSS 文本内容”或“给我一个整体 overview”。';
}

async function generateOpenAIAnswer(query, options = {}) {
  if (!openaiClient) {
    return { answer: null, error: 'llm_client_not_initialized' };
  }

  const style = normalizeStyle(options.style);
  const mode = String(options.mode || '').toLowerCase();

  const rssContextText = buildRssContext(6)
    .map((item) => `《${item.title}》${item.date ? `(${item.date})` : ''}\n${item.excerpt}`)
    .join('\n\n');

  const taskInstruction = mode === 'show_notes'
    ? '请生成可直接发布的本期 show notes（含：标题、摘要、关键词、核心观点、延展讨论）。'
    : '请基于以下 RSS 解析文本回答用户问题。';

  const prompt = `你是“时髦小姨”播客的智能助手。用户问题：${query}\n\n${taskInstruction}\n\n最近节目文本：\n${rssContextText}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: llmConfig.model,
      messages: [
        {
          role: 'system',
          content: `你是一个思辨型播客助手。${STYLE_PROMPTS[style] || STYLE_PROMPTS.warm} 你的输出必须是中文，信息密度高且可执行。`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 700
    });

    const answer = completion?.choices?.[0]?.message?.content?.trim() || null;
    if (!answer) {
      return { answer: null, error: 'empty_llm_response' };
    }
    return { answer, error: null };
  } catch (error) {
    const msg = error && error.message ? error.message : String(error);
    console.error('OpenAI 请求失败：', msg);
    return { answer: null, error: msg };
  }
}

app.post('/api/assistant/query', async (req, res) => {
  const query = (req.body && req.body.query) ? String(req.body.query) : '';
  const style = req.body && req.body.style ? String(req.body.style) : 'warm';
  const mode = req.body && req.body.mode ? String(req.body.mode) : 'chat';
  if (!query) {
    return res.status(400).json({ error: '请提供 query 参数。' });
  }

  if (openaiClient) {
    const llmResult = await generateOpenAIAnswer(query, { style, mode });
    if (llmResult.answer) {
      return res.json({
        answer: llmResult.answer,
        source: 'llm',
        provider: llmConfig.provider,
        model: llmConfig.model,
        style: normalizeStyle(style),
        mode
      });
    }

    const fallbackPayload = {
      answer: localAssistantAnswer(query, { style, mode }),
      source: 'local',
      provider: llmConfig.provider,
      model: llmConfig.model,
      reason_code: classifyLlmError(llmResult.error),
      style: normalizeStyle(style),
      mode
    };
    if (ASSISTANT_DEBUG && llmResult.error) {
      fallbackPayload.llm_error = llmResult.error;
      fallbackPayload.debug = {
        base_url: llmConfig.baseURL,
        env: llmConfig.fromEnv
      };
    }
    return res.json(fallbackPayload);
  }

  return res.json({
    answer: localAssistantAnswer(query, { style, mode }),
    source: 'local',
    provider: 'local',
    model: 'local-demo',
    style: normalizeStyle(style),
    mode
  });
});

app.get('/api/assistant/rss-context', (req, res) => {
  res.json({
    count: episodes.length,
    sample: buildRssContext(5)
  });
});

app.get('/api/assistant/health', (req, res) => {
  const payload = {
    status: 'ok',
    mode: openaiClient ? 'llm' : 'local',
    provider: openaiClient ? llmConfig.provider : 'local',
    model: openaiClient ? llmConfig.model : 'local-demo'
  };
  if (ASSISTANT_DEBUG) {
    payload.debug = {
      base_url: llmConfig.baseURL,
      env: llmConfig.fromEnv
    };
  }
  res.json(payload);
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API 未找到' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`时髦小姨站点已启动： http://localhost:${port}`);
  const modeLabel = openaiClient ? `${llmConfig.provider.toUpperCase()} (${llmConfig.model})` : '本地 demo';
  console.log(`助手模式：${modeLabel}。`);
});
