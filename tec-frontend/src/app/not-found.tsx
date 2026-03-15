import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata = {
  title: '404 — Page Not Found | TEC',
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.bg} aria-hidden>
        <div className={styles.bgOrb} />
        <div className={styles.bgGrid} />
      </div>

      <div className={styles.content}>
        <div className={styles.icon}>🔍</div>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>الصفحة غير موجودة</h1>
        <p className={styles.desc}>
          عذراً، لم نتمكن من العثور على الصفحة المطلوبة.
          <br />
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            ← العودة للرئيسية / Go back home
          </Link>
          <Link href="/dashboard" className={styles.btnSecondary}>
            Dashboard
          </Link>
        </div>

        <div className={styles.apps}>
          <p className={styles.appsLabel}>Explore our apps</p>
          <div className={styles.appsRow}>
            {['nexus.pi', 'fundx.pi', 'vip.pi', 'estate.pi'].map(domain => (
              <a
                key={domain}
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.appChip}
              >
                {domain}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
