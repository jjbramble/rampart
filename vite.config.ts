import { defineConfig } from 'vite';

// base matches the GitHub Pages path: https://jjbramble.github.io/rampart/
export default defineConfig({
  base: '/rampart/',
  build: { chunkSizeWarningLimit: 2000 },
});
