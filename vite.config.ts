import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localCatalogApi } from './vite-plugins/local-catalog-api';

// BASE_PATH: use "/" com domínio próprio (ex.: caixasparapizzabh.com.br)
// ou "/nome-do-repo/" se publicar em usuario.github.io/nome-do-repo.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), localCatalogApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
