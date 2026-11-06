import { site } from '@/config/site';
import type { Produto } from '@/shared/types/catalog';
import { formatQuantity } from './format';

/** Monta um link wa.me com mensagem pré-preenchida. */
export function whatsappLink(message: string = site.contato.mensagemPadrao): string {
  return `https://wa.me/${site.contato.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Mensagem de orçamento de um produto específico. */
export function productQuoteMessage(produto: Produto, quantidade?: number | null): string {
  const linhas = [`Olá! Vim pelo site e tenho interesse no produto *${produto.nome}*.`];
  if (quantidade) linhas.push(`Quantidade: ${formatQuantity(quantidade, produto.unidade)}.`);
  linhas.push('Pode me enviar um orçamento?');
  return linhas.join('\n');
}

/** Formata o número para exibição: +55 (31) 97569-5220 */
export function formatPhone(digits: string = site.contato.whatsapp): string {
  const m = digits.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : digits;
}
