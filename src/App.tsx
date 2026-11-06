import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner, ToastProvider } from '@/shared/components';
import { SiteLayout } from '@/features/site/layout/SiteLayout';
import { HomePage } from '@/features/site/pages/HomePage';
import { ProductsPage } from '@/features/site/pages/ProductsPage';
import { ProductDetailPage } from '@/features/site/pages/ProductDetailPage';
import { NotFoundPage } from '@/features/site/pages/NotFoundPage';

// O painel admin é carregado sob demanda — visitantes do site nunca baixam esse código.
const AdminApp = lazy(() => import('@/features/admin/AdminApp'));

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="produtos/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}><Spinner /></div>}>
                <AdminApp />
              </Suspense>
            }
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
