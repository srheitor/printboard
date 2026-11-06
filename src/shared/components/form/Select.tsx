import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Field, describedBy } from './Field';
import styles from './form.module.css';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  value: T | '';
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  /** Texto da opção vazia (ex.: "Selecione..."). Omitir para não exibir. */
  placeholder?: string;
  fieldClassName?: string;
}

export function Select<T extends string = string>({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder,
  id,
  required,
  disabled,
  fieldClassName,
  ...rest
}: SelectProps<T>) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={styles.control} data-invalid={!!error} data-disabled={!!disabled}>
        <select
          id={inputId}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          required={required}
          disabled={disabled}
          {...describedBy(inputId, error, hint)}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}
