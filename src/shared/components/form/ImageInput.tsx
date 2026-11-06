import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { IconImage } from '@/shared/icons';
import { Button } from '../Button/Button';
import { Field } from './Field';
import styles from './ImageInput.module.css';

export interface ImageInputProps {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  /** URL da imagem atual (já salva). */
  currentUrl?: string | null;
  /** Arquivo novo escolhido (ainda não salvo). */
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  id?: string;
  /** Tamanho máximo aceito antes da compressão, em MB. */
  maxSizeMb?: number;
}

/** Seleção de imagem com arrastar-e-soltar e pré-visualização. */
export function ImageInput({
  label,
  hint = 'JPG, PNG ou WEBP. A imagem é otimizada automaticamente.',
  error,
  currentUrl,
  file,
  onChange,
  required,
  id,
  maxSizeMb = 15,
}: ImageInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!candidate.type.startsWith('image/')) return setLocalError('Escolha um arquivo de imagem.');
    if (candidate.size > maxSizeMb * 1024 * 1024) return setLocalError(`A imagem deve ter até ${maxSizeMb} MB.`);
    setLocalError(null);
    onChange(candidate);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  }

  const shown = preview ?? currentUrl ?? null;

  return (
    <Field id={inputId} label={label} hint={hint} error={localError ?? error} required={required}>
      <div
        className={styles.dropzone}
        data-dragging={dragging}
        data-invalid={!!(localError ?? error)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {shown ? (
          <img src={shown} alt="Pré-visualização" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <IconImage size={32} />
            <span>Arraste uma imagem aqui</span>
          </div>
        )}
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            {shown ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          {file && (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Desfazer
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    </Field>
  );
}
