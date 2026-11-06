import { Link } from 'react-router-dom';
import { Badge, ProductPrice } from '@/shared/components';
import { IconArrowRight } from '@/shared/icons';
import type { Produto } from '@/shared/types/catalog';
import { publicUrl } from '@/shared/utils/assets';
import styles from './ProductCard.module.css';

export function ProductCard({ produto, categoria }: { produto: Produto; categoria?: string }) {
  return (
    <article className={styles.card}>
      <Link to={`/produtos/${produto.id}`} className={styles.link}>
        <div className={styles.media}>
          <img src={publicUrl(produto.imagem)} alt={produto.nome} loading="lazy" className={styles.img} />
          {categoria && (
            <span className={styles.badge}>
              <Badge>{categoria}</Badge>
            </span>
          )}
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{produto.nome}</h3>
          <p className={styles.description}>{produto.descricao}</p>
          <div className={styles.footer}>
            <ProductPrice produto={produto} size="sm" />
            <span className={styles.more}>
              Ver detalhes <IconArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={`${styles.media} ${styles.skeleton}`} />
      <div className={styles.body}>
        <div className={styles.skeletonLine} style={{ width: '70%' }} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} style={{ width: '50%' }} />
      </div>
    </div>
  );
}
