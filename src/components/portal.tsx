'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  selector?: string;
}

const Portal: React.FC<PortalProps> = ({
  children,
  selector = '#portal-root',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.querySelector(selector) as HTMLElement)
    : null;
};

export default Portal;
