import { useEffect } from 'react';
import { Spinner } from '@/shared/components';
import { site } from '@/config/site';
import { AdminSessionProvider, useAdminSession } from './session/AdminSession';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function AdminRouter() {
  const { repository, restoring } = useAdminSession();

  if (restoring) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  return repository ? <DashboardPage repository={repository} /> : <LoginPage />;
}

export default function AdminApp() {
  useEffect(() => {
    document.title = `Painel · ${site.nome}`;
    // Impede indexação do painel por buscadores
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <AdminSessionProvider>
      <AdminRouter />
    </AdminSessionProvider>
  );
}
