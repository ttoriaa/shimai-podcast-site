/**
 * RSS Parser for 时髦小姨 Podcast
 * 从 RSS 源解析节目数据并生成 episodes.json
 */
const fs = require('fs');
const https = require('https');

const RSS_URL = 'https://feed.xyzfm.space/udvfuub6rpkp';
const OUTPUT_FILE = 'episodes.json';

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

// 简单的 XML 解析函数
function parseXML(xml) {
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
      const title = titleMatch[1].trim();
      let url = enclosureMatch[1];

      // 从复杂的 URL 中提取实际的音频地址。
      if (url.includes('media.xyzcdn.net')) {
        const mediaIdx = url.indexOf('media.xyzcdn.net');
        url = 'https://' + url.substring(mediaIdx);
      }

      const guid = guidMatch ? guidMatch[1].trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
      const duration = durationMatch ? durationMatch[1].trim() : '00:00:00';

      // 保留完整文本 + 前台展示短摘要
      const descriptionFull = descMatch ? decodeHtmlEntities(descMatch[1]) : '';
      const description = descriptionFull.slice(0, 150).trim();

      // 解析日期格式 "Sun, 17 May 2026 00:00:00 GMT" -> "2026-05-17"
      let date = '';
      if (pubDate) {
        const dateObj = new Date(pubDate);
        date = dateObj.toISOString().split('T')[0];
      }

      episodes.push({
        id: episodes.length,
        guid,
        title,
        description,
        descriptionFull,
        duration,
        date,
        audio: url,
        category: '对谈Talk'
      });
    }
  }

  return episodes;
}

function fetchRSS() {
  return new Promise((resolve, reject) => {
    https.get(RSS_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const episodes = parseXML(data);
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
    const episodes = await fetchRSS();

    if (episodes.length === 0) {
      console.error('无法从 RSS 源解析任何节目');
      process.exit(1);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(episodes, null, 2), 'utf-8');

    console.log(`✅ 成功解析并保存 ${episodes.length} 个节目`);
    console.log(`✅ 文件已保存到: ${OUTPUT_FILE}`);

    console.log('\n最新节目列表:');
    episodes.slice(0, 3).forEach((ep) => {
      console.log(` - ${ep.title}`);
      console.log(`   URL: ${ep.audio.substring(0, 80)}...`);
    });
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

main();
