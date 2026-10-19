# 看轮廓猜国家 / Guess the Country

当前版本：0.3

多邻国风格的地理小游戏，中英文双语。基于 Astro 构建为静态站点：游戏逻辑是一个 JS 模块，外面套静态 HTML 入口页，方便搜索引擎收录。

## 玩法

- 看轮廓猜国家 / 看国名找轮廓 / 看国旗猜国家 / 看国名找国旗 / 混合挑战
- 学习模式：可拖动、缩放的世界地图，点国家看国旗、首都、当地文字国名，支持朗读
- 题库 165 个国家，三档难度，可按大洲筛选；进度保存在浏览器 localStorage

## 页面结构

| URL | 内容 |
|---|---|
| `/en/`、`/zh/` | 首页（可直接开玩） |
| `/{lang}/{mode}/{region}/` | 玩法 × 地区落地页，例如 `/en/flag-quiz/europe/`，打开即预设该玩法与地区 |
| `/{lang}/explore/` | 学习模式 |
| `/{lang}/country/{slug}/` | 国家详情页（国旗、轮廓、首都、邻国） |
| `/` | 重定向到 `/en/` |

玩法 slug：`shape-quiz`、`find-the-shape-quiz`、`flag-quiz`、`find-the-flag-quiz`、`mixed-quiz`；地区 slug：`world`、`asia`、`europe`、`africa`、`north-america`、`south-america`、`oceania`。

## 目录

- `src/game/game.js`：游戏逻辑，`initGame(cfg)` 启动；`src/game/i18n.js`：界面文字
- `src/data/`：地图（Natural Earth / world-atlas）、国家元数据、首都；`public/flags/`：国旗 SVG（flag-icons，MIT）
- `src/lib/site.js`：站点常量、slug、国家列表；`src/lib/copy.js`：各页面 SEO 文案
- `src/pages/`：路由；`src/layouts/Base.astro`：canonical / hreflang / OG / JSON-LD

新增语言：在 `LANGS`、`I18N`、`copy.js` 里补一套文案即可，路由自动生成。

## 本地开发

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # 输出到 dist/
```

换正式域名时，同步修改 `astro.config.mjs` 的 `site`、`src/lib/site.js` 的 `SITE` 和 `public/robots.txt`。

## Cloudflare Pages 部署

- 生产分支：`main`
- 框架预设：Astro
- 构建命令：`npm run build`
- 构建输出目录：`dist`
