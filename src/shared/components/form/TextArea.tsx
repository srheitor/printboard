import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Field, describedBy } from './Field';
import styles from './form.module.css';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  /** Mostra contador "120/500" quando maxLength é informado. */
  showCount?: boolean;
  fieldClassName?: string;
}

export function TextArea({
  label,
  hint,
  error,
  value,
  onChange,
  id,
  required,
  disabled,
  maxLength,
  showCount = true,
  rows = 4,
  fieldClassName,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const counter = maxLength && showCount ? `${value.length}/${maxLength}` : null;

  return (
    <Field
      id={inputId}
      label={label}
      hint={counter ? <>{hint ? <>{hint} · </> : null}{counter}</> : hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      <div className={styles.control} data-invalid={!!error} data-disabled={!!disabled}>
        <textarea
          id={inputId}
          className={styles.input}
          value={value}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          {...describedBy(inputId, error, hint || counter)}
          {...rest}
        />
      </div>
    </Field>
  );
}
