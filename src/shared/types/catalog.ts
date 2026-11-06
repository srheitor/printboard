export type Unidade = 'unidade' | 'cento' | 'milheiro' | 'pacote';

export const UNIDADES: { value: Unidade; label: string }[] = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'cento', label: 'Cento' },
  { value: 'milheiro', label: 'Milheiro' },
  { value: 'pacote', label: 'Pacote' },
];

export interface Categoria {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  /** Caminho relativo à pasta public, ex.: "img/produtos/caixa.webp" */
  imagem: string;
  /** Preço "a partir de" por unidade de venda. null = sob consulta. */
  preco: number | null;
  unidade: Unidade;
  /** Quantidade mínima de pedido, na unidade de venda. */
  pedidoMinimo: number | null;
  destaque: boolean;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Catalogo {
  atualizadoEm: string;
  categorias: Categoria[];
  produtos: Produto[];
}
