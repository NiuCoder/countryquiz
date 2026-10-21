// 生成社交分享图 public/og-en.png、public/og-zh.png（1200×630）。
// 用法：node scripts/make-og.mjs（依赖 sharp，Astro 已带；中文字体取系统里的 PingFang SC）
import fs from 'fs';
import sharp from 'sharp';

const FLAGS = ['JP', 'BR', 'FR', 'EG', 'AU', 'CA', 'IN', 'ZA', 'DE', 'AR'];
const flagImg = (a2, x, y, w) => {
  const svg = fs.readFileSync(`public/flags/${a2}.svg`, 'utf8');
  const uri = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  return `<clipPath id="c${a2}"><rect x="${x}" y="${y}" width="${w}" height="${w * 0.75}" rx="10"/></clipPath>
  <image href="${uri}" x="${x}" y="${y}" width="${w}" height="${w * 0.75}" preserveAspectRatio="xMidYMid slice" clip-path="url(#c${a2})"/>
  <rect x="${x}" y="${y}" width="${w}" height="${w * 0.75}" rx="10" fill="none" stroke="#e5e5e5" stroke-width="3"/>`;
};
const mascot = `<g transform="translate(80,115) scale(3.7)">
  <circle cx="50" cy="52" r="44" fill="#1cb0f6"/>
  <path d="M18 40 q6-14 20-12 q7 5 0 12 q-9 3 -7 11 q-5 6 -11 0 q-4-5 -2-11z" fill="#58cc02"/>
  <path d="M64 74 q11-5 17 3 q-3 10 -14 11 q-7-5 -3-14z" fill="#58cc02"/>
  <circle cx="37" cy="46" r="11" fill="#fff"/><circle cx="63" cy="46" r="11" fill="#fff"/>
  <circle cx="39" cy="47" r="6" fill="#3c3c3c"/><circle cx="65" cy="47" r="6" fill="#3c3c3c"/>
  <path d="M42 68 q8 7 16 0" fill="none" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round"/></g>`;

const cards = {
  en: { title: 'Country Quiz', sub: 'Flags · Map shapes · Capitals', font: 'Arial Rounded MT Bold, Arial' },
  zh: { title: '国家猜猜看', sub: '国旗 · 地图轮廓 · 首都', font: 'PingFang SC, Hiragino Sans GB, Arial' },
};
for (const [lang, c] of Object.entries(cards)) {
  const flags = FLAGS.map((a, i) => flagImg(a, 60 + i * 112, 520, 96)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="12" fill="#58cc02"/>
  ${mascot}
  <text x="520" y="260" font-family="${c.font}" font-size="92" font-weight="900" fill="#58cc02">${c.title}</text>
  <text x="520" y="350" font-family="${c.font}" font-size="44" font-weight="700" fill="#777777">${c.sub}</text>
  <text x="520" y="430" font-family="${c.font}" font-size="34" font-weight="700" fill="#1899d6">countryquiz.app</text>
  ${flags}
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`public/og-${lang}.png`);
}
console.log('done');
