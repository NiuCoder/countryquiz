# 国家猜猜看（Country Quiz）

[English](README.md) | 简体中文

当前版本 0.3.0 · 线上地址：https://countryquiz.app

多邻国风格的地理小游戏，包含轮廓、国旗、国名、首都等多种玩法，目前支持英文、中文、法文。基于 Astro 构建为静态站点：游戏逻辑是一个 JS 模块，外面套静态 HTML 页面，方便搜索引擎收录。

## 玩法

- 看轮廓猜国家 / 看国名找轮廓 / 看国旗猜国家 / 看国名找国旗 / 看国名猜首都 / 看首都猜国家 / 混合挑战
- 学习模式：可拖动、缩放的世界地图，点国家查看国旗、轮廓、首都、所在大洲和当地文字国名，支持朗读
- 题库 165 个国家，分入门、进阶、挑战三档，可按大洲筛选
- 答错的题会在本组结束前再考一次；进度保存在浏览器 localStorage 中，不需要注册

## 页面结构

| URL | 内容 |
|---|---|
| `/en/`、`/zh/`、`/fr/` | 首页，可直接开始练习 |
| `/{lang}/{mode}/{region}/` | 玩法 × 地区落地页，例如 `/en/flag-quiz/europe/`，打开即预设该玩法与地区 |
| `/{lang}/explore/` | 学习模式（世界地图） |
| `/{lang}/country/{slug}/` | 国家详情页：国旗、轮廓、首都、邻国 |
| `/` | 跳转到 `/en/`（由 `public/_redirects` 实现） |
| `/sitemap.xml` | 包含所有页面的单文件 sitemap，构建时生成 |

- 玩法 slug：`shape-quiz`、`find-the-shape-quiz`、`flag-quiz`、`find-the-flag-quiz`、`capital-quiz`、`guess-country-by-capital`、`mixed-quiz`
- 地区 slug：`world`、`asia`、`europe`、`africa`、`north-america`、`south-america`、`oceania`
- 每种语言约 215 个页面：49 个落地页、165 个国家页，外加首页、学习模式

## 目录

- `src/game/game.js`：游戏逻辑，由 `initGame(cfg)` 启动；`src/game/i18n.js`：界面文字
- `src/data/`：地图轮廓（Natural Earth / world-atlas）、国家元数据、首都
- `public/flags/`：国旗 SVG（flag-icons，MIT 许可）
- `src/lib/site.js`：站点常量、slug、国家列表；`src/lib/copy.js`：各页面的 SEO 标题与描述
- `src/pages/`：路由（含 `sitemap.xml.ts`）；`src/layouts/Base.astro`：canonical、hreflang、OG、JSON-LD
- `scripts/make-og.mjs`：重新生成分享图 `public/og-en.png`、`public/og-zh.png`、`public/og-fr.png`

## 新增语言

在 `LANGS`（`src/lib/site.js`）、`I18N`（`src/game/i18n.js`）和 `copy.js` 里补充对应文案，路由会自动生成。

## 本地开发

需要 Node.js 22.22 或以上（仓库根目录的 `.node-version` 指定为 24）。

```sh
npm install
npm run dev      # http://localhost:4321/（注意：/ 的跳转只在 Cloudflare 上生效，本地请直接打开 /en/）
npm run build    # 输出到 dist/
npm run preview  # 预览构建结果
```

## 部署（Cloudflare Pages）

- 生产分支：`main`
- 框架预设：None
- 构建命令：`npm run build`
- 构建输出目录：`dist`

更换域名时，同步修改 `astro.config.mjs` 的 `site`、`src/lib/site.js` 的 `SITE` 和 `public/robots.txt` 中的 Sitemap 地址。
