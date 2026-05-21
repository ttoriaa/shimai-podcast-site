const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

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
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (error) {
    console.warn('OpenAI 客户端初始化失败，将使用本地 demo 模式：', error.message);
  }
}

function getLatestEpisode() {
  return episodes[0] || null;
}

function getOverview() {
  const latest = getLatestEpisode();
  const categories = Array.from(new Set(episodes.slice(0, 8).map((ep) => ep.category))).join('、');
  return `“时髦小姨”播客的核心是：女性视角与城市生活交织，围绕主体性、审美、旅行体验、关系与精神自由展开。最近几集多以“对谈Talk”为主，话题包括驾驶与规则、离线生活、共识瓦解、审美自信、高敏感体验等。最新一集《${latest ? latest.title : '暂无最新集'}》继续保持真诚、思辨与温度，让听众在复杂时代里找到可用的生活感受。`;
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

  return `最新一集是《${latest.title}》，它继续延展“对谈Talk”的风格：从规则与合理化出发，探讨为什么我们会在生活中选择“继续相信”而不是承认不公平。该集的情绪既有反思，也有释放，适合想要从日常规则里逃离、寻找自我边界的听众。`;
}

function localAssistantAnswer(query) {
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
  return '我可以帮助你：\n- 给你一个时髦小姨播客的整体 overview\n- 提供 5 个新话题建议\n- 生成最新一集的总结\n\n你可以直接输入“给我一个整体 overview”或“帮我总结最新一集”。';
}

async function generateOpenAIAnswer(query) {
  if (!openaiClient) {
    return null;
  }

  const prompt = `你是“时髦小姨”播客的智能助手。用户问题：${query}\n\n请基于以下已发布内容给出简洁、中文、温暖但理性的回答。\n\n已发布集数示例：\n${episodes.slice(0, 8).map((ep) => `${ep.title}：${ep.description}`).join('\n')}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是一个温柔且思辨的播客助手，擅长给出总体 overview、主题建议、最新总结。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 600
    });

    return completion?.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('OpenAI 请求失败：', error);
    return null;
  }
}

app.post('/api/assistant/query', async (req, res) => {
  const query = (req.body && req.body.query) ? String(req.body.query) : '';
  if (!query) {
    return res.status(400).json({ error: '请提供 query 参数。' });
  }

  if (openaiClient) {
    const answer = await generateOpenAIAnswer(query);
    if (answer) {
      return res.json({ answer });
    }
  }

  return res.json({ answer: localAssistantAnswer(query) });
});

app.get('/api/assistant/health', (req, res) => {
  res.json({ status: 'ok', mode: openaiClient ? 'openai' : 'local' });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API 未找到' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`时髦小姨站点已启动： http://localhost:${port}`);
  console.log(`助手模式：${openaiClient ? 'OpenAI' : '本地 demo'}。`);
});
