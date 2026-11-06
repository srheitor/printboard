import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '@/config/site';
import { WhatsAppButton } from '@/shared/components';
import { IconClose, IconMenu } from '@/shared/icons';
import { cx } from '@/shared/utils/cx';
import { Logo } from './Logo';
import styles from './Header.module.css';

const LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/produtos', label: 'Produtos' },
  { to: '/#sobre', label: 'Sobre nós' },
  { to: '/#contato', label: 'Contato' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);

  return (
    <header className={styles.header}>
      <div className={cx('container', styles.inner)}>
        <Link to="/" className={styles.brand} aria-label={`${site.nome} — início`}>
          <Logo />
        </Link>

        <nav className={cx(styles.nav, open && styles.open)} aria-label="Principal">
          {LINKS.map((link) =>
            link.to.includes('#') ? (
              <Link key={link.to} to={link.to} className={styles.link}>
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => cx(styles.link, isActive && !location.hash && styles.active)}
              >
                {link.label}
              </NavLink>
            ),
          )}
          <WhatsAppButton size="sm" className={styles.cta}>
            Pedir orçamento
          </WhatsAppButton>
        </nav>

        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
}
