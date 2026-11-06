/** Converte um caminho relativo da pasta public em URL respeitando o BASE_URL do Vite. */
export function publicUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
