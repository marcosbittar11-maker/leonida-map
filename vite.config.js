import { defineConfig } from 'vite';
// icons.html: galeria de desenvolvimento dos símbolos (também publicada, funciona offline).
export default defineConfig({ base: './', build: { rollupOptions: { input: { main: 'index.html', icons: 'icons.html' } } } });
