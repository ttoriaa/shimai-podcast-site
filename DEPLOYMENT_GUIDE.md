# 🚀 GitHub Pages 部署指南 - 时髦小姨 Podcast

## 📋 部署步骤

### **第 1 步：在 GitHub 创建仓库**

1. 访问 [github.com](https://github.com)
2. 右上角点击 `+` → **New repository**
3. 填写仓库信息：
   - **Repository name**: `shimai-podcast-site`
   - **Description**: 时髦小姨 Podcast 网站
   - **Public** (必须选择公开)
   - ❌ 不要勾选 "Initialize with README"（我们已有本地仓库）
4. 点击 **Create repository**

### **第 2 步：连接本地仓库到 GitHub**

复制以下命令到终端，替换 `YOUR_USERNAME` 为你的 GitHub 用户名：

```bash
cd /Users/vickyli/shimai-podcast-site

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/shimai-podcast-site.git

# 重命名分支为 main（如果需要）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### **第 3 步：启用 GitHub Pages**

1. 打开仓库主页：`https://github.com/YOUR_USERNAME/shimai-podcast-site`
2. 点击 **Settings** (设置)
3. 左侧菜单找到 **Pages**
4. 在 "Build and deployment" 下：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 "main"，文件夹选择 "/ (root)"
   - 点击 **Save**

✅ 2-3 分钟后，GitHub 会生成你的网站地址

**网站地址**: `https://YOUR_USERNAME.github.io/shimai-podcast-site/`

### **第 4 步：验证自动化工作流**

1. 打开仓库主页
2. 点击 **Actions** 标签
3. 你应该看到：
   - ✅ "chore: add GitHub Actions workflow" (已完成)
   - 📅 每天 UTC 0:00 会自动运行 "Update RSS Data"

### **第 5 步（可选）：设置自定义域名**

如果你有自己的域名（例如 `www.xiaoyuzhoufm.com`）：

#### 在 GitHub 配置
1. 仓库 Settings → Pages
2. 在 "Custom domain" 输入你的域名
3. 勾选 "Enforce HTTPS"
4. 保存

#### 在域名供应商配置 DNS
根据你的域名提供商（如阿里云、腾讯云等）添加以下记录：

**方式 A：CNAME 记录（推荐）**
```
类型: CNAME
名称: www
值: YOUR_USERNAME.github.io
```

**方式 B：A 记录**
```
类型: A
名称: @
值: 185.199.108.153
值: 185.199.109.153
值: 185.199.110.153
值: 185.199.111.153
```

---

## ✨ 功能说明

### 📅 自动化更新
- **频率**: 每天 UTC 0:00 (北京时间 08:00)
- **操作**: 自动运行 RSS 解析器
- **文件**: 更新 `episodes.json`
- **推送**: 自动提交到 GitHub

### 🔧 手动触发更新
不想等到每天自动更新？可以手动触发：

1. 打开仓库 → **Actions**
2. 左侧选择 **Update RSS Data**
3. 点击 **Run workflow**
4. 选择 **main** 分支
5. 点击 **Run workflow** 按钮

✅ 会立即开始更新，通常在 1-2 分钟内完成

---

## 🐛 故障排除

### Q: 部署后看到 404 错误
**A**: 等待 2-3 分钟让 GitHub Pages 构建完成。然后刷新页面。

### Q: 自动更新没有工作
**A**: 检查以下内容：
1. 仓库是否是**公开的** (Public)
2. `.github/workflows/update-rss.yml` 文件是否存在
3. 点击 **Actions** 查看工作流运行日志

### Q: 网站样式或资源加载不正确
**A**: 这是因为基础路径问题。编辑 `index.html` 中的链接：
```html
<!-- 改为 -->
<a href="/shimai-podcast-site/episodes.html">节目</a>
```

### Q: 如何从本地同步更多文件？
**A**: 在本地编辑后运行：
```bash
cd /Users/vickyli/shimai-podcast-site
git add .
git commit -m "describe your changes"
git push origin main
```

---

## 📊 预期结果

部署完成后：

| 项目 | 状态 |
|------|------|
| 网站访问 | ✅ `https://YOUR_USERNAME.github.io/shimai-podcast-site/` |
| HTTPS | ✅ 自动支持 |
| SSL 证书 | ✅ 免费的 Let's Encrypt |
| 自动更新 | ✅ 每天 UTC 0:00 运行 |
| 费用 | ✅ 完全免费 |
| 版本控制 | ✅ 所有更改都被记录 |
| CDN | ✅ GitHub 全球加速 |

---

## 🎯 接下来的建议

1. **验证网站**：打开你的网站 URL，确保所有页面正常
2. **测试音频**：点击几个节目确保音频播放正常
3. **观看工作流**：等待明天自动更新，或手动触发测试
4. **分享网站**：将 URL 分享给听众
5. **监控日志**：定期检查 Actions 标签确保更新成功

---

## 💡 常用命令

```bash
# 推送最新改动到 GitHub
git push origin main

# 拉取最新改动
git pull origin main

# 查看提交历史
git log --oneline -10

# 重新配置 Git 用户（可选）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## ✅ 完成清单

- [ ] 创建 GitHub 仓库
- [ ] 推送本地代码到 GitHub
- [ ] 启用 GitHub Pages
- [ ] 验证网站可访问
- [ ] 查看 Actions 工作流是否启用
- [ ] （可选）配置自定义域名
- [ ] 分享网站 URL

---

**需要帮助？** 随时提问！🚀
