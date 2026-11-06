import type { Unidade } from '@/shared/types/catalog';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const integer = new Intl.NumberFormat('pt-BR');

export function formatCurrency(value: number): string {
  return brl.format(value);
}

export function formatNumber(value: number): string {
  return integer.format(value);
}

const UNIDADE_PLURAL: Record<Unidade, [string, string]> = {
  unidade: ['unidade', 'unidades'],
  cento: ['cento', 'centos'],
  milheiro: ['milheiro', 'milheiros'],
  pacote: ['pacote', 'pacotes'],
};

export function formatUnidade(unidade: Unidade, quantidade = 1): string {
  const [singular, plural] = UNIDADE_PLURAL[unidade];
  return quantidade === 1 ? singular : plural;
}

export function formatQuantity(quantidade: number, unidade: Unidade): string {
  return `${formatNumber(quantidade)} ${formatUnidade(unidade, quantidade)}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
