/**
 * Configuração central do site.
 * Tudo que é "texto fixo" da empresa fica aqui.
 *
 * ⚠️ Campos marcados com TODO ainda precisam dos dados reais da PrintBoard.
 */
export const site = {
  nome: 'PrintBoard',
  segmento: 'Gráfica & embalagens personalizadas',
  /** Caminho de uma imagem em public/ (ex.: 'img/site/logo.svg'). null = usa a marca provisória em texto. */
  logo: null as string | null,
  descricao:
    'Caixas maleta, caixas para pizza e embalagens para delivery impressas com a identidade do seu negócio.',
  /** TODO: anos de mercado. null = não exibe. */
  anosDeMercado: null as number | null,
  /** TODO: cidade/estado. null = não exibe. */
  cidade: null as string | null,

  contato: {
    /** TODO: número real. Somente dígitos, com DDI + DDD (ex.: 5531999999999). */
    whatsapp: '5500000000000',
    mensagemPadrao: 'Olá! Vim pelo site da PrintBoard e gostaria de um orçamento.',
    /** TODO: URL do Instagram. null = não exibe. */
    instagram: null as string | null,
    /** TODO: e-mail. null = não exibe. */
    email: null as string | null,
  },

  /**
   * Repositório onde o catálogo (public/data/catalogo.json) e as imagens ficam salvos.
   * O painel admin grava nele usando a API do GitHub.
   */
  github: {
    owner: 'SEU-USUARIO-GITHUB',
    repo: 'printboard',
    branch: 'main',
  },
};

export type SiteConfig = typeof site;
