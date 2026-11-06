import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/shared/utils/cx';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
type AsRouterLink = CommonProps & { to: string; href?: never; onClick?: () => void };
type AsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never };

export type ButtonProps = AsButton | AsRouterLink | AsAnchor;

/**
 * Botão único do projeto. Renderiza <button>, <Link> (prop `to`) ou <a> (prop `href`)
 * mantendo sempre o mesmo visual.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', icon, iconRight, block, loading, children, className, ...rest } = props;

  const classes = cx(styles.button, styles[variant], styles[size], block && styles.block, className);
  const content = (
    <>
      {loading ? <Spinner size={16} /> : icon}
      {children && <span>{children}</span>}
      {iconRight}
    </>
  );

  if ('to' in rest && rest.to !== undefined) {
    const { to, onClick } = rest as AsRouterLink;
    return (
      <Link to={to} onClick={onClick} className={classes}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = /^https?:/.test(anchorProps.href ?? '');
    return (
      <a {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...anchorProps} className={classes}>
        {content}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...buttonProps} disabled={buttonProps.disabled || loading} className={classes}>
      {content}
    </button>
  );
}
