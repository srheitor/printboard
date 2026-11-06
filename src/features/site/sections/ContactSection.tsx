import { useState, type FormEvent } from 'react';
import { site } from '@/config/site';
import { Button, QuantityInput, Select, TextArea, TextInput } from '@/shared/components';
import { IconInstagram, IconMail, IconWhatsApp } from '@/shared/icons';
import type { Produto } from '@/shared/types/catalog';
import { formatQuantity, formatUnidade } from '@/shared/utils/format';
import { formatPhone, whatsappLink } from '@/shared/utils/whatsapp';
import { SectionHeading } from '../components/SectionHeading';
import styles from './ContactSection.module.css';

const OUTRO = '__outro';

/** Formulário de contato que monta a mensagem e abre o WhatsApp (sem backend, sem e-mail). */
export function ContactSection({ produtos }: { produtos: Produto[] }) {
  const [nome, setNome] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erroNome, setErroNome] = useState<string | null>(null);

  const produto = produtos.find((p) => p.id === produtoId);
  const opcoes = [...produtos.map((p) => ({ value: p.id, label: p.nome })), { value: OUTRO, label: 'Outro / não sei ainda' }];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErroNome('Informe seu nome.');

    const linhas = [`Olá! Meu nome é ${nome.trim()}.`];
    if (produto) linhas.push(`Tenho interesse em: *${produto.nome}*.`);
    if (produto && quantidade) linhas.push(`Quantidade: ${formatQuantity(quantidade, produto.unidade)}.`);
    if (mensagem.trim()) linhas.push('', mensagem.trim());
    if (!produto && !mensagem.trim()) linhas.push('Gostaria de um orçamento de embalagens.');

    window.open(whatsappLink(linhas.join('\n')), '_blank', 'noopener');
  }

  return (
    <section id="contato" className={`container ${styles.section}`}>
      <div className={styles.wrapper}>
        <div className={styles.info}>
          <SectionHeading
            eyebrow="Contato"
            title="Vamos conversar sobre suas embalagens?"
            description="Preencha os dados ao lado e a mensagem chega pronta no nosso WhatsApp. Respondemos rapidinho!"
          />
          <ul className={styles.channels}>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <span className={styles.channelIcon} data-tone="whatsapp"><IconWhatsApp /></span>
                <span>
                  <strong>WhatsApp</strong>
                  {formatPhone()}
                </span>
              </a>
            </li>
            {site.contato.instagram && (
              <li>
                <a href={site.contato.instagram} target="_blank" rel="noopener noreferrer">
                  <span className={styles.channelIcon} data-tone="instagram"><IconInstagram /></span>
                  <span>
                    <strong>Instagram</strong>
                    @{site.contato.instagram.split('/').filter(Boolean).pop()}
                  </span>
                </a>
              </li>
            )}
            {site.contato.email && (
              <li>
                <a href={`mailto:${site.contato.email}`}>
                  <span className={styles.channelIcon}><IconMail /></span>
                  <span>
                    <strong>E-mail</strong>
                    {site.contato.email}
                  </span>
                </a>
              </li>
            )}
          </ul>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Seu nome"
            required
            value={nome}
            onChange={(v) => {
              setNome(v);
              setErroNome(null);
            }}
            error={erroNome}
            placeholder="Como podemos te chamar?"
            autoComplete="name"
          />
          <div className={styles.row}>
            <Select
              label="Produto de interesse"
              value={produtoId}
              onChange={(v) => {
                setProdutoId(v);
                const p = produtos.find((x) => x.id === v);
                setQuantidade(p?.pedidoMinimo ?? null);
              }}
              options={opcoes}
              placeholder="Selecione (opcional)"
            />
            <QuantityInput
              label="Quantidade"
              value={quantidade}
              onChange={setQuantidade}
              min={produto?.pedidoMinimo ?? 1}
              allowEmpty
              disabled={!produto}
              suffix={produto ? formatUnidade(produto.unidade, quantidade ?? 2) : undefined}
              hint={produto?.pedidoMinimo ? `Mínimo: ${formatQuantity(produto.pedidoMinimo, produto.unidade)}` : undefined}
            />
          </div>
          <TextArea
            label="Mensagem"
            value={mensagem}
            onChange={setMensagem}
            maxLength={600}
            placeholder="Ex.: preciso de 500 caixas maleta com a arte da minha hamburgueria."
          />
          <Button type="submit" variant="whatsapp" size="lg" icon={<IconWhatsApp />} block>
            Enviar pelo WhatsApp
          </Button>
        </form>
      </div>
    </section>
  );
}
