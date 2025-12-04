import { NavLink } from 'react-router-dom';
import styles from './Shell.module.css';

const NAV_LINKS = [
  { to: '/calendar', label: 'Расписание' },
  { to: '/admin', label: 'Админ' },
];

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>VBALL</div>
        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
};
