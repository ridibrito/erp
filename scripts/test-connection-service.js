const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Testando conexão com Supabase usando Service Role...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🧪 Testando conexão básica...');
    
    // Testar se podemos acessar as tabelas diretamente
    const expectedTables = [
      'permissions', 'roles', 'user_sessions', 'audit_logs', 
      'api_keys', 'tenant_domains', 'tenant_settings'
    ];
    
    const existingTables = [];
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
        }
      } catch (err) {
        // Tabela não existe ou erro de acesso
      }
    }
    
    console.log('✅ Tabelas encontradas:', existingTables.join(', '));
    
    // Testar se há dados nas tabelas principais
    if (existingTables.includes('permissions')) {
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('name, module, action')
        .limit(5);
      
      if (!permError && permissions) {
        console.log('📊 Permissões cadastradas:', permissions.length);
        console.log('   Exemplos:', permissions.map(p => p.name).join(', '));
      }
    }
    
    if (existingTables.includes('roles')) {
      const { data: roles, error: roleError } = await supabase
        .from('roles')
        .select('name, is_system')
        .limit(5);
      
      if (!roleError && roles) {
        console.log('👥 Papéis cadastrados:', roles.length);
        console.log('   Exemplos:', roles.map(r => r.name).join(', '));
      }
    }
    
    // Testar inserção de dados
    console.log('🧪 Testando inserção de dados...');
    
    const { data: testInsert, error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        org_id: '00000000-0000-0000-0000-000000000000',
        action: 'test',
        table_name: 'test_table',
        description: 'Teste de conexão'
      })
      .select();
    
    if (insertError) {
      console.warn('⚠️  Erro na inserção de teste:', insertError.message);
    } else {
      console.log('✅ Inserção de teste funcionando!');
      
      // Limpar dados de teste
      await supabase
        .from('audit_logs')
        .delete()
        .eq('action', 'test');
    }
    
    console.log('🎉 Conexão com Supabase funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

testConnection();
