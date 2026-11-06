import { Button, EmptyState } from '@/shared/components';
import { IconBox } from '@/shared/icons';

export function NotFoundPage() {
  return (
    <div className="container" style={{ paddingTop: 64 }}>
      <EmptyState
        icon={<IconBox />}
        title="Página não encontrada"
        description="O endereço que você acessou não existe ou foi alterado."
        action={<Button to="/">Voltar para o início</Button>}
      />
    </div>
  );
}
