'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PiPaymentButton from '@/components/payment/PiPaymentButton';
import styles from './page.module.css';

// ─── APP CONFIG ───────────────────────────────────────────────
// غير القيم دي في كل app
const APP_CONFIG = {
  name:        'Nexus',
  emoji:       '🌐',
  domain:      'nexus.pi',
  tagline_en:  'Gateway to 24 Apps',
  tagline_ar:  'بوابة الـ 24 تطبيق',
  desc_en:     'Connect, navigate and explore the full TEC ecosystem in one place.',
  desc_ar:     'تواصل واستكشف منظومة TEC الكاملة في مكان واحد.',
  category:    'Hub',
  color:       '#ffffff',
};
// ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t, dir, locale } = useTranslation();
  const ar = locale === 'ar';

  return (
    <main className={styles.main} dir={dir}>

      {/* Background */}
      <div className={styles.bg} aria-hidden>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
        <div className={styles.bgNoise} />
      </div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoMark}>T</span>
          <span className={styles.navLogoText}>EC</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#about" className={styles.navLink}>
            {ar ? 'عن التطبيق' : 'About'}
          </a>
          <a href="#payment" className={styles.navLink}>{t.common.login}</a>
          <Link href="/ai" className={styles.navAiLink}>
            🤖 {ar ? 'المساعد' : 'Assistant'}
          </Link>
        </div>
        <div className={styles.navRight}>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          {t.common.piEcosystem}
        </div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroTitleMain}>
            {APP_CONFIG.emoji} {APP_CONFIG.name}
          </span>
          <span className={styles.heroTitleAccent}>
            {ar ? APP_CONFIG.tagline_ar : APP_CONFIG.tagline_en}
          </span>
        </h1>
        <p className={styles.heroSub}>
          {ar ? APP_CONFIG.desc_ar : APP_CONFIG.desc_en}
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>24</span>
            <span className={styles.heroStatLabel}>{t.home.stats.apps}</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>47M+</span>
            <span className={styles.heroStatLabel}>{t.home.stats.piUsers}</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>1</span>
            <span className={styles.heroStatLabel}>{t.home.stats.identity}</span>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section id="payment" className={styles.paymentSection}>
        <div className={styles.paymentCard}>
          <div className={styles.paymentCardInner}>
            <p className={styles.paymentLabel}>{t.common.login}</p>
            <PiPaymentButton />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutCard}>
          <span className={styles.aboutEmoji}>{APP_CONFIG.emoji}</span>
          <h2 className={styles.aboutTitle}>
            {APP_CONFIG.name}.pi
          </h2>
          <p className={styles.aboutDesc}>
            {ar ? APP_CONFIG.desc_ar : APP_CONFIG.desc_en}
          </p>
          <Link href="/dashboard" className={styles.aboutBtn}>
            {ar ? 'ابدأ الآن ←' : 'Get Started →'}
          </Link>
        </div>
      </section>

      {/* Back to TEC */}
      <section className={styles.backSection}>
        <a
          href="https://tec.pi"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.backLink}
        >
          👑 {ar ? 'العودة إلى TEC' : 'Back to TEC'}
        </a>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span className={styles.navLogoMark}>T</span>
          <span className={styles.navLogoText}>EC</span>
        </div>
        <p className={styles.footerText}>
          © 2026 {APP_CONFIG.name}.pi · Built on Pi Network
        </p>
        <div className={styles.footerLinks}>
          <a href="/privacy" className={styles.footerLink}>Privacy</a>
          <a href="/terms" className={styles.footerLink}>Terms</a>
        </div>
      </footer>

      {/* Floating AI Button */}
      <Link href="/ai" className={styles.floatingAi} aria-label="TEC Assistant">
        <span className={styles.floatingAiIcon}>🤖</span>
        <span className={styles.floatingAiPulse} />
      </Link>

    </main>
  );
}
