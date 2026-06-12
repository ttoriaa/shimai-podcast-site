/**
 * RSS Parser for 时髦小姨 Podcast
 * 从 RSS 源解析节目数据并生成 episodes.json
 */
const fs = require('fs');
const https = require('https');


const RSS_URL = 'https://feed.xyzfm.space/udvfuub6rpkp';
const OUTPUT_FILE = 'episodes.json';
const CATEGORY_CONFIG = { defaultCategory: '个人成长|碎碎念', rules: [ { category: '何以丰荣|城市切片', keywords: ['何以丰荣', '城市', '北京', '巴黎', '罗马', '成都', '重庆', '巴厘岛', '夏威夷', '德国', '意大利', '伯克利', '车展', '北影节'] }, { category: '对谈Talk', keywords: ['对谈', '访谈', '聊天', 'talk', '学术对谈', '大谈特谈', 'x '] }, { category: '个人成长|碎碎念', keywords: ['人生', '世界观', '存在主义', '社会时钟', '亲密关系', '高敏感', '秩序', '熵增', '自驱力', '职场', 'fomo', '无聊', '自由', '焦虑', '成长'] } ] };

function normalizeTitle(text) {
  return String(text || '').toLowerCase().replace(/[\s\-_.|｜,:;!?()\[\]{}'"“”‘’、，。！？：；·]+/g, '');
}

function classifyByTitle(title) {
  const normalized = normalizeTitle(title);
  for (const rule of CATEGORY_CONFIG.rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(normalizeTitle(keyword))) {
        return rule.category;
      }
    }
  }
  return CATEGORY_CONFIG.defaultCategory;
}


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
