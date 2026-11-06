import styles from './Spinner.module.css';

export function Spinner({ size = 24, label = 'Carregando' }: { size?: number; label?: string }) {
  return (
    <span className={styles.spinner} style={{ width: size, height: size }} role="status" aria-label={label} />
  );
}
