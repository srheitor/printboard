import { useId, type ReactNode } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

/** Interruptor liga/desliga (checkbox estilizado). */
export function Toggle({ label, description, checked, onChange, disabled, id }: ToggleProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className={styles.toggle} data-disabled={!!disabled}>
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  );
}
