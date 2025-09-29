const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para testar conexão básica
async function testBasicConnection() {
  try {
    console.log('🔍 Testando conexão básica...');
    
    // Testar com uma query simples
    const { data, error } = await supabase
      .from('permissions')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    } else {
      console.log('✅ Conexão básica funcionando!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message);
    return false;
  }
}

// Função para testar inserção simples
async function testSimpleInsert() {
  try {
    console.log('🔍 Testando inserção simples...');
    
    // Tentar inserir uma permissão de teste
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        name: 'test.connection',
        description: 'Teste de conexão',
        module: 'test',
        action: 'connection',
        resource: 'test'
      })
      .select();

    if (error) {
      console.log('❌ Erro na inserção:', error.message);
      return false;
    } else {
      console.log('✅ Inserção funcionando!');
      
      // Limpar dados de teste
      await supabase
        .from('permissions')
        .delete()
        .eq('name', 'test.connection');
      
      console.log('✅ Limpeza concluída!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na inserção:', error.message);
    return false;
  }
}

// Função para listar permissões existentes
async function listExistingPermissions() {
  try {
    console.log('🔍 Listando permissões existentes...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('name, module, action, resource')
      .order('module', { ascending: true });

    if (error) {
      console.log('❌ Erro ao listar permissões:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ ${data.length} permissões encontradas:`);
      
      // Agrupar por módulo
      const grouped = data.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
      }, {});

      Object.keys(grouped).forEach(module => {
        console.log(`  📁 ${module}: ${grouped[module].length} permissões`);
      });
      
      return true;
    } else {
      console.log('❌ Nenhuma permissão encontrada');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao listar permissões:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Teste de conexão e funcionalidade do banco de dados...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Testar conexão básica
    const connectionOk = await testBasicConnection();
    if (!connectionOk) {
      console.log('❌ Conexão básica falhou');
      process.exit(1);
    }

    console.log('');

    // 2. Testar inserção
    const insertOk = await testSimpleInsert();
    if (!insertOk) {
      console.log('❌ Inserção falhou');
      process.exit(1);
    }

    console.log('');

    // 3. Listar permissões existentes
    const listOk = await listExistingPermissions();
    if (!listOk) {
      console.log('❌ Listagem de permissões falhou');
      process.exit(1);
    }

    console.log('');
    console.log('🎉 Banco de dados funcionando perfeitamente!');
    console.log('✅ Conexão, inserção e consulta estão OK');
    console.log('🔗 Pronto para desenvolvimento');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);