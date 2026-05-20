# 时髦小姨 Podcast 网站 - RSS 自动化指南

## 快速开始

### 1. 更新节目数据
运行以下命令从 RSS 源获取最新的节目数据:

```bash
node rss-parser.js
```

**输出示例**:
```
正在从 RSS 源获取节目数据...
✅ 成功解析并保存 25 个节目
✅ 文件已保存到: episodes.json

最新节目列表:
  - Vol25. 德国驾校背后，"懂事"是我最讨厌的评价
    URL: https://media.xyzcdn.net/677df5c121f2ffde67508243/lkRhcmCpZbKUX...
  - Vol24. 共识瓦解时，或是我们从未达成过
    URL: https://media.xyzcdn.net/677df5c121f2ffde67508243/lk-5uHSgh6CM8y...
```

### 2. RSS 源信息
- **RSS 链接**: https://feed.xyzfm.space/udvfuub6rpkp
- **播客平台**: 小宇宙 (Xiaoyuzhoufm)
- **播客名称**: 时髦小姨
- **更新频率**: 建议每 24 小时更新一次

### 3. 文件说明

#### `rss-parser.js`
自动化 RSS 解析工具
- 从 RSS 源获取节目数据
- 自动清理和格式化 URL
- 生成 `episodes.json`

**功能**:
- ✅ 处理复杂的 CDN URL 格式
- ✅ 提取节目元数据（标题、描述、时长、日期）
- ✅ 规范化日期格式 (YYYY-MM-DD)
- ✅ 错误处理和日志输出

#### `episodes.json`
生成的节目数据文件，格式:
```json
[
  {
    "id": 0,
    "guid": "unique-episode-id",
    "title": "节目标题",
    "description": "节目描述",
    "duration": "00:26:04",
    "date": "2026-05-17",
    "audio": "https://media.xyzcdn.net/...",
    "category": "对谈Talk"
  }
]
```

#### `episode.html` / `episode.js`
节目详情页面
- 从 URL 参数 `?id=X` 获取节目 ID
- 加载相应节目数据
- 使用 HTML5 audio 标签播放
- 支持音频播放失败时的备用链接

#### `episodes.html` / `episodes.js`
节目列表页面
- 展示所有节目卡片
- 支持按分类筛选
- 链接到单集详情页

### 4. 自动化更新 (推荐)

#### 使用 cron 任务 (macOS/Linux)

编辑 crontab:
```bash
crontab -e
```

添加每天午夜自动更新的任务:
```cron
0 0 * * * cd /Users/vickyli/shimai-podcast-site && node rss-parser.js >> rss-parser.log 2>&1
```

或每 6 小时更新一次:
```cron
0 */6 * * * cd /Users/vickyli/shimai-podcast-site && node rss-parser.js >> rss-parser.log 2>&1
```

#### 使用 Node.js 脚本定时器

创建 `update-scheduler.js`:
```javascript
const { spawn } = require('child_process');
const schedule = require('node-schedule');

// 每 6 小时运行一次
schedule.scheduleJob('0 */6 * * *', () => {
  console.log('开始更新 RSS 数据...');
  spawn('node', ['rss-parser.js']);
});

console.log('RSS 自动更新计划已启动');
```

### 5. 故障排除

#### 问题: 无法获取 RSS 数据
**解决方案**:
- 检查网络连接
- 验证 RSS URL 是否正确
- 检查是否有防火墙/代理限制

#### 问题: 音频播放失败
**解决方案**:
- 确认音频 URL 可访问 (在浏览器中打开)
- 使用备用链接直接打开音频文件
- 检查浏览器是否支持 MP4/M4A 格式
- 查看浏览器控制台是否有错误信息

#### 问题: JSON 文件格式错误
**解决方案**:
- 删除 `episodes.json`
- 重新运行 `node rss-parser.js`
- 检查文件权限 `ls -la episodes.json`

### 6. 技术细节

#### URL 处理逻辑
RSS 源提供的 URL 格式:
```
https://dts-api.xiaoyuzhoufm.com/track/{podcastId}/{episodeId}/media.xyzcdn.net/{podcastId}/{filename}.m4a
```

解析器自动提取实际的 CDN URL:
```
https://media.xyzcdn.net/{podcastId}/{filename}.m4a
```

#### 数据验证
- ✅ 检查 XML 格式
- ✅ 验证必需字段 (标题, URL)
- ✅ 处理缺失字段的默认值
- ✅ 错误时输出详细日志

### 7. 常用命令

```bash
# 手动更新数据
node rss-parser.js

# 查看最新的 episodes.json
cat episodes.json | jq '.[0:3]'

# 检查 JSON 格式是否正确
jq empty episodes.json && echo "JSON 格式正确"

# 计算节目总数
cat episodes.json | jq 'length'

# 查看更新日志
tail -f rss-parser.log

# 检查特定节目信息
jq '.[] | select(.id==0)' episodes.json
```

### 8. 注意事项

⚠️ **重要**:
- 不要手动编辑 `episodes.json`，运行 `rss-parser.js` 会覆盖
- 如需添加自定义字段，请修改 `rss-parser.js` 中的解析逻辑
- 确保有足够的磁盘空间存储音频 URL 和元数据
- 定期检查 cron 任务日志确保自动更新正常运行

### 9. 支持的格式

**支持的音频格式**:
- ✅ MP4 (audio/mp4)
- ✅ M4A (audio/mp4)
- ✅ AAC (audio/aac)

**浏览器兼容性**:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### 10. 相关资源

- 📖 [RSS 规范](https://www.rss-specification.com/)
- 📖 [HTML5 Audio 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
- 📖 [Node.js 文件系统](https://nodejs.org/api/fs.html)

---

**最后更新**: 2026-05-20
**版本**: 1.0
**作者**: Podcast 网站维护团队
