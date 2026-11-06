import type { Produto } from '@/shared/types/catalog';
import { formatCurrency, formatUnidade } from '@/shared/utils/format';
import styles from './ProductPrice.module.css';

/** Exibe "A partir de R$ 45,00 / cento" ou "Preço sob consulta". */
export function ProductPrice({ produto, size = 'md' }: { produto: Pick<Produto, 'preco' | 'unidade'>; size?: 'sm' | 'md' | 'lg' }) {
  if (produto.preco === null) {
    return <span className={`${styles.price} ${styles[size]} ${styles.consult}`}>Preço sob consulta</span>;
  }
  return (
    <span className={`${styles.price} ${styles[size]}`}>
      <span className={styles.from}>a partir de</span>
      <strong className={styles.value}>{formatCurrency(produto.preco)}</strong>
      <span className={styles.unit}>/ {formatUnidade(produto.unidade)}</span>
    </span>
  );
}
