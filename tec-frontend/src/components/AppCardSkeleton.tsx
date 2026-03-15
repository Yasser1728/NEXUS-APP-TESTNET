import styles from './AppCardSkeleton.module.css';

export function AppCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.emoji} />
        <div className={styles.category} />
      </div>
      <div className={styles.name} />
      <div className={styles.desc} />
      <div className={styles.desc} style={{ width: '60%' }} />
      <div className={styles.footer}>
        <div className={styles.domain} />
        <div className={styles.arrow} />
      </div>
    </div>
  );
}

export function AppGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <AppCardSkeleton key={i} />
      ))}
    </div>
  );
}
