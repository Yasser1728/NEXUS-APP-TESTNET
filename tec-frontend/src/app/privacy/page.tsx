import Link from 'next/link';
import styles from './legal.module.css';

export const metadata = {
  title: 'Privacy Policy — TEC | The Elite Consortium',
  description: 'Privacy Policy for TEC — The Elite Consortium ecosystem built on Pi Network.',
};

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `The Elite Consortium ("TEC", "we", "our", or "us") operates a suite of 24 sovereign applications built on the Pi Network blockchain. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use any TEC application, including tec.pi, nexus.pi, and all affiliated domains.

By accessing or using any TEC application, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use immediately.`,
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    subsections: [
      {
        subtitle: '2.1 Pi Network Identity Data',
        text: `When you authenticate via Pi Network, we receive your Pi Network User ID (UID), Pi username, and access tokens. We do not receive or store your Pi Network password or private keys. Authentication is handled exclusively through Pi Network's secure OAuth flow.`,
      },
      {
        subtitle: '2.2 Transaction Data',
        text: `We record payment records including transaction identifiers, amounts, timestamps, payment status, and blockchain transaction IDs (txid). This data is necessary to provide our services and maintain financial integrity.`,
      },
      {
        subtitle: '2.3 Usage Data',
        text: `We automatically collect technical information including IP addresses, browser type and version, device information, pages visited, time spent on pages, and referring URLs. This data is collected in aggregate and used solely for service improvement.`,
      },
      {
        subtitle: '2.4 Communications',
        text: `If you contact us directly, we may retain records of that correspondence including your contact information and the content of your messages.`,
      },
    ],
  },
  {
    id: 'use-of-information',
    title: '3. How We Use Your Information',
    items: [
      'To authenticate your identity and provide secure access to TEC services',
      'To process Pi Network payments and maintain accurate transaction records',
      'To credit TEC tokens to your wallet following successful Pi payments',
      'To detect, investigate, and prevent fraudulent transactions and abuse',
      'To comply with applicable legal obligations',
      'To improve, personalize, and expand our services',
      'To communicate service updates, security alerts, and administrative messages',
      'To enforce our Terms of Service',
    ],
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing & Disclosure',
    content: `We do not sell, trade, or rent your personal information to third parties for marketing purposes.

We may share your information only in the following circumstances:`,
    items: [
      'Pi Network: Authentication and payment processing requires sharing data with Pi Network pursuant to their platform terms',
      'Service Providers: Trusted vendors who assist in operating our platform under strict confidentiality obligations',
      'Legal Compliance: When required by law, court order, or governmental authority',
      'Safety: To protect the rights, property, or safety of TEC, our users, or the public',
      'Business Transfers: In connection with a merger, acquisition, or sale of assets, with prior notice to users',
    ],
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: `We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.

Transaction records are retained for a minimum of 7 years to comply with financial regulations. Authentication data is retained for the duration of your account's active status plus 90 days. You may request deletion of your account data at any time, subject to our legal retention obligations.`,
  },
  {
    id: 'security',
    title: '6. Security',
    content: `We implement industry-standard security measures to protect your personal information, including:`,
    items: [
      'TLS/SSL encryption for all data in transit',
      'AES-256 encryption for sensitive data at rest',
      'JWT-based authentication with short-lived access tokens and secure refresh token rotation',
      'Rate limiting and idempotency controls on all payment endpoints',
      'Regular security audits and penetration testing',
      'Principle of least privilege for internal system access',
    ],
    footer: `No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:`,
    items: [
      'Access: Request a copy of the personal data we hold about you',
      'Rectification: Request correction of inaccurate or incomplete data',
      'Erasure: Request deletion of your personal data (subject to legal obligations)',
      'Portability: Request transfer of your data in a machine-readable format',
      'Objection: Object to certain types of processing',
      'Restriction: Request restriction of processing in certain circumstances',
    ],
    footer: `To exercise any of these rights, contact us at privacy@tec.pi. We will respond within 30 days.`,
  },
  {
    id: 'blockchain',
    title: '8. Blockchain & Pi Network',
    content: `Please be aware that transactions on the Pi Network blockchain are immutable and publicly visible. While we protect your off-chain personal data, on-chain transaction data (including wallet addresses and transaction amounts) is inherently public and cannot be deleted. This is a fundamental property of blockchain technology.

TEC is an independent developer application built on Pi Network. We are not affiliated with, endorsed by, or responsible for Pi Network's own privacy practices. Please review Pi Network's Privacy Policy separately.`,
  },
  {
    id: 'cookies',
    title: '9. Cookies & Local Storage',
    content: `We use browser local storage to maintain your authentication session (access tokens and refresh tokens). We do not use third-party tracking cookies or advertising cookies.

You may clear local storage at any time through your browser settings, which will log you out of all TEC applications.`,
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    content: `TEC services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected information from a minor, please contact us immediately at privacy@tec.pi and we will delete such information promptly.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will notify users of material changes by updating the "Effective Date" and, where appropriate, through in-app notification. Continued use of TEC services following notice of changes constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: `For privacy-related inquiries, data subject requests, or to report a security concern:`,
    contact: {
      email: 'privacy@tec.pi',
      entity: 'The Elite Consortium',
      response: 'We aim to respond to all inquiries within 5 business days.',
    },
  },
];

export default function PrivacyPage() {
  const effectiveDate = 'March 14, 2026';

  return (
    <main className={styles.main}>
      <div className={styles.bg} aria-hidden>
        <div className={styles.bgOrb} />
        <div className={styles.bgGrid} />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>← Back to TEC</Link>
        <div className={styles.badge}>Legal Document</div>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>The Elite Consortium</p>
        <div className={styles.meta}>
          <span>Effective Date: {effectiveDate}</span>
          <span className={styles.metaDot}>·</span>
          <span>Version 1.0</span>
        </div>
        <p className={styles.intro}>
          This policy governs how TEC collects, uses, and protects your personal data
          across all 24 sovereign applications in the TEC ecosystem.
        </p>
      </div>

      {/* Table of Contents */}
      <nav className={styles.toc}>
        <p className={styles.tocTitle}>Contents</p>
        <ul className={styles.tocList}>
          {SECTIONS.map(s => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={styles.tocLink}>{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <article className={styles.article}>
        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{s.title}</h2>

            {s.content && (
              <p className={styles.text}>{s.content}</p>
            )}

            {s.subsections && s.subsections.map(sub => (
              <div key={sub.subtitle} className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>{sub.subtitle}</h3>
                <p className={styles.text}>{sub.text}</p>
              </div>
            ))}

            {s.items && (
              <ul className={styles.list}>
                {s.items.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.listDot}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {s.footer && (
              <p className={styles.textMuted}>{s.footer}</p>
            )}

            {s.contact && (
              <div className={styles.contactBox}>
                <p className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href={`mailto:${s.contact.email}`} className={styles.contactLink}>{s.contact.email}</a>
                </p>
                <p className={styles.contactItem}>
                  <span className={styles.contactLabel}>Entity</span>
                  <span>{s.contact.entity}</span>
                </p>
                <p className={styles.contactItem}>
                  <span className={styles.contactLabel}>Response Time</span>
                  <span>{s.contact.response}</span>
                </p>
              </div>
            )}
          </section>
        ))}
      </article>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
          <span className={styles.metaDot}>·</span>
          <Link href="/" className={styles.footerLink}>Back to Home</Link>
        </div>
        <p className={styles.footerText}>© 2026 The Elite Consortium · Built on Pi Network</p>
      </footer>
    </main>
  );
}
