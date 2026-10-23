import { defineConfig } from 'vitest/config';

// Base relativa: el juego se publica en una subcarpeta de GitHub Pages
// (…/Juegos-apps-claude/leyendas-de-iberia/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
