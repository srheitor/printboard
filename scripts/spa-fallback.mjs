// GitHub Pages não conhece as rotas do React Router.
// Copiar index.html para 404.html faz /produtos, /admin etc. funcionarem ao recarregar a página.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('✓ dist/404.html criado (fallback de SPA)');
