import { useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  ImageInput,
  Modal,
  PriceInput,
  QuantityInput,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from '@/shared/components';
import { UNIDADES, type Categoria, type Produto } from '@/shared/types/catalog';
import { formatUnidade } from '@/shared/utils/format';
import styles from './ProductFormModal.module.css';

export type ProductFormValues = Omit<Produto, 'id' | 'imagem' | 'criadoEm' | 'atualizadoEm'>;

type Errors = Partial<Record<keyof ProductFormValues | 'imagem', string>>;

const EMPTY: ProductFormValues = {
  nome: '',
  descricao: '',
  categoria: '',
  preco: null,
  unidade: 'cento',
  pedidoMinimo: null,
  destaque: false,
  ativo: true,
};

interface ProductFormModalProps {
  open: boolean;
  /** Produto em edição; null = novo produto. */
  produto: Produto | null;
  categorias: Categoria[];
  imageUrl: (path: string) => string;
  saving: boolean;
  onSubmit: (values: ProductFormValues, image: File | null) => Promise<void>;
  onClose: () => void;
}

export function ProductFormModal({ open, produto, categorias, imageUrl, saving, onSubmit, onClose }: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setValues(produto ? { ...EMPTY, ...produto } : { ...EMPTY, categoria: categorias[0]?.id ?? '' });
    setImage(null);
    setErrors({});
  }, [open, produto, categorias]);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!values.nome.trim()) e.nome = 'Informe o nome do produto.';
    if (!values.categoria) e.categoria = 'Escolha uma categoria.';
    if (!values.descricao.trim()) e.descricao = 'Escreva uma descrição.';
    if (!produto && !image) e.imagem = 'Adicione uma foto do produto.';
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    await onSubmit({ ...values, nome: values.nome.trim(), descricao: values.descricao.trim() }, image);
  }

  const unidadeLabel = formatUnidade(values.unidade);

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={produto ? 'Editar produto' : 'Novo produto'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            {produto ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </>
      }
    >
      <form id="product-form" className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.columns}>
          <div className={styles.column}>
            <ImageInput
              label="Foto do produto"
              required={!produto}
              file={image}
              onChange={(f) => {
                setImage(f);
                setErrors((e) => ({ ...e, imagem: undefined }));
              }}
              currentUrl={produto ? imageUrl(produto.imagem) : null}
              error={errors.imagem}
            />
            <Toggle
              label="Visível no site"
              description="Desative para esconder sem excluir."
              checked={values.ativo}
              onChange={(v) => set('ativo', v)}
            />
            <Toggle
              label="Destaque na página inicial"
              checked={values.destaque}
              onChange={(v) => set('destaque', v)}
            />
          </div>

          <div className={styles.column}>
            <TextInput
              label="Nome"
              required
              value={values.nome}
              onChange={(v) => set('nome', v)}
              error={errors.nome}
              placeholder="Ex.: Caixa para pizza 35 cm"
              maxLength={80}
            />
            <Select
              label="Categoria"
              required
              value={values.categoria}
              onChange={(v) => set('categoria', v)}
              options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
              placeholder="Selecione..."
              error={errors.categoria}
              hint={categorias.length === 0 ? 'Crie uma categoria na aba "Categorias".' : undefined}
            />
            <TextArea
              label="Descrição"
              required
              value={values.descricao}
              onChange={(v) => set('descricao', v)}
              error={errors.descricao}
              maxLength={600}
              rows={5}
              placeholder="Material, medidas, opções de personalização..."
            />
            <div className={styles.row}>
              <Select
                label="Vendido por"
                value={values.unidade}
                onChange={(v) => set('unidade', v)}
                options={UNIDADES}
              />
              <PriceInput
                label="Preço a partir de"
                value={values.preco}
                onChange={(v) => set('preco', v)}
                suffix={`/ ${unidadeLabel}`}
                hint="Deixe vazio para “sob consulta”."
              />
            </div>
            <QuantityInput
              label="Pedido mínimo"
              value={values.pedidoMinimo}
              onChange={(v) => set('pedidoMinimo', v)}
              min={1}
              allowEmpty
              placeholder="Sem mínimo"
              suffix={formatUnidade(values.unidade, values.pedidoMinimo ?? 2)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
