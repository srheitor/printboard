import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { site } from '@/config/site';
import { Badge, Button, EmptyState, ProductPrice, QuantityInput, Spinner, WhatsAppButton } from '@/shared/components';
import { usePublicCatalog } from '@/shared/hooks/usePublicCatalog';
import { IconArrowLeft, IconBox } from '@/shared/icons';
import { publicUrl } from '@/shared/utils/assets';
import { formatCurrency, formatQuantity, formatUnidade } from '@/shared/utils/format';
import { productQuoteMessage } from '@/shared/utils/whatsapp';
import { ProductGrid } from '../components/ProductGrid';
import { SectionHeading } from '../components/SectionHeading';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const { id } = useParams();
  const { produtos, loading, error, categoriaNome } = usePublicCatalog();
  const produto = produtos.find((p) => p.id === id);
  const minimo = produto?.pedidoMinimo ?? 1;
  const [quantidade, setQuantidade] = useState<number | null>(minimo);

  useEffect(() => {
    setQuantidade(minimo);
    if (produto) document.title = `${produto.nome} · ${site.nome}`;
    return () => {
      document.title = `${site.nome} · ${site.segmento}`;
    };
  }, [produto, minimo]);

  if (loading) {
    return (
      <div className={`container ${styles.loading}`}>
        <Spinner />
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className={`container ${styles.page}`}>
        <EmptyState
          icon={<IconBox />}
          title={error ? 'Não foi possível carregar o produto' : 'Produto não encontrado'}
          description={error ?? 'Ele pode ter sido removido do catálogo.'}
          action={<Button to="/produtos">Ver todos os produtos</Button>}
        />
      </div>
    );
  }

  const relacionados = produtos.filter((p) => p.id !== produto.id && p.categoria === produto.categoria).slice(0, 3);
  const estimativa = produto.preco !== null && quantidade ? produto.preco * quantidade : null;

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/produtos" className={styles.back}>
        <IconArrowLeft size={18} /> Voltar ao catálogo
      </Link>

      <div className={styles.layout}>
        <div className={styles.media}>
          <img src={publicUrl(produto.imagem)} alt={produto.nome} />
        </div>

        <div className={styles.info}>
          <Link to={`/produtos?categoria=${produto.categoria}`} className={styles.category}>
            <Badge tone="brand">{categoriaNome(produto.categoria)}</Badge>
          </Link>
          <h1 className={styles.title}>{produto.nome}</h1>
          <ProductPrice produto={produto} size="lg" />
          <p className={styles.description}>{produto.descricao}</p>

          <div className={styles.quote}>
            <QuantityInput
              label="Quantidade desejada"
              value={quantidade}
              onChange={setQuantidade}
              min={minimo}
              size="lg"
              suffix={formatUnidade(produto.unidade, quantidade ?? 2)}
              hint={produto.pedidoMinimo ? `Pedido mínimo: ${formatQuantity(produto.pedidoMinimo, produto.unidade)}` : undefined}
            />
            {estimativa !== null && (
              <p className={styles.estimate}>
                Estimativa: <strong>{formatCurrency(estimativa)}</strong>
                <span> · valor final confirmado no orçamento</span>
              </p>
            )}
            <WhatsAppButton size="lg" block message={productQuoteMessage(produto, quantidade)}>
              Pedir orçamento no WhatsApp
            </WhatsAppButton>
            <p className={styles.note}>Você será direcionado ao WhatsApp com a mensagem pronta.</p>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className={styles.related}>
          <SectionHeading title="Produtos relacionados" />
          <ProductGrid produtos={relacionados} categoriaNome={categoriaNome} />
        </section>
      )}
    </div>
  );
}
