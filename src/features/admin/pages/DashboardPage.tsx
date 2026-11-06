import { useState } from 'react';
import { Badge, Button, EmptyState, Spinner } from '@/shared/components';
import { IconFolder, IconGithub, IconLogout } from '@/shared/icons';
import type { CatalogRepository } from '@/services/catalog/types';
import { Logo } from '@/features/site/layout/Logo';
import { cx } from '@/shared/utils/cx';
import { useCatalogEditor } from '../hooks/useCatalogEditor';
import { useAdminSession } from '../session/AdminSession';
import { ProductsPanel } from '../products/ProductsPanel';
import { CategoriesPanel } from '../categories/CategoriesPanel';
import styles from './DashboardPage.module.css';

type Tab = 'produtos' | 'categorias';

export function DashboardPage({ repository }: { repository: CatalogRepository }) {
  const { logout } = useAdminSession();
  const editor = useCatalogEditor(repository);
  const [tab, setTab] = useState<Tab>('produtos');

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Logo />
          <div className={styles.session}>
            <Badge tone={repository.kind === 'local' ? 'accent' : 'neutral'} icon={repository.kind === 'local' ? <IconFolder size={14} /> : <IconGithub size={14} />}>
              {repository.label}
            </Badge>
            <Button href={import.meta.env.BASE_URL} target="_blank" variant="ghost" size="sm">
              Ver site
            </Button>
            <Button variant="ghost" size="sm" icon={<IconLogout size={18} />} onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        <nav className={styles.tabs} role="tablist">
          {(['produtos', 'categorias'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={cx(styles.tab, tab === t && styles.tabActive)}
              onClick={() => setTab(t)}
            >
              {t === 'produtos' ? 'Produtos' : 'Categorias'}
            </button>
          ))}
        </nav>

        {editor.conflict && (
          <div className={styles.alert} role="alert">
            <span>O catálogo foi alterado em outro lugar. Recarregue para continuar editando sobre a versão mais recente.</span>
            <Button size="sm" onClick={editor.reload}>
              Recarregar
            </Button>
          </div>
        )}

        {editor.loading ? (
          <div className={styles.center}>
            <Spinner />
          </div>
        ) : editor.loadError || !editor.catalogo ? (
          <EmptyState
            title="Não foi possível carregar o catálogo"
            description={editor.loadError}
            action={<Button onClick={editor.reload}>Tentar novamente</Button>}
          />
        ) : tab === 'produtos' ? (
          <ProductsPanel editor={editor} catalogo={editor.catalogo} repository={repository} />
        ) : (
          <CategoriesPanel editor={editor} catalogo={editor.catalogo} />
        )}
      </main>
    </div>
  );
}
