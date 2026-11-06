import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, TextInput, WhatsAppButton } from '@/shared/components';
import { usePublicCatalog } from '@/shared/hooks/usePublicCatalog';
import { IconSearch } from '@/shared/icons';
import { CategoryChips } from '../components/CategoryChips';
import { ProductGrid } from '../components/ProductGrid';
import { SectionHeading } from '../components/SectionHeading';
import styles from './ProductsPage.module.css';

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function ProductsPage() {
  const { produtos, categorias, loading, error, categoriaNome } = usePublicCatalog();
  // Filtros na URL: dá para compartilhar o link já filtrado (ex.: /produtos?categoria=sacolas)
  const [params, setParams] = useSearchParams();
  const busca = params.get('q') ?? '';
  const categoria = params.get('categoria');

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const filtrados = useMemo(() => {
    const termo = normalize(busca.trim());
    return produtos.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!termo || normalize(`${p.nome} ${p.descricao}`).includes(termo)),
    );
  }, [produtos, busca, categoria]);

  return (
    <div className={`container ${styles.page}`}>
      <SectionHeading
        as="h1"
        eyebrow="Catálogo"
        title="Nossos produtos"
        description="Escolha um produto para ver os detalhes e pedir seu orçamento direto pelo WhatsApp."
      />

      <div className={styles.toolbar}>
        <TextInput
          value={busca}
          onChange={(v) => updateParam('q', v)}
          placeholder="Buscar produto..."
          prefix={<IconSearch size={18} />}
          aria-label="Buscar produto"
          type="search"
          fieldClassName={styles.search}
        />
        {categorias.length > 1 && (
          <CategoryChips categorias={categorias} value={categoria} onChange={(id) => updateParam('categoria', id)} />
        )}
      </div>

      <ProductGrid
        produtos={filtrados}
        loading={loading}
        error={error}
        categoriaNome={categoriaNome}
        skeletons={6}
        emptyTitle={busca || categoria ? 'Nenhum produto encontrado com esses filtros' : 'Nenhum produto cadastrado ainda'}
        emptyAction={
          busca || categoria ? (
            <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
              Limpar filtros
            </Button>
          ) : undefined
        }
      />

      <div className={styles.cta}>
        <div>
          <h2>Não encontrou o que procura?</h2>
          <p>Fabricamos embalagens sob medida. Conte pra gente o que você precisa.</p>
        </div>
        <WhatsAppButton size="lg">Falar com a gente</WhatsAppButton>
      </div>
    </div>
  );
}
