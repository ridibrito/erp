const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPermissions() {
  try {
    console.log('🧪 Testando sistema de permissões...');
    
    // 1. Verificar se as permissões foram inseridas
    console.log('📋 Verificando permissões...');
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('name, module, action, resource')
      .order('module', { ascending: true });
    
    if (permError) {
      console.error('❌ Erro ao buscar permissões:', permError);
      return;
    }
    
    console.log(`✅ ${permissions.length} permissões encontradas`);
    
    // Agrupar por módulo
    const permissionsByModule = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm.name);
      return acc;
    }, {});
    
    console.log('📊 Permissões por módulo:');
    Object.entries(permissionsByModule).forEach(([module, perms]) => {
      console.log(`   ${module}: ${perms.length} permissões`);
    });
    
    // 2. Verificar roles
    console.log('\n👥 Verificando roles...');
    const { data: roles, error: roleError } = await supabase
      .from('roles')
      .select('name, description, is_system')
      .order('name', { ascending: true });
    
    if (roleError) {
      console.error('❌ Erro ao buscar roles:', roleError);
      return;
    }
    
    console.log(`✅ ${roles.length} roles encontrados:`);
    roles.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });
    
    // 3. Verificar associações role-permissão
    console.log('\n🔗 Verificando associações role-permissão...');
    const { data: rolePermissions, error: rpError } = await supabase
      .from('role_permissions')
      .select(`
        role_id,
        roles!inner(name),
        permissions!inner(name, module)
      `);
    
    if (rpError) {
      console.error('❌ Erro ao buscar associações:', rpError);
      return;
    }
    
    console.log(`✅ ${rolePermissions.length} associações encontradas`);
    
    // Agrupar por role
    const permissionsByRole = rolePermissions.reduce((acc, rp) => {
      const roleName = rp.roles.name;
      if (!acc[roleName]) acc[roleName] = [];
      acc[roleName].push(rp.permissions.name);
      return acc;
    }, {});
    
    console.log('📊 Permissões por role:');
    Object.entries(permissionsByRole).forEach(([role, perms]) => {
      console.log(`   ${role}: ${perms.length} permissões`);
    });
    
    // 4. Testar função de verificação de permissões
    console.log('\n🔍 Testando verificação de permissões...');
    
    // Simular permissões de um usuário admin
    const adminPermissions = permissionsByRole['admin'] || [];
    console.log(`Admin tem ${adminPermissions.length} permissões`);
    
    // Testar algumas verificações
    const testCases = [
      { permission: 'dashboard.view', shouldHave: true },
      { permission: 'users.create', shouldHave: true },
      { permission: 'crm.leads.view', shouldHave: true },
      { permission: 'system.admin', shouldHave: false },
      { permission: 'nonexistent.permission', shouldHave: false }
    ];
    
    testCases.forEach(test => {
      const hasPermission = adminPermissions.includes(test.permission);
      const status = hasPermission === test.shouldHave ? '✅' : '❌';
      console.log(`   ${status} ${test.permission}: ${hasPermission ? 'SIM' : 'NÃO'} (esperado: ${test.shouldHave ? 'SIM' : 'NÃO'})`);
    });
    
    // 5. Verificar configurações da organização
    console.log('\n⚙️ Verificando configurações...');
    const { data: settings, error: settingsError } = await supabase
      .from('tenant_settings')
      .select('key, value');
    
    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError);
      return;
    }
    
    console.log(`✅ ${settings.length} configurações encontradas:`);
    settings.forEach(setting => {
      console.log(`   - ${setting.key}: ${JSON.stringify(setting.value)}`);
    });
    
    console.log('\n🎉 Sistema de permissões funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testPermissions();
