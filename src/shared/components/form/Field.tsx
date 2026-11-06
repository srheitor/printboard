import type { ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';
import styles from './form.module.css';

export interface FieldProps {
  id: string;
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Moldura padrão de qualquer campo: rótulo, dica e mensagem de erro.
 * Todos os inputs do projeto usam este componente — assim layout e acessibilidade ficam iguais.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Props de acessibilidade que ligam o input à dica/erro do Field. */
export function describedBy(id: string, error?: string | null, hint?: ReactNode) {
  if (error) return { 'aria-invalid': true, 'aria-describedby': `${id}-error` } as const;
  if (hint) return { 'aria-describedby': `${id}-hint` } as const;
  return {};
}
