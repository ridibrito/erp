const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createCRMTables() {
  console.log('🔄 Criando tabelas CRM...');
  
  try {
    // 1. Criar tabela crm_accounts (empresas)
    console.log('🏢 Criando tabela crm_accounts...');
    const { error: accountsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS crm_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          fantasy_name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          document VARCHAR(20),
          document_type VARCHAR(10) CHECK (document_type IN ('cnpj')),
          address JSONB,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (accountsError && !accountsError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela crm_accounts:', accountsError);
    } else {
      console.log('✅ Tabela crm_accounts criada!');
    }

    // 2. Criar tabela crm_contacts (contatos)
    console.log('📞 Criando tabela crm_contacts...');
    const { error: contactsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS crm_contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          document VARCHAR(20),
          document_type VARCHAR(10) CHECK (document_type IN ('cpf', 'cnpj')),
          position VARCHAR(255),
          account_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
          address JSONB,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (contactsError && !contactsError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela crm_contacts:', contactsError);
    } else {
      console.log('✅ Tabela crm_contacts criada!');
    }

    // 3. Criar índices para performance
    console.log('📊 Criando índices...');
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Índices para crm_accounts
        CREATE INDEX IF NOT EXISTS idx_crm_accounts_org_id ON crm_accounts(org_id);
        CREATE INDEX IF NOT EXISTS idx_crm_accounts_email ON crm_accounts(email);
        CREATE INDEX IF NOT EXISTS idx_crm_accounts_document ON crm_accounts(document);
        CREATE INDEX IF NOT EXISTS idx_crm_accounts_status ON crm_accounts(status);
        
        -- Índices para crm_contacts
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_id ON crm_contacts(org_id);
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_account_id ON crm_contacts(account_id);
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
      `
    });
    
    if (indexesError && !indexesError.message.includes('already exists')) {
      console.error('❌ Erro ao criar índices:', indexesError);
    } else {
      console.log('✅ Índices criados!');
    }

    // 4. Habilitar RLS (Row Level Security)
    console.log('🔒 Habilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Habilitar RLS nas tabelas
        ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS para crm_accounts
        CREATE POLICY IF NOT EXISTS "Users can view accounts in their org" ON crm_accounts
          FOR SELECT USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can insert accounts in their org" ON crm_accounts
          FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can update accounts in their org" ON crm_accounts
          FOR UPDATE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can delete accounts in their org" ON crm_accounts
          FOR DELETE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        -- Políticas RLS para crm_contacts
        CREATE POLICY IF NOT EXISTS "Users can view contacts in their org" ON crm_contacts
          FOR SELECT USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can insert contacts in their org" ON crm_contacts
          FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can update contacts in their org" ON crm_contacts
          FOR UPDATE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
        
        CREATE POLICY IF NOT EXISTS "Users can delete contacts in their org" ON crm_contacts
          FOR DELETE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
      `
    });
    
    if (rlsError && !rlsError.message.includes('already exists')) {
      console.error('❌ Erro ao configurar RLS:', rlsError);
    } else {
      console.log('✅ RLS configurado!');
    }

    // 5. Criar triggers para updated_at
    console.log('⚡ Criando triggers...');
    const { error: triggersError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Função para atualizar updated_at (caso não exista)
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Triggers para updated_at
        DROP TRIGGER IF EXISTS update_crm_accounts_updated_at ON crm_accounts;
        CREATE TRIGGER update_crm_accounts_updated_at 
          BEFORE UPDATE ON crm_accounts 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_crm_contacts_updated_at ON crm_contacts;
        CREATE TRIGGER update_crm_contacts_updated_at 
          BEFORE UPDATE ON crm_contacts 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });
    
    if (triggersError && !triggersError.message.includes('already exists')) {
      console.error('❌ Erro ao criar triggers:', triggersError);
    } else {
      console.log('✅ Triggers criados!');
    }

    console.log('\n🎉 Tabelas CRM criadas com sucesso!');
    
    // 6. Testar inserção de dados
    console.log('\n🧪 Testando inserção de dados...');
    
    const { data: testAccount, error: testAccountError } = await supabase
      .from('crm_accounts')
      .insert({
        org_id: '00000000-0000-0000-0000-000000000001', // ID de teste
        name: 'Empresa Teste Ltda',
        fantasy_name: 'Teste Soluções',
        email: 'contato@teste.com',
        phone: '(11) 99999-9999',
        document: '12345678000195',
        document_type: 'cnpj',
        address: {
          street: 'Rua Teste',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234-567'
        },
        status: 'active'
      })
      .select()
      .single();

    if (testAccountError) {
      console.error('❌ Erro ao testar inserção de empresa:', testAccountError.message);
    } else {
      console.log('✅ Teste de inserção de empresa bem-sucedido!');
      
      // Limpar dados de teste
      await supabase
        .from('crm_accounts')
        .delete()
        .eq('id', testAccount.id);
      
      console.log('🧹 Dados de teste removidos.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createCRMTables();

