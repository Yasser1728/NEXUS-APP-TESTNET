import Link from 'next/link';
import styles from '../privacy/legal.module.css';

export const metadata = {
  title: 'Terms of Service — TEC | The Elite Consortium',
  description: 'Terms of Service for TEC — The Elite Consortium ecosystem built on Pi Network.',
};

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using any application within The Elite Consortium ("TEC") ecosystem — including tec.pi, nexus.pi, and all 24 affiliated domains — you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms").

If you do not agree to these Terms, you must immediately cease all use of TEC services. These Terms constitute a legally binding agreement between you and The Elite Consortium.`,
  },
  {
    id: 'description',
    title: '2. Description of Services',
    content: `TEC provides a suite of 24 sovereign digital applications built on the Pi Network blockchain platform. Our services include, but are not limited to:`,
    items: [
      'Pi Network payment processing and TEC token conversion (1 Pi = 0.1 TEC)',
      'Digital asset management, portfolio tracking, and investment tools',
      'E-commerce, marketplace, and digital commerce platforms',
      'Real estate, travel, healthcare, and lifestyle services',
      'Analytics, data intelligence, and business automation tools',
      'Social networking, identity management, and communication services',
    ],
    footer: `TEC operates as an independent developer application on Pi Network and is not affiliated with, endorsed by, or a partner of Pi Network or Minepi, Inc.`,
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    content: `To use TEC services, you must:`,
    items: [
      'Be at least 18 years of age, or the age of majority in your jurisdiction',
      'Have a valid Pi Network account in good standing',
      'Have the legal capacity to enter into binding agreements',
      'Not be located in a jurisdiction where use of our services is prohibited',
      'Not be on any government sanctions list or restricted party list',
    ],
    footer: `TEC reserves the right to refuse service to anyone at our sole discretion.`,
  },
  {
    id: 'account',
    title: '4. Account & Authentication',
    content: `TEC uses Pi Network's authentication system exclusively. You are responsible for:`,
    items: [
      'Maintaining the security of your Pi Network credentials',
      'All activity that occurs under your Pi Network account',
      'Notifying us immediately of any unauthorized use of your account',
      'Ensuring your Pi Network account information remains accurate and current',
    ],
    footer: `TEC cannot and does not have access to your Pi Network password or private keys. We are not liable for any loss resulting from unauthorized account access.`,
  },
  {
    id: 'payments',
    title: '5. Payments & Transactions',
    subsections: [
      {
        subtitle: '5.1 Pi Network Payments',
        text: `All payments processed through TEC use Pi Network's payment infrastructure. By initiating a payment, you authorize TEC to submit the transaction to the Pi Network API for processing. All payments are subject to Pi Network's terms and conditions.`,
      },
      {
        subtitle: '5.2 TEC Token Conversion',
        text: `Upon successful completion of a Pi payment, TEC credits your wallet with TEC tokens at the rate of 1 Pi = 0.1 TEC. This conversion rate may be updated with 30 days' notice. TEC tokens are utility tokens within the TEC ecosystem and do not represent ownership, equity, or investment in TEC.`,
      },
      {
        subtitle: '5.3 Transaction Finality',
        text: `Blockchain transactions are irreversible by nature. Once a Pi Network transaction is confirmed on-chain, it cannot be reversed. TEC will make reasonable efforts to resolve disputes, but cannot guarantee reversal of completed blockchain transactions.`,
      },
      {
        subtitle: '5.4 Fees',
        text: `TEC may charge service fees for certain transactions. All applicable fees will be clearly disclosed before you authorize any payment. Fees are non-refundable except where required by applicable law.`,
      },
    ],
  },
  {
    id: 'prohibited',
    title: '6. Prohibited Conduct',
    content: `You agree not to use TEC services to:`,
    items: [
      'Violate any applicable law, regulation, or third-party rights',
      'Engage in fraudulent, deceptive, or manipulative transactions',
      'Attempt to reverse-engineer, hack, or compromise our systems',
      'Transmit malware, viruses, or other harmful code',
      'Conduct money laundering or other financial crimes',
      'Impersonate any person or entity',
      'Harvest or collect user data without authorization',
      'Use automated bots or scripts to access our services without permission',
      'Engage in market manipulation or artificial price inflation',
      'Circumvent any security, rate limiting, or access control measures',
    ],
    footer: `Violation of these prohibitions may result in immediate account suspension, legal action, and reporting to relevant authorities.`,
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property',
    content: `All content, trademarks, logos, software, and other materials within the TEC ecosystem are the intellectual property of The Elite Consortium or its licensors. You are granted a limited, non-exclusive, non-transferable license to use TEC services for their intended purpose.

You may not copy, reproduce, distribute, modify, create derivative works from, or commercially exploit any TEC materials without our express written consent.`,
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimers & Limitation of Liability',
    subsections: [
      {
        subtitle: '8.1 Service Availability',
        text: `TEC services are provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted, error-free, or secure service. We reserve the right to modify, suspend, or discontinue any service at any time without notice.`,
      },
      {
        subtitle: '8.2 Blockchain Risks',
        text: `Cryptocurrency and blockchain transactions involve significant risks including market volatility, technical failures, and regulatory uncertainty. You acknowledge these risks and accept sole responsibility for your financial decisions.`,
      },
      {
        subtitle: '8.3 Limitation of Liability',
        text: `To the maximum extent permitted by law, TEC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of our services. Our total aggregate liability shall not exceed the amount you paid to TEC in the 12 months preceding the claim.`,
      },
    ],
  },
  {
    id: 'indemnification',
    title: '9. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless TEC, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services, violation of these Terms, or infringement of any third-party rights.`,
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: `TEC may suspend or terminate your access to our services at any time, with or without cause, and with or without notice. Reasons for termination may include, but are not limited to, violation of these Terms, fraudulent activity, or inactivity.

Upon termination, your right to use TEC services ceases immediately. Provisions of these Terms that by their nature should survive termination shall continue in full force.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Disputes',
    content: `These Terms shall be governed by applicable law. Any disputes arising from these Terms or your use of TEC services shall first be addressed through good-faith negotiation. If resolution cannot be reached within 30 days, disputes shall be submitted to binding arbitration.

You waive any right to participate in class-action lawsuits or class-wide arbitration against TEC.`,
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. Material changes will be communicated through in-app notifications or email (where provided). Continued use of TEC services after the effective date of changes constitutes your acceptance of the updated Terms.

We recommend reviewing these Terms periodically. The current version is always available at tec.pi/terms.`,
  },
  {
    id: 'contact',
    title: '13. Contact',
    content: `For questions regarding these Terms of Service:`,
    contact: {
      email: 'legal@tec.pi',
      entity: 'The Elite Consortium',
      response: 'We aim to respond to all legal inquiries within 5 business days.',
    },
  },
];

export default function TermsPage() {
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
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>The Elite Consortium</p>
        <div className={styles.meta}>
          <span>Effective Date: {effectiveDate}</span>
          <span className={styles.metaDot}>·</span>
          <span>Version 1.0</span>
        </div>
        <p className={styles.intro}>
          Please read these Terms carefully before using any TEC application.
          By using our services, you agree to be bound by these Terms.
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
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <span className={styles.metaDot}>·</span>
          <Link href="/" className={styles.footerLink}>Back to Home</Link>
        </div>
        <p className={styles.footerText}>© 2026 The Elite Consortium · Built on Pi Network</p>
      </footer>
    </main>
  );
}
