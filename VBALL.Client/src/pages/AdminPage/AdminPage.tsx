import styles from './AdminPage.module.css';

export const AdminPage: React.FC = () => {
  return (
    <section className={styles.page}>
      <h1 className={styles.sectionTitle}>Администрирование матчей</h1>
      <p className={styles.placeholder}>
        Здесь появятся инструменты управления матчами, составами и экстренными заменами.
      </p>
    </section>
  );
};
