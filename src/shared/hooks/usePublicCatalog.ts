import { useEffect, useMemo, useState } from 'react';
import { fetchPublicCatalog } from '@/services/catalog/publicCatalog';
import type { Catalogo, Categoria, Produto } from '@/shared/types/catalog';

interface PublicCatalogState {
  loading: boolean;
  error: string | null;
  /** Somente produtos ativos. */
  produtos: Produto[];
  /** Somente categorias que possuem ao menos um produto ativo. */
  categorias: Categoria[];
  categoriaNome: (id: string) => string;
}

export function usePublicCatalog(): PublicCatalogState {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPublicCatalog()
      .then((c) => alive && setCatalogo(c))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => {
    const produtos = (catalogo?.produtos ?? []).filter((p) => p.ativo);
    const usadas = new Set(produtos.map((p) => p.categoria));
    const categorias = (catalogo?.categorias ?? []).filter((c) => usadas.has(c.id));
    const nomes = new Map(catalogo?.categorias.map((c) => [c.id, c.nome]));
    return {
      loading: !catalogo && !error,
      error,
      produtos,
      categorias,
      categoriaNome: (id: string) => nomes.get(id) ?? 'Outros',
    };
  }, [catalogo, error]);
}
