'use client';
import { useEffect } from 'react';

export default function PortalRoot() {
  useEffect(() => {
    const portalRoot = document.createElement('div');
    portalRoot.id = 'portal-root';
    document.body.appendChild(portalRoot);
    return () => {
      document.body.removeChild(portalRoot);
    };
  }, []);

  return <div id="portal-root" />;
}
