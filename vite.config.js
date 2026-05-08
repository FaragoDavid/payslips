import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  root: 'src',
  envDir: '..',
  base: mode === 'production' ? '/payslips/' : '/',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    port: 8001,
  },
}));
