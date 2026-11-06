import { useEffect, useId, useState, type ReactNode } from 'react';
import { IconMinus, IconPlus } from '@/shared/icons';
import { cx } from '@/shared/utils/cx';
import { Field, describedBy } from './Field';
import styles from './form.module.css';
import qty from './QuantityInput.module.css';

export interface QuantityInputProps {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  /** null = vazio (útil para campos opcionais como "pedido mínimo"). */
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Texto à direita do número, ex.: "centos" */
  suffix?: ReactNode;
  /** Se false, o campo nunca fica vazio (volta para `min` ao perder o foco). */
  allowEmpty?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  size?: 'md' | 'lg';
  fieldClassName?: string;
}

/** Campo numérico inteiro com botões − / +. */
export function QuantityInput({
  label,
  hint,
  error,
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 1,
  suffix,
  allowEmpty = false,
  placeholder,
  required,
  disabled,
  id,
  size = 'md',
  fieldClassName,
}: QuantityInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  // Texto local permite apagar e redigitar sem o valor "pular" para o mínimo.
  const [text, setText] = useState(value === null ? '' : String(value));

  useEffect(() => {
    setText(value === null ? '' : String(value));
  }, [value]);

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  function commit(raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      if (allowEmpty) return onChange(null);
      setText(String(min));
      return onChange(min);
    }
    const next = clamp(Number(digits));
    setText(String(next));
    onChange(next);
  }

  function bump(direction: 1 | -1) {
    const base = value ?? min;
    onChange(clamp(base + direction * step));
  }

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div
        className={cx(styles.control, qty.control, size === 'lg' && qty.lg)}
        data-invalid={!!error}
        data-disabled={!!disabled}
      >
        <button
          type="button"
          className={qty.step}
          onClick={() => bump(-1)}
          disabled={disabled || (value !== null && value <= min)}
          aria-label="Diminuir quantidade"
        >
          <IconMinus size={18} />
        </button>
        <input
          id={inputId}
          className={cx(styles.input, qty.input)}
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            setText(digits);
            // Durante a digitação só propaga valores válidos; o ajuste ao mínimo/máximo acontece no blur.
            const n = Number(digits);
            if (digits && n >= min && n <= max) onChange(n);
            else if (!digits && allowEmpty) onChange(null);
          }}
          onBlur={(e) => commit(e.target.value)}
          required={required}
          disabled={disabled}
          {...describedBy(inputId, error, hint)}
        />
        {suffix && <span className={cx(styles.addon, qty.suffix)}>{suffix}</span>}
        <button
          type="button"
          className={qty.step}
          onClick={() => bump(1)}
          disabled={disabled || (value !== null && value >= max)}
          aria-label="Aumentar quantidade"
        >
          <IconPlus size={18} />
        </button>
      </div>
    </Field>
  );
}
