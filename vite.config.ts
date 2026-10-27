import { reactRouter } from '@react-router/dev/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  envDir: 'src',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
