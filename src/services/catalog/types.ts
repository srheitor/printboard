import type { Catalogo } from '@/shared/types/catalog';

/** Caminho do catálogo dentro da pasta public. */
export const CATALOG_PATH = 'data/catalogo.json';
/** Pasta (dentro de public) onde as imagens dos produtos são gravadas. */
export const PRODUCT_IMAGES_DIR = 'img/produtos';

export interface LoadedCatalog {
  catalogo: Catalogo;
  /** Identificador da versão carregada — usado para detectar edições simultâneas. */
  version: string | null;
}

export interface FileUpload {
  /** Caminho relativo à pasta public, ex.: "img/produtos/caixa-abc.webp" */
  path: string;
  data: Blob;
}

export interface SaveRequest {
  catalogo: Catalogo;
  baseVersion: string | null;
  uploads: FileUpload[];
  /** Caminhos (relativos à public) de arquivos a remover. */
  deletions: string[];
  /** Descrição da alteração (vira a mensagem do commit no modo GitHub). */
  message: string;
}

/**
 * Contrato de armazenamento do catálogo.
 * O painel admin só conhece esta interface — trocar de "banco" é só criar outra implementação.
 */
export interface CatalogRepository {
  readonly kind: 'github' | 'local';
  /** Descrição curta exibida no painel (ex.: "usuario/repo · main"). */
  readonly label: string;
  load(): Promise<LoadedCatalog>;
  /** Salva tudo de forma atômica e devolve a nova versão. */
  save(request: SaveRequest): Promise<string | null>;
  /** URL para exibir uma imagem no painel (inclusive recém-enviadas, antes do site republicar). */
  imageUrl(path: string): string;
}

export class ConflictError extends Error {
  constructor(message = 'O catálogo foi alterado em outro lugar desde que você o abriu. Recarregue para ver a versão mais recente.') {
    super(message);
    this.name = 'ConflictError';
  }
}
