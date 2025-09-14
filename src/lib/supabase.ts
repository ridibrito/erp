import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

// Singleton global para evitar múltiplas instâncias
declare global {
  var __supabase: SupabaseClient | undefined;
  var __supabaseAdmin: SupabaseClient | undefined;
}

// Função para criar o cliente Supabase do lado do cliente
function createSupabaseClient(): SupabaseClient {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );
}

// Função para criar o cliente Supabase administrativo
function createSupabaseAdminClient(): SupabaseClient {
  return createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Cliente Supabase para operações do lado do cliente
export const supabase = (() => {
  // Usar singleton global para evitar múltiplas instâncias
  if (typeof window !== 'undefined') {
    if (!global.__supabase) {
      global.__supabase = createSupabaseClient();
    }
    return global.__supabase;
  }
  
  // Para server-side, criar nova instância
  return createSupabaseClient();
})();

// Cliente Supabase para operações administrativas (server-side)
export const supabaseAdmin = (() => {
  if (!global.__supabaseAdmin) {
    global.__supabaseAdmin = createSupabaseAdminClient();
  }
  return global.__supabaseAdmin;
})();

// Função para executar SQL diretamente
export async function executeSQL(query: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: query });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro na execução SQL:', error);
    throw error;
  }
}

// Função para aplicar migração
export async function applyMigration(name: string, sql: string) {
  try {
    console.log(`Aplicando migração: ${name}`);
    
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        await executeSQL(command);
      }
    }
    
    console.log(`Migração ${name} aplicada com sucesso!`);
    return true;
  } catch (error) {
    console.error(`Erro ao aplicar migração ${name}:`, error);
    throw error;
  }
}
