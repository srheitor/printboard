import { useCallback, useEffect, useState } from 'react';
import { ConflictError, type CatalogRepository, type FileUpload } from '@/services/catalog/types';
import type { Catalogo } from '@/shared/types/catalog';

interface SaveOptions {
  message: string;
  uploads?: FileUpload[];
  deletions?: string[];
}

/**
 * Estado do catálogo no painel: carrega, aplica alterações e salva no repositório.
 * Componentes de tela só chamam `save(catalogoNovo, { message })`.
 */
export function useCatalogEditor(repository: CatalogRepository) {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setConflict(false);
    try {
      const loaded = await repository.load();
      setCatalogo(loaded.catalogo);
      setVersion(loaded.version);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (next: Catalogo, { message, uploads = [], deletions = [] }: SaveOptions) => {
      setSaving(true);
      try {
        const stamped = { ...next, atualizadoEm: new Date().toISOString() };
        const newVersion = await repository.save({ catalogo: stamped, baseVersion: version, uploads, deletions, message });
        setCatalogo(stamped);
        setVersion(newVersion);
      } catch (err) {
        if (err instanceof ConflictError) setConflict(true);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [repository, version],
  );

  return { catalogo, loading, loadError, saving, conflict, reload, save };
}

export type CatalogEditor = ReturnType<typeof useCatalogEditor>;
