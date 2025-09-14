const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas existentes...');
    
    // Lista de tabelas que deveriam existir
    const expectedTables = [
      'tenant_domains', 'tenant_settings', 'permissions', 'roles', 
      'role_permissions', 'user_permissions', 'user_sessions',
      'two_factor_auth', 'trusted_devices', 'data_consents',
      'data_subject_requests', 'data_processing_logs', 'audit_logs',
      'security_logs', 'api_keys', 'oauth_connections'
    ];
    
    // Verificar quais tabelas existem
    const { data: existingTables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', expectedTables);
    
    if (error) {
      console.error('❌ Erro ao verificar tabelas:', error);
      return;
    }
    
    const existingTableNames = existingTables?.map(t => t.table_name) || [];
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    
    console.log('✅ Tabelas existentes:', existingTableNames.join(', '));
    console.log('❌ Tabelas faltando:', missingTables.length > 0 ? missingTables.join(', ') : 'Nenhuma');
    
    // Verificar se há dados nas tabelas principais
    if (existingTableNames.includes('permissions')) {
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('count')
        .limit(1);
      
      if (!permError) {
        console.log('📊 Permissões cadastradas:', permissions?.length || 0);
      }
    }
    
    if (existingTableNames.includes('roles')) {
      const { data: roles, error: roleError } = await supabase
        .from('roles')
        .select('count')
        .limit(1);
      
      if (!roleError) {
        console.log('👥 Papéis cadastrados:', roles?.length || 0);
      }
    }
    
    return {
      existing: existingTableNames,
      missing: missingTables
    };
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkTables();
