import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { IconInstagram, IconMail, IconMapPin, IconWhatsApp } from '@/shared/icons';
import { formatPhone, whatsappLink } from '@/shared/utils/whatsapp';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <Logo inverted />
          <p>{site.descricao}</p>
        </div>

        <nav aria-label="Rodapé">
          <h3 className={styles.heading}>Navegação</h3>
          <ul className={styles.list}>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/produtos">Produtos</Link></li>
            <li><Link to="/#sobre">Sobre nós</Link></li>
            <li><Link to="/#contato">Contato</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className={styles.heading}>Contato</h3>
          <ul className={styles.list}>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp size={16} /> {formatPhone()}
              </a>
            </li>
            {site.contato.instagram && (
              <li>
                <a href={site.contato.instagram} target="_blank" rel="noopener noreferrer">
                  <IconInstagram size={16} /> Instagram
                </a>
              </li>
            )}
            {site.contato.email && (
              <li>
                <a href={`mailto:${site.contato.email}`}>
                  <IconMail size={16} /> {site.contato.email}
                </a>
              </li>
            )}
            {site.cidade && (
              <li>
                <span>
                  <IconMapPin size={16} /> {site.cidade}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} {site.nome}. Todos os direitos reservados.</span>
        <Link to="/admin" className={styles.admin}>Área restrita</Link>
      </div>
    </footer>
  );
}
