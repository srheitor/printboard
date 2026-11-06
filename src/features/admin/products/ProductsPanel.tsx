import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ProductPrice,
  Select,
  TextInput,
  useToast,
} from '@/shared/components';
import { IconBox, IconEdit, IconEye, IconEyeOff, IconPlus, IconSearch, IconStar, IconTrash } from '@/shared/icons';
import { PRODUCT_IMAGES_DIR, type CatalogRepository, type FileUpload } from '@/services/catalog/types';
import type { Catalogo, Produto } from '@/shared/types/catalog';
import { formatDateTime, formatQuantity } from '@/shared/utils/format';
import { compressImage } from '@/shared/utils/image';
import { uniqueId } from '@/shared/utils/slug';
import type { CatalogEditor } from '../hooks/useCatalogEditor';
import { ProductFormModal, type ProductFormValues } from './ProductFormModal';
import styles from './ProductsPanel.module.css';

interface ProductsPanelProps {
  editor: CatalogEditor;
  catalogo: Catalogo;
  repository: CatalogRepository;
}

const PUBLISH_HINT = ' O site público é atualizado em cerca de 1 a 2 minutos.';

export function ProductsPanel({ editor, catalogo, repository }: ProductsPanelProps) {
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [deleting, setDeleting] = useState<Produto | null>(null);

  const publishHint = repository.kind === 'github' ? PUBLISH_HINT : '';
  const categoriaNome = useMemo(() => new Map(catalogo.categorias.map((c) => [c.id, c.nome])), [catalogo.categorias]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return catalogo.produtos.filter(
      (p) => (!categoria || p.categoria === categoria) && (!termo || p.nome.toLowerCase().includes(termo)),
    );
  }, [catalogo.produtos, busca, categoria]);

  const stats = {
    total: catalogo.produtos.length,
    ativos: catalogo.produtos.filter((p) => p.ativo).length,
    destaques: catalogo.produtos.filter((p) => p.destaque && p.ativo).length,
  };

  /** Só remove a imagem antiga se ela for de produto e nenhum outro produto a usar. */
  function imageToDelete(path: string, exceptId: string): string[] {
    const inUse = catalogo.produtos.some((p) => p.id !== exceptId && p.imagem === path);
    return path.startsWith(`${PRODUCT_IMAGES_DIR}/`) && !inUse ? [path] : [];
  }

  async function run(action: () => Promise<void>, success: string) {
    try {
      await action();
      toast.success(success + publishHint);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async function handleSubmit(values: ProductFormValues, image: File | null) {
    const isNew = !editing;
    const id = editing?.id ?? uniqueId(values.nome, catalogo.produtos.map((p) => p.id));
    const now = new Date().toISOString();
    let imagem = editing?.imagem ?? '';
    const uploads: FileUpload[] = [];
    const deletions: string[] = [];

    const ok = await run(async () => {
      if (image) {
        const { blob, extension } = await compressImage(image);
        imagem = `${PRODUCT_IMAGES_DIR}/${id}-${Date.now().toString(36)}.${extension}`;
        uploads.push({ path: imagem, data: blob });
        if (editing) deletions.push(...imageToDelete(editing.imagem, editing.id));
      }

      const produto: Produto = {
        ...values,
        id,
        imagem,
        criadoEm: editing?.criadoEm ?? now,
        atualizadoEm: now,
      };
      const produtos = isNew ? [produto, ...catalogo.produtos] : catalogo.produtos.map((p) => (p.id === id ? produto : p));

      await editor.save(
        { ...catalogo, produtos },
        { message: `${isNew ? 'Adiciona' : 'Atualiza'} produto: ${produto.nome}`, uploads, deletions },
      );
    }, isNew ? 'Produto cadastrado!' : 'Alterações salvas!');

    if (ok) setFormOpen(false);
  }

  async function toggleAtivo(produto: Produto) {
    const produtos = catalogo.produtos.map((p) =>
      p.id === produto.id ? { ...p, ativo: !p.ativo, atualizadoEm: new Date().toISOString() } : p,
    );
    await run(
      () => editor.save({ ...catalogo, produtos }, { message: `${produto.ativo ? 'Oculta' : 'Exibe'} produto: ${produto.nome}` }),
      produto.ativo ? 'Produto ocultado do site.' : 'Produto visível no site.',
    );
  }

  async function confirmDelete() {
    if (!deleting) return;
    const alvo = deleting;
    const ok = await run(
      () =>
        editor.save(
          { ...catalogo, produtos: catalogo.produtos.filter((p) => p.id !== alvo.id) },
          { message: `Remove produto: ${alvo.nome}`, deletions: imageToDelete(alvo.imagem, alvo.id) },
        ),
      'Produto excluído.',
    );
    if (ok) setDeleting(null);
  }

  function openForm(produto: Produto | null) {
    setEditing(produto);
    setFormOpen(true);
  }

  return (
    <section>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Produtos</h1>
          <p className={styles.stats}>
            {stats.total} cadastrados · {stats.ativos} visíveis · {stats.destaques} em destaque
          </p>
        </div>
        <Button icon={<IconPlus size={18} />} onClick={() => openForm(null)}>
          Novo produto
        </Button>
      </div>

      <div className={styles.toolbar}>
        <TextInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome..."
          prefix={<IconSearch size={18} />}
          aria-label="Buscar produto"
          fieldClassName={styles.search}
        />
        <Select
          value={categoria}
          onChange={setCategoria}
          options={[{ value: '', label: 'Todas as categorias' }, ...catalogo.categorias.map((c) => ({ value: c.id, label: c.nome }))]}
          aria-label="Filtrar por categoria"
          fieldClassName={styles.filter}
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<IconBox />}
          title={catalogo.produtos.length ? 'Nenhum produto com esses filtros' : 'Nenhum produto cadastrado'}
          action={
            !catalogo.produtos.length && (
              <Button icon={<IconPlus size={18} />} onClick={() => openForm(null)}>
                Cadastrar o primeiro
              </Button>
            )
          }
        />
      ) : (
        <ul className={styles.list}>
          {filtrados.map((p) => (
            <li key={p.id} className={styles.item} data-inactive={!p.ativo}>
              <img src={repository.imageUrl(p.imagem)} alt="" className={styles.thumb} loading="lazy" />
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <strong className={styles.name}>{p.nome}</strong>
                  {p.destaque && <Badge tone="accent" icon={<IconStar size={12} />}>Destaque</Badge>}
                  {!p.ativo && <Badge tone="muted">Oculto</Badge>}
                </div>
                <div className={styles.meta}>
                  <span>{categoriaNome.get(p.categoria) ?? 'Sem categoria'}</span>
                  <ProductPrice produto={p} size="sm" />
                  {p.pedidoMinimo && <span>Mín. {formatQuantity(p.pedidoMinimo, p.unidade)}</span>}
                </div>
                <span className={styles.updated}>Atualizado em {formatDateTime(p.atualizadoEm)}</span>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={p.ativo ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  onClick={() => toggleAtivo(p)}
                  disabled={editor.saving}
                  title={p.ativo ? 'Ocultar do site' : 'Exibir no site'}
                >
                  {p.ativo ? 'Ocultar' : 'Exibir'}
                </Button>
                <Button variant="secondary" size="sm" icon={<IconEdit size={16} />} onClick={() => openForm(p)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" icon={<IconTrash size={16} />} onClick={() => setDeleting(p)} aria-label={`Excluir ${p.nome}`} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProductFormModal
        open={formOpen}
        produto={editing}
        categorias={catalogo.categorias}
        imageUrl={(path) => repository.imageUrl(path)}
        saving={editor.saving}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir produto?"
        description={
          <>
            <strong>{deleting?.nome}</strong> será removido do catálogo permanentemente. Se quiser apenas tirar do ar
            por um tempo, use “Ocultar”.
          </>
        }
        confirmLabel="Excluir"
        loading={editor.saving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
