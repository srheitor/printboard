import { site } from '@/config/site';
import { publicUrl } from '@/shared/utils/assets';
import styles from './Logo.module.css';

/**
 * Marca do site. Enquanto `site.logo` for null, exibe uma marca provisória em texto.
 * Quando a logo oficial existir, basta salvá-la em public/img/site/ e apontar `site.logo` para ela.
 */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  if (site.logo) {
    return <img src={publicUrl(site.logo)} alt={site.nome} className={styles.image} data-inverted={inverted} />;
  }

  return (
    <span className={styles.logo} data-inverted={inverted}>
      <svg viewBox="0 0 40 40" className={styles.mark} aria-hidden>
        <rect x="2" y="2" width="17" height="17" rx="4" fill="#00a6d6" />
        <rect x="21" y="2" width="17" height="17" rx="4" fill="var(--color-brand)" />
        <rect x="2" y="21" width="17" height="17" rx="4" fill="var(--color-accent)" />
        <rect x="21" y="21" width="17" height="17" rx="4" fill="currentColor" />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>
          Print<span className={styles.highlight}>Board</span>
        </span>
        <span className={styles.company}>{site.segmento}</span>
      </span>
    </span>
  );
}
