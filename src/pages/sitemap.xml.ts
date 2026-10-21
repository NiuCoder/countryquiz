import { LANGS, MODE_SLUG, REGIONS, COUNTRIES, SITE, url } from '../lib/site.js';

// 单文件 sitemap：每个页面一条 <loc> + <lastmod>（构建日期）。语言互链由各页面 <head> 里的 hreflang 负责。
export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const paths = LANGS.flatMap((lang) => [
    url(lang),
    url(lang, 'explore/'),
    ...Object.values(MODE_SLUG).flatMap((m) => Object.keys(REGIONS).map((r) => url(lang, `${m}/${r}/`))),
    ...COUNTRIES.map((c) => url(lang, `country/${c.slug}/`)),
  ]);
  const body = paths
    .map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
