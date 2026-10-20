// 落地页 / 国家页的 SEO 文案(中英文)
export const MODE_NAME = {
  en: { shape: 'Country Shape Quiz', findShape: 'Find the Country Shape Quiz', flag: 'Flag Quiz', findFlag: 'Find the Flag Quiz', capital: 'Capital Quiz', fromCapital: 'Guess the Country by Capital', mix: 'Mixed Geography Quiz' },
  zh: { shape: '看轮廓猜国家', findShape: '看国名找轮廓', flag: '看国旗猜国家', findFlag: '看国名找国旗', capital: '看国名猜首都', fromCapital: '看首都猜国家', mix: '地理混合挑战' },
};
export const REGION_NAME = {
  en: { world: 'World', asia: 'Asia', europe: 'Europe', africa: 'Africa', 'north-america': 'North America', 'south-america': 'South America', oceania: 'Oceania' },
  zh: { world: '全世界', asia: '亚洲', europe: '欧洲', africa: '非洲', 'north-america': '北美洲', 'south-america': '南美洲', oceania: '大洋洲' },
};
const HOW = {
  en: {
    shape: 'You see the outline of a country and pick its name from four options.',
    findShape: 'You see a country name and pick its outline from four shapes.',
    flag: 'You see a flag and pick the country it belongs to.',
    findFlag: 'You see a country name and pick its flag from four.',
    capital: 'You see a country name and pick its capital city from four options.',
    fromCapital: 'You see a capital city and pick the country it belongs to.',
    mix: 'Shapes, flags and names are shuffled together in one lesson.',
  },
  zh: {
    shape: '看到一个国家的轮廓，从四个选项里选出国名。',
    findShape: '看到国名，从四个轮廓里挑出正确的。',
    flag: '看到一面国旗，选出它属于哪个国家。',
    findFlag: '看到国名，从四面国旗里挑出正确的。',
    capital: '看到一个国家的名字，从四个选项里选出它的首都。',
    fromCapital: '看到一座首都城市，选出它是哪个国家的首都。',
    mix: '轮廓、国旗、国名四种题型在一组练习里随机出现。',
  },
};

export function landing(lang, mode, region, n) {
  const m = MODE_NAME[lang][mode], r = REGION_NAME[lang][region];
  if (lang === 'zh') {
    return {
      title: `${m}：${r}（${n} 个国家）| 国家猜猜看`,
      h1: `${m}：${r}`,
      description: `免费在线地理小游戏：${HOW.zh[mode]}覆盖${r} ${n} 个国家，答错的题会再出现，附首都、当地文字国名，无需注册。`,
      intro: `${HOW.zh[mode]}本组题库覆盖${r}的 ${n} 个国家，分入门、进阶、挑战三档难度。每道题答完会显示国家在地球上的位置、国旗、中英文名称、当地文字国名，答错的题会在本组结束前再考一次。`,
    };
  }
  return {
    title: `${m}: ${r} (${n} Countries) | Guess the Country`,
    h1: `${m}: ${r}`,
    description: `Free online geography game. ${HOW.en[mode]} Covers ${n} countries in ${r}, with capitals and local names. No sign-up.`,
    intro: `${HOW.en[mode]} This set covers ${n} countries in ${r === 'World' ? 'the world' : r}, in three difficulty levels. After each answer you see where the country sits on the globe, its flag, its names in English and Chinese and in its local script. Missed questions come back before the lesson ends.`,
  };
}

export const HOME = {
  en: {
    title: 'Guess the Country: Free Flag, Map & Shape Quiz',
    h1: 'Guess the Country: free flag and map shape quiz',
    description: 'Learn world geography the Duolingo way. Guess countries from their outline or flag, with capitals and local names. 165 countries, free, no sign-up.',
    intro: 'Guess the country from its shape or its flag, find the right outline or flag for a country name, or test yourself on capital cities. 165 countries, three difficulty levels, filter by continent. An explore mode lets you zoom a world map and tap any country for its flag, capital and local name.',
  },
  zh: {
    title: '国家猜猜看：免费国旗、地图轮廓地理小游戏',
    h1: '国家猜猜看：免费国旗与地图轮廓地理游戏',
    description: '多邻国风格的地理小游戏：看轮廓或国旗猜国家，附首都与当地文字国名。165 个国家，分难度、可按大洲筛选，免费、无需注册。',
    intro: '看轮廓或国旗猜国家，也可以看国名找轮廓、找国旗，还能练首都。题库 165 个国家，三档难度，可按大洲筛选。学习模式里可以拖动缩放世界地图，点任意国家查看国旗、首都和当地文字国名。',
  },
};

export const EXPLORE = {
  en: { title: 'World Map Explorer: Flags, Capitals & Names | Guess the Country', h1: 'Explore the world map', description: 'Drag and zoom an interactive world map. Tap any country to see its flag, outline, capital, continent and local name, and hear it pronounced.' },
  zh: { title: '世界地图学习模式：国旗、首都与国名 | 国家猜猜看', h1: '世界地图学习模式', description: '可拖动、缩放的世界地图。点任意国家查看国旗、轮廓、首都、所在大洲和当地文字国名，还能朗读。' },
};

export function country(lang, c, name, cap, contName) {
  if (lang === 'zh') {
    return {
      title: `${name}国旗、地图轮廓、首都与基本信息 | 国家猜猜看`,
      h1: `${name}：国旗与地图轮廓`,
      description: `查看${name}（${c.en}）的国旗、地图轮廓、所在大洲（${contName}）${cap ? `、首都${cap}` : ''}和当地文字国名，并用免费地理小游戏测试自己。`,
    };
  }
  return {
    title: `${name}: Flag, Map Outline, Capital & Facts | Guess the Country`,
    h1: `${name}: flag and map outline`,
    description: `See the flag of ${name}, its outline on the map, continent (${contName})${cap ? `, capital ${cap}` : ''} and local name. Then test yourself with a free geography quiz.`,
  };
}
