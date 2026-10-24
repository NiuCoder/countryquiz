import META from '../data/meta.json';
import NAMES_FR from '../data/names-fr.json';
import CAPS from '../data/caps.json';
import CAPS_FR from '../data/caps-fr.json';

export const SITE = 'https://countryquiz.app';
export const LANGS = ['en', 'zh', 'fr'];
export const HTML_LANG = { en: 'en', zh: 'zh-CN', fr: 'fr' };
export const LANG_SHORT = { en: 'EN', zh: '中', fr: 'FR' };
export const LANG_NATIVE = { en: 'English', zh: '中文', fr: 'Français' };
export const BRAND = { en: 'Country Quiz', zh: '国家猜猜看', fr: 'Country Quiz' };
/** @deprecated 语言改为下拉后很少用；保留给旧链接文案 */
export const SWITCH_LABEL = {
  en: { en: 'Switch to English', zh: 'Switch to Chinese', fr: 'Switch to French' },
  zh: { en: '切换到英文', zh: '切换到中文', fr: '切换到法语' },
  fr: { en: 'Passer en anglais', zh: 'Passer en chinois', fr: 'Passer en français' },
};

// 玩法 -> URL 段
export const MODE_SLUG = {
  shape: 'shape-quiz',
  findShape: 'find-the-shape-quiz',
  flag: 'flag-quiz',
  findFlag: 'find-the-flag-quiz',
  capital: 'capital-quiz',
  fromCapital: 'guess-country-by-capital',
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
  id, zh, tier, cont, fi, drop, a2, en, nat,
  fr: NAMES_FR[a2] || en,
  slug: slugify(en),
}));

export const regionOf = (cont) => Object.keys(REGIONS).find((k) => REGIONS[k] === cont);
export const url = (lang, path = '') => `/${lang}/${path}`;
export const nextLang = (lang) => LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
export const nameOf = (c, lang) => (lang === 'zh' ? c.zh : lang === 'fr' ? (c.fr || c.en) : c.en);
export const capOf = (a2, lang) => {
  if (lang === 'fr') return CAPS_FR[a2] || (CAPS[a2] || ['', ''])[1] || '';
  const row = CAPS[a2] || ['', ''];
  return lang === 'zh' ? row[0] : row[1];
};
