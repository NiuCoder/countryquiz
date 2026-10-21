import { defineConfig } from 'astro/config';

// 换成正式域名后，同步修改 src/lib/site.js 里的 SITE
export default defineConfig({
  site: 'https://countryquiz.app',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
