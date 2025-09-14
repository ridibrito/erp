const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Definida' : '❌ Não definida');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Testar conexão básica
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error) {
      console.log('ℹ️  Tabela de migrações não encontrada (normal para projeto novo)');
    } else {
      console.log('✅ Conexão com Supabase funcionando!');
    }
    
    // Testar se podemos criar uma tabela simples
    console.log('🧪 Testando criação de tabela...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS test_table (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Tentar executar via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec', { sql: createTableSQL });
    
    if (rpcError) {
      console.log('⚠️  RPC exec não disponível:', rpcError.message);
      console.log('💡 Vamos usar o Supabase Studio para aplicar as migrações');
    } else {
      console.log('✅ RPC exec funcionando!');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
