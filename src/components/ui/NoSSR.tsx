'use client';

import { useEffect, useState } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza apenas no cliente, evitando problemas de hidratação
 * Útil para componentes que dependem de APIs do navegador ou extensões
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-background">
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}
