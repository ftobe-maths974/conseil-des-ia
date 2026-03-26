import { defineConfig } from 'astro/config';

// Remplace 'conseil-des-ia' par le nom exact de ton repo GitHub
export default defineConfig({
  site: 'https://ftobe-maths974.github.io',
  base: '/conseil-des-ia',
  output: 'static',
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
