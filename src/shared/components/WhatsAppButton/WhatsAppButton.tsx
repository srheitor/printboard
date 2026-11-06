import { IconWhatsApp } from '@/shared/icons';
import { whatsappLink } from '@/shared/utils/whatsapp';
import { Button, type ButtonSize } from '../Button/Button';

export interface WhatsAppButtonProps {
  /** Mensagem pré-preenchida. Se omitida, usa a mensagem padrão do site. */
  message?: string;
  children?: string;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

export function WhatsAppButton({ message, children = 'Falar no WhatsApp', size, block, className }: WhatsAppButtonProps) {
  return (
    <Button
      variant="whatsapp"
      href={whatsappLink(message)}
      icon={<IconWhatsApp />}
      size={size}
      block={block}
      className={className}
    >
      {children}
    </Button>
  );
}
