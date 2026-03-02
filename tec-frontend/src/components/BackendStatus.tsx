'use client';

import { useEffect, useState, useCallback } from 'react';
import { checkGatewayHealth } from '@/lib-client/api/health';
import styles from './BackendStatus.module.css';

const RETRY_INTERVAL_MS = 30_000;

export default function BackendStatus() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    const { online } = await checkGatewayHealth();
    setOffline(!online);
    if (online) setDismissed(false);
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, RETRY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [check]);

  if (!offline || dismissed) return null;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.message}>⚠️ Backend services are currently offline</span>
      <button className={styles.dismiss} onClick={() => setDismissed(true)} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
