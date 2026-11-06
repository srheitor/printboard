import { publicUrl } from '@/shared/utils/assets';
import { blobToBase64 } from '@/shared/utils/image';
import { ConflictError, type CatalogRepository, type LoadedCatalog, type SaveRequest } from './types';

const API = '/__local-api';

/**
 * Grava direto nos arquivos do projeto (public/data/catalogo.json e public/img/produtos).
 * Disponível apenas com `npm run dev` — veja vite-plugins/local-catalog-api.ts.
 */
export class LocalCatalogRepository implements CatalogRepository {
  readonly kind = 'local' as const;
  readonly label = 'Arquivos locais (modo desenvolvimento)';
  /** Força o navegador a recarregar imagens alteradas nesta sessão. */
  private readonly bust = Date.now();

  async load(): Promise<LoadedCatalog> {
    const res = await fetch(`${API}/catalogo`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Modo local indisponível. Ele só funciona rodando "npm run dev".');
    return res.json();
  }

  async save({ catalogo, baseVersion, uploads, deletions }: SaveRequest): Promise<string | null> {
    const body = {
      catalogo,
      baseVersion,
      deletions,
      uploads: await Promise.all(uploads.map(async (u) => ({ path: u.path, base64: await blobToBase64(u.data) }))),
    };
    const res = await fetch(`${API}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) throw new ConflictError(data.error);
    if (!res.ok) throw new Error(data.error ?? `Erro ao salvar (${res.status})`);
    return data.version ?? null;
  }

  imageUrl(path: string): string {
    return `${publicUrl(path)}?v=${this.bust}`;
  }
}
