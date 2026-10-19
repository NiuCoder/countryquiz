# 看轮廓猜国家

一个根据国家轮廓猜名字的中文地理小游戏。

在线体验：https://countryshape-43r.pages.dev

## 本地运行

直接用浏览器打开 `看轮廓猜国家.html`，或在项目目录运行：

```sh
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/看轮廓猜国家.html`。

页面通过 CDN 加载 D3、TopoJSON 和 Google Fonts，需要联网。学习进度保存在当前浏览器的 localStorage 中。

## Cloudflare Pages 部署

- 生产分支：`main`
- 框架预设：无
- 构建命令：`mkdir -p dist && cp '看轮廓猜国家.html' dist/index.html`
- 构建输出目录：`dist`

构建只把原始 HTML 复制为网站首页，不修改游戏代码。
推送到 `main` 分支后，Cloudflare Pages 会自动构建并部署。
