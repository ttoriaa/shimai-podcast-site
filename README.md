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
# 在 macOS / Linux 上运行本地静态服务器
python3 -m http.server 8000
# 然后在浏览器打开 http://localhost:8000
```

如需我帮你：生成更多集数、添加 RSS、或者打包为小程序/React 站点。