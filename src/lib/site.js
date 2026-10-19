import META from '../data/meta.json';

export const SITE = 'https://countryshape-43r.pages.dev';
export const LANGS = ['en', 'zh'];
export const HTML_LANG = { en: 'en', zh: 'zh-CN' };

// 玩法 -> URL 段
export const MODE_SLUG = {
  shape: 'shape-quiz',
  findShape: 'find-the-shape-quiz',
  flag: 'flag-quiz',
  findFlag: 'find-the-flag-quiz',
  mix: 'mixed-quiz',
};
// URL 段 -> 游戏内部使用的中文大洲名（存档里也是这个值）
export const REGIONS = {
  world: '全世界',
  asia: '亚洲',
  europe: '欧洲',
  africa: '非洲',
  'north-america': '北美洲',
  'south-america': '南美洲',
  oceania: '大洋洲',
};

export const slugify = (en) =>
  en.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const COUNTRIES = Object.entries(META).map(([id, [zh, tier, cont, fi, drop, a2, en, nat]]) => ({
  id, zh, tier, cont, fi, drop, a2, en, nat, slug: slugify(en),
}));

export const regionOf = (cont) => Object.keys(REGIONS).find((k) => REGIONS[k] === cont);
export const url = (lang, path = '') => `/${lang}/${path}`;
