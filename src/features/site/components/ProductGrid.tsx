import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/components';
import { IconBox } from '@/shared/icons';
import type { Produto } from '@/shared/types/catalog';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  produtos: Produto[];
  loading?: boolean;
  error?: string | null;
  categoriaNome?: (id: string) => string;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  skeletons?: number;
}

export function ProductGrid({
  produtos,
  loading,
  error,
  categoriaNome,
  emptyTitle = 'Nenhum produto encontrado',
  emptyAction,
  skeletons = 3,
}: ProductGridProps) {
  if (error) {
    return <EmptyState icon={<IconBox />} title="Não foi possível carregar os produtos" description={error} />;
  }

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: skeletons }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (produtos.length === 0) {
    return <EmptyState icon={<IconBox />} title={emptyTitle} action={emptyAction} />;
  }

  return (
    <div className={styles.grid}>
      {produtos.map((p) => (
        <ProductCard key={p.id} produto={p} categoria={categoriaNome?.(p.categoria)} />
      ))}
    </div>
  );
}
