import { reactRouter } from '@react-router/dev/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  envDir: 'src',
  resolve: {
    alias: [
      { find: '@app', replacement: path.resolve(__dirname, './src/app/index.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
