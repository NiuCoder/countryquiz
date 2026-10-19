import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 换成正式域名后，同步修改 src/lib/site.js 里的 SITE
export default defineConfig({
  site: 'https://countryshape-43r.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects: { '/': '/en/' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-CN' } },
    }),
  ],
});
