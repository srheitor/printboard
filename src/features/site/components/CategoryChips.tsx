import type { Categoria } from '@/shared/types/catalog';
import { cx } from '@/shared/utils/cx';
import styles from './CategoryChips.module.css';

interface CategoryChipsProps {
  categorias: Categoria[];
  /** null = "Todos" */
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryChips({ categorias, value, onChange }: CategoryChipsProps) {
  const items = [{ id: null, nome: 'Todos' }, ...categorias];
  return (
    <div className={styles.chips} role="group" aria-label="Filtrar por categoria">
      {items.map((c) => (
        <button
          key={c.id ?? 'todos'}
          type="button"
          className={cx(styles.chip, value === c.id && styles.active)}
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.nome}
        </button>
      ))}
    </div>
  );
}
