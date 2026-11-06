import { useState, type FormEvent } from 'react';
import { Badge, Button, ConfirmDialog, TextInput, useToast } from '@/shared/components';
import { IconPlus, IconTrash } from '@/shared/icons';
import type { Catalogo, Categoria } from '@/shared/types/catalog';
import { uniqueId } from '@/shared/utils/slug';
import type { CatalogEditor } from '../hooks/useCatalogEditor';
import styles from './CategoriesPanel.module.css';

export function CategoriesPanel({ editor, catalogo }: { editor: CatalogEditor; catalogo: Catalogo }) {
  const toast = useToast();
  const [nova, setNova] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [removendo, setRemovendo] = useState<Categoria | null>(null);

  const uso = (id: string) => catalogo.produtos.filter((p) => p.categoria === id).length;
  const existe = (nome: string, exceto?: string) =>
    catalogo.categorias.some((c) => c.id !== exceto && c.nome.trim().toLowerCase() === nome.trim().toLowerCase());

  async function persist(categorias: Categoria[], message: string, success: string) {
    try {
      await editor.save({ ...catalogo, categorias }, { message });
      toast.success(success);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    const nome = nova.trim();
    if (!nome) return setErro('Digite o nome da categoria.');
    if (existe(nome)) return setErro('Já existe uma categoria com esse nome.');
    const id = uniqueId(nome, catalogo.categorias.map((c) => c.id));
    if (await persist([...catalogo.categorias, { id, nome }], `Adiciona categoria: ${nome}`, 'Categoria criada!')) {
      setNova('');
    }
  }

  async function renomear(categoria: Categoria) {
    const nome = (nomes[categoria.id] ?? categoria.nome).trim();
    if (!nome || nome === categoria.nome) return;
    if (existe(nome, categoria.id)) return toast.error('Já existe uma categoria com esse nome.');
    // O id não muda, assim os produtos continuam vinculados.
    const categorias = catalogo.categorias.map((c) => (c.id === categoria.id ? { ...c, nome } : c));
    if (await persist(categorias, `Renomeia categoria: ${categoria.nome} → ${nome}`, 'Categoria renomeada!')) {
      setNomes(({ [categoria.id]: _, ...rest }) => rest);
    }
  }

  async function remover() {
    if (!removendo) return;
    const ok = await persist(
      catalogo.categorias.filter((c) => c.id !== removendo.id),
      `Remove categoria: ${removendo.nome}`,
      'Categoria removida.',
    );
    if (ok) setRemovendo(null);
  }

  return (
    <section className={styles.panel}>
      <div>
        <h1 className={styles.title}>Categorias</h1>
        <p className={styles.subtitle}>Usadas para organizar o catálogo e os filtros da página de produtos.</p>
      </div>

      <form onSubmit={adicionar} className={styles.add}>
        <TextInput
          value={nova}
          onChange={(v) => {
            setNova(v);
            setErro(null);
          }}
          placeholder="Nova categoria (ex.: Caixas para bolo)"
          aria-label="Nome da nova categoria"
          error={erro}
          maxLength={40}
          fieldClassName={styles.addField}
        />
        <Button type="submit" icon={<IconPlus size={18} />} loading={editor.saving}>
          Adicionar
        </Button>
      </form>

      <ul className={styles.list}>
        {catalogo.categorias.map((c) => {
          const total = uso(c.id);
          const valor = nomes[c.id] ?? c.nome;
          const alterado = valor.trim() !== c.nome && valor.trim() !== '';
          return (
            <li key={c.id} className={styles.item}>
              <TextInput
                value={valor}
                onChange={(v) => setNomes((n) => ({ ...n, [c.id]: v }))}
                onKeyDown={(e) => e.key === 'Enter' && renomear(c)}
                aria-label={`Nome da categoria ${c.nome}`}
                maxLength={40}
                fieldClassName={styles.itemField}
              />
              <Badge>{total} {total === 1 ? 'produto' : 'produtos'}</Badge>
              {alterado && (
                <Button size="sm" onClick={() => renomear(c)} loading={editor.saving}>
                  Salvar
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                icon={<IconTrash size={16} />}
                onClick={() => setRemovendo(c)}
                disabled={total > 0}
                title={total > 0 ? 'Mova ou exclua os produtos desta categoria antes' : 'Excluir categoria'}
                aria-label={`Excluir categoria ${c.nome}`}
              />
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={!!removendo}
        title="Excluir categoria?"
        description={<>A categoria <strong>{removendo?.nome}</strong> será removida.</>}
        confirmLabel="Excluir"
        loading={editor.saving}
        onConfirm={remover}
        onCancel={() => setRemovendo(null)}
      />
    </section>
  );
}
