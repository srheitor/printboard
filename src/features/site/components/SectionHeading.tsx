import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={styles.heading} data-align={align}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <Tag className={styles.title}>{title}</Tag>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
