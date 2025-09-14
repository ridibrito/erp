'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// Singleton global para evitar múltiplas instâncias
declare global {
  var __supabaseClient: ReturnType<typeof createClient> | undefined;
}

/**
 * Hook para obter o cliente Supabase do lado do cliente
 * Garante que apenas uma instância seja criada
 */
export function useSupabase() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(() => {
    // Inicializar apenas no cliente
    if (typeof window !== 'undefined') {
      if (!global.__supabaseClient) {
        global.__supabaseClient = createClient(
          config.supabase.url,
          config.supabase.anonKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storage: window.localStorage,
            },
          }
        );
      }
      return global.__supabaseClient;
    }
    return null;
  });

  return supabase;
}
