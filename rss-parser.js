/**
 * RSS Parser for 时髦小姨 Podcast
 * 从 RSS 源解析节目数据并生成 episodes.json
 *
 * 分类规则说明：
 * 1) 分类由 category-rules.json 控制（可维护映射表）
 * 2) 后续新增或调整关键词时，只需改规则文件，不需要改本脚本
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const RSS_URL = 'https://feed.xyzfm.space/udvfuub6rpkp';
const OUTPUT_FILE = 'episodes.json';
const CATEGORY_RULES_FILE = 'category-rules.json';

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s\-_.|｜,:;!?()[\]{}'"“”‘’、，。！？：；·]+/g, '');
}

function getDefaultCategoryRules() {
  return {
    defaultCategory: '个人成长|碎碎念',
    rules: [
      {
        category: '何以丰荣|城市切片',
        keywords: [
          '何以丰荣',
          '城市',
          '北京',
          '巴黎',
          '罗马',
          '成都',
          '重庆',
          '巴厘岛',
          '夏威夷',
          '德国',
          '意大利',
          '伯克利',
          '车展',
          '北影节'
        ]
      },
      {
        category: '对谈Talk',
        keywords: [
          '对谈',
          '访谈',
          '聊天',
          'talk',
          '学术对谈',
          '大谈特谈',
          'x '
        ]
      },
      {
        category: '个人成长|碎碎念',
        keywords: [
          '人生',
          '世界观',
          '存在主义',
          '社会时钟',
          '亲密关系',
          '高敏感',
          '秩序',
          '熵增',
          '自驱力',
          '职场',
          'fomo',
          '无聊',
          '自由',
          '焦虑',
          '成长'
        ]
      }
    ]
  };
}

function loadCategoryRules() {
  const defaultRules = getDefaultCategoryRules();
  const filePath = path.resolve(process.cwd(), CATEGORY_RULES_FILE);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultRules, null, 2), 'utf-8');
    console.log('⚠️ 未找到 ' + CATEGORY_RULES_FILE + '，已自动创建默认规则文件');
    return defaultRules;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.rules)) {
      throw new Error('rules 字段缺失或不是数组');
    }

    return parsed;
  } catch (err) {
    console.warn('⚠️ 读取 ' + CATEGORY_RULES_FILE + ' 失败，改用默认规则：' + err.message);
    return defaultRules;
  }
}

function classifyByTitle(title, categoryConfig) {
  const normalizedTitle = normalizeText(title);
  const rules = Array.isArray(categoryConfig && categoryConfig.rules)
    ? categoryConfig.rules
    : [];

  for (const rule of rules) {
    const category = rule && rule.category;
    const keywords = Array.isArray(rule && rule.keywords) ? rule.keywords : [];

    if (!category || keywords.length === 0) {
      continue;
    }

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedTitle.includes(normalizedKeyword)) {
        return category;
      }
    }
  }

  return (categoryConfig && categoryConfig.defaultCategory) || '个人成长|碎碎念';
}

// 简单的 XML 解析函数
function parseXML(xml, categoryConfig) {
  const episodes = [];

  // 使用正则表达式提取 <item> 节点
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1];

    // 提取各个字段
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
    const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(itemContent);
    const guidMatch = /<guid[^>]*>(.*?)<\/guid>/.exec(itemContent);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
    const durationMatch = /<itunes:duration>([\s\S]*?)<\/itunes:duration>/.exec(itemContent);
    const enclosureMatch = /<enclosure\s+url="([^"]*)"/.exec(itemContent);

    if (titleMatch && enclosureMatch) {
      const title = decodeHtmlEntities(titleMatch[1]);
      let url = enclosureMatch[1];

      // 从复杂 URL 中提取真实音频地址
      if (url.includes('media.xyzcdn.net')) {
        const mediaIdx = url.indexOf('media.xyzcdn.net');
        url = 'https://' + url.substring(mediaIdx);
      }

      const guid = guidMatch ? guidMatch[1].trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
      const duration = durationMatch ? durationMatch[1].trim() : '00:00:00';

      // 描述去 HTML 后截断
      const description = descMatch
        ? decodeHtmlEntities(descMatch[1]).slice(0, 150).trim()
        : '';

      // 解析日期格式: Sun, 17 May 2026 00:00:00 GMT -> 2026-05-17
      let date = '';
      if (pubDate) {
        const dateObj = new Date(pubDate);
        if (!Number.isNaN(dateObj.getTime())) {
          date = dateObj.toISOString().split('T')[0];
        }
      }

      episodes.push({
        id: episodes.length,
        guid: guid,
        title: title,
        description: description,
        duration: duration,
        date: date,
        audio: url,
        category: classifyByTitle(title, categoryConfig)
      });
    }
  }

  return episodes;
}

function fetchRSS(categoryConfig) {
  return new Promise((resolve, reject) => {
    https.get(RSS_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const episodes = parseXML(data, categoryConfig);
          resolve(episodes);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('正在从 RSS 源获取节目数据...');

    const categoryConfig = loadCategoryRules();
    const episodes = await fetchRSS(categoryConfig);

    if (episodes.length === 0) {
      console.error('无法从 RSS 源解析任何节目');
      process.exit(1);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(episodes, null, 2), 'utf-8');

    console.log('✅ 成功解析并保存 ' + episodes.length + ' 个节目');
    console.log('✅ 文件已保存到: ' + OUTPUT_FILE);
    console.log('✅ 分类规则来源: ' + CATEGORY_RULES_FILE + '（共 ' + categoryConfig.rules.length + ' 组）');

    console.log('\n最新节目列表:');
    episodes.slice(0, 3).forEach((ep) => {
      console.log(' - [' + ep.category + '] ' + ep.title);
      console.log('   URL: ' + ep.audio.substring(0, 80) + '...');
    });
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

main();
