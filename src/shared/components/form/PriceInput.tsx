import { useId, type ReactNode } from 'react';
import { Field, describedBy } from './Field';
import styles from './form.module.css';

const numberFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface PriceInputProps {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  /** Valor em reais (ex.: 12.5). null = campo vazio. */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Texto à direita, ex.: "/ cento" */
  suffix?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  max?: number;
  fieldClassName?: string;
}

/**
 * Campo de valor em reais com máscara "estilo caixa registradora":
 * o usuário só digita números e os centavos são preenchidos da direita para a esquerda.
 * Ex.: digitar 1 2 5 0 → "12,50". Apagar tudo → null.
 */
export function PriceInput({
  label,
  hint,
  error,
  value,
  onChange,
  suffix,
  placeholder = '0,00',
  required,
  disabled,
  id,
  max = 9_999_999.99,
  fieldClassName,
}: PriceInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const display = value === null ? '' : numberFormat.format(value);

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '').replace(/^0+/, '');
    if (!digits) return onChange(null);
    const next = Number(digits) / 100;
    onChange(Math.min(next, max));
  }

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={styles.control} data-invalid={!!error} data-disabled={!!disabled}>
        <span className={styles.addon}>R$</span>
        <input
          id={inputId}
          className={styles.input}
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={display}
          onChange={(e) => handleChange(e.target.value)}
          required={required}
          disabled={disabled}
          {...describedBy(inputId, error, hint)}
        />
        {suffix && <span className={styles.addon}>{suffix}</span>}
      </div>
    </Field>
  );
}
