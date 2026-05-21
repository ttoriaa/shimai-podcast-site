# 时髦小姨 Podcast 静态站点

轻量静态多页网站，包含：

- `index.html` - 首页
- `episodes.html` - 节目列表
- `episode.html` - 单集页面（使用 `?id=` 参数）
- `about.html` - 关于主持人
- `styles.css` - 全站样式
- `episodes.json` - 节目数据
- `episodes.js` / `episode.js` - 页面脚本

快速预览：

```bash
cd shimai-podcast-site
# 安装后端依赖
npm install
# 运行 Node + 静态站点 demo
npm start
# 然后在浏览器打开 http://localhost:3000
```

如果你希望启用 OpenAI 模型，请先设置环境变量：

```bash
export OPENAI_API_KEY=your_api_key_here
npm start
```

这样就能在首页看到“AI 智能助手”版块，支持播客 overview、话题建议和最新总结。

## RSS 更新

你也可以直接通过 npm 命令更新 RSS 数据：

```bash
npm run update-rss
```

该命令会从 RSS 源抓取最新节目并同步写入 `episodes.json`。

如需我帮你：生成更多集数、添加 RSS、或者打包为小程序/React 站点。