import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Field, describedBy } from './Field';
import styles from './form.module.css';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'prefix'> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  /** Conteúdo exibido à esquerda do texto (ícone, "R$", etc.) */
  prefix?: ReactNode;
  /** Conteúdo exibido à direita do texto (unidade, botão, etc.) */
  suffix?: ReactNode;
  fieldClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hint, error, value, onChange, prefix, suffix, id, required, disabled, fieldClassName, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={styles.control} data-invalid={!!error} data-disabled={!!disabled}>
        {prefix && <span className={styles.addon}>{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          {...describedBy(inputId, error, hint)}
          {...rest}
        />
        {suffix && <span className={styles.addon}>{suffix}</span>}
      </div>
    </Field>
  );
});
