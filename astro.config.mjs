import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 换成正式域名后，同步修改 src/lib/site.js 里的 SITE
export default defineConfig({
  site: 'https://countryquiz.app',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-CN' } },
    }),
  ],
});
