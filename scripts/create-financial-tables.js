const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFinancialTables() {
  try {
    console.log('💰 Criando estrutura para integração bancária e NFS-e...\n');

    // 1. Tabela de bancos integrados
    console.log('🏦 Criando tabela banks...');
    const createBanksSQL = `
      CREATE TABLE IF NOT EXISTS banks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        api_endpoint VARCHAR(500),
        api_key TEXT,
        api_secret TEXT,
        webhook_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: banksError } = await supabase.rpc('exec_sql', {
      sql_query: createBanksSQL
    });

    if (banksError) {
      console.log(`❌ Erro ao criar banks: ${banksError.message}`);
    } else {
      console.log('✅ Tabela banks criada com sucesso');
    }

    // 2. Tabela de contas bancárias
    console.log('\n💳 Criando tabela bank_accounts...');
    const createBankAccountsSQL = `
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
        account_number VARCHAR(50) NOT NULL,
        agency VARCHAR(20) NOT NULL,
        account_type VARCHAR(20) NOT NULL, -- 'checking', 'savings', 'business'
        holder_name VARCHAR(255) NOT NULL,
        holder_document VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_primary BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: bankAccountsError } = await supabase.rpc('exec_sql', {
      sql_query: createBankAccountsSQL
    });

    if (bankAccountsError) {
      console.log(`❌ Erro ao criar bank_accounts: ${bankAccountsError.message}`);
    } else {
      console.log('✅ Tabela bank_accounts criada com sucesso');
    }

    // 3. Tabela de cobranças
    console.log('\n📋 Criando tabela charges...');
    const createChargesSQL = `
      CREATE TABLE IF NOT EXISTS charges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
        customer_id UUID, -- Referência para cliente (tabela futura)
        customer_name VARCHAR(255) NOT NULL,
        customer_document VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        amount DECIMAL(15,2) NOT NULL,
        due_date DATE NOT NULL,
        description TEXT,
        reference_id VARCHAR(100), -- ID de referência externa
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'paid', 'cancelled', 'overdue'
        payment_method VARCHAR(50), -- 'pix', 'boleto', 'credit_card'
        payment_date TIMESTAMP WITH TIME ZONE,
        bank_transaction_id VARCHAR(100),
        nfse_id UUID, -- Referência para NFS-e
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: chargesError } = await supabase.rpc('exec_sql', {
      sql_query: createChargesSQL
    });

    if (chargesError) {
      console.log(`❌ Erro ao criar charges: ${chargesError.message}`);
    } else {
      console.log('✅ Tabela charges criada com sucesso');
    }

    // 4. Tabela de regras de cobrança
    console.log('\n📧 Criando tabela collection_rules...');
    const createCollectionRulesSQL = `
      CREATE TABLE IF NOT EXISTS collection_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_days INTEGER NOT NULL, -- Dias antes do vencimento
        trigger_type VARCHAR(20) NOT NULL, -- 'before_due', 'after_due', 'on_due'
        actions JSONB NOT NULL, -- Array de ações: email, whatsapp, sms
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: collectionRulesError } = await supabase.rpc('exec_sql', {
      sql_query: createCollectionRulesSQL
    });

    if (collectionRulesError) {
      console.log(`❌ Erro ao criar collection_rules: ${collectionRulesError.message}`);
    } else {
      console.log('✅ Tabela collection_rules criada com sucesso');
    }

    // 5. Tabela de histórico de cobrança
    console.log('\n📝 Criando tabela collection_history...');
    const createCollectionHistorySQL = `
      CREATE TABLE IF NOT EXISTS collection_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        charge_id UUID NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
        collection_rule_id UUID REFERENCES collection_rules(id) ON DELETE SET NULL,
        action_type VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'sms', 'call'
        action_data JSONB NOT NULL, -- Dados da ação executada
        status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'opened', 'clicked'
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivered_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: collectionHistoryError } = await supabase.rpc('exec_sql', {
      sql_query: createCollectionHistorySQL
    });

    if (collectionHistoryError) {
      console.log(`❌ Erro ao criar collection_history: ${collectionHistoryError.message}`);
    } else {
      console.log('✅ Tabela collection_history criada com sucesso');
    }

    // 6. Tabela de NFS-e
    console.log('\n🧾 Criando tabela nfse...');
    const createNfseSQL = `
      CREATE TABLE IF NOT EXISTS nfse (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        charge_id UUID REFERENCES charges(id) ON DELETE SET NULL,
        number VARCHAR(50) NOT NULL,
        series VARCHAR(10) NOT NULL,
        issue_date DATE NOT NULL,
        service_date DATE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_document VARCHAR(20) NOT NULL,
        customer_address JSONB NOT NULL,
        service_description TEXT NOT NULL,
        service_code VARCHAR(20),
        quantity DECIMAL(10,3) DEFAULT 1,
        unit_value DECIMAL(15,2) NOT NULL,
        total_value DECIMAL(15,2) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_value DECIMAL(15,2) DEFAULT 0,
        net_value DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'issued', 'cancelled'
        nfse_code VARCHAR(100), -- Código da NFS-e no sistema municipal
        verification_code VARCHAR(100), -- Código de verificação
        xml_content TEXT, -- XML da NFS-e
        pdf_url VARCHAR(500), -- URL do PDF
        issued_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        cancellation_reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: nfseError } = await supabase.rpc('exec_sql', {
      sql_query: createNfseSQL
    });

    if (nfseError) {
      console.log(`❌ Erro ao criar nfse: ${nfseError.message}`);
    } else {
      console.log('✅ Tabela nfse criada com sucesso');
    }

    // 7. Tabela de configurações de NFS-e
    console.log('\n⚙️ Criando tabela nfse_settings...');
    const createNfseSettingsSQL = `
      CREATE TABLE IF NOT EXISTS nfse_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        city_code VARCHAR(10) NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        provider VARCHAR(100) NOT NULL, -- 'ginfes', 'dsf', 'betha', etc.
        api_endpoint VARCHAR(500),
        api_key TEXT,
        certificate_path VARCHAR(500),
        certificate_password TEXT,
        environment VARCHAR(20) DEFAULT 'production', -- 'development', 'production'
        is_active BOOLEAN DEFAULT true,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: nfseSettingsError } = await supabase.rpc('exec_sql', {
      sql_query: createNfseSettingsSQL
    });

    if (nfseSettingsError) {
      console.log(`❌ Erro ao criar nfse_settings: ${nfseSettingsError.message}`);
    } else {
      console.log('✅ Tabela nfse_settings criada com sucesso');
    }

    // 8. Criar índices para performance
    console.log('\n📊 Criando índices...');
    const createIndexesSQL = `
      -- Índices para banks
      CREATE INDEX IF NOT EXISTS idx_banks_code ON banks(code);
      CREATE INDEX IF NOT EXISTS idx_banks_active ON banks(is_active);
      
      -- Índices para bank_accounts
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON bank_accounts(organization_id);
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_id ON bank_accounts(bank_id);
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_primary ON bank_accounts(is_primary);
      
      -- Índices para charges
      CREATE INDEX IF NOT EXISTS idx_charges_org_id ON charges(organization_id);
      CREATE INDEX IF NOT EXISTS idx_charges_bank_account_id ON charges(bank_account_id);
      CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(status);
      CREATE INDEX IF NOT EXISTS idx_charges_due_date ON charges(due_date);
      CREATE INDEX IF NOT EXISTS idx_charges_customer_document ON charges(customer_document);
      CREATE INDEX IF NOT EXISTS idx_charges_reference_id ON charges(reference_id);
      
      -- Índices para collection_rules
      CREATE INDEX IF NOT EXISTS idx_collection_rules_org_id ON collection_rules(organization_id);
      CREATE INDEX IF NOT EXISTS idx_collection_rules_active ON collection_rules(is_active);
      
      -- Índices para collection_history
      CREATE INDEX IF NOT EXISTS idx_collection_history_charge_id ON collection_history(charge_id);
      CREATE INDEX IF NOT EXISTS idx_collection_history_sent_at ON collection_history(sent_at);
      
      -- Índices para nfse
      CREATE INDEX IF NOT EXISTS idx_nfse_org_id ON nfse(organization_id);
      CREATE INDEX IF NOT EXISTS idx_nfse_charge_id ON nfse(charge_id);
      CREATE INDEX IF NOT EXISTS idx_nfse_number ON nfse(number);
      CREATE INDEX IF NOT EXISTS idx_nfse_issue_date ON nfse(issue_date);
      CREATE INDEX IF NOT EXISTS idx_nfse_status ON nfse(status);
      CREATE INDEX IF NOT EXISTS idx_nfse_customer_document ON nfse(customer_document);
      
      -- Índices para nfse_settings
      CREATE INDEX IF NOT EXISTS idx_nfse_settings_org_id ON nfse_settings(organization_id);
      CREATE INDEX IF NOT EXISTS idx_nfse_settings_city_code ON nfse_settings(city_code);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: createIndexesSQL
    });

    if (indexError) {
      console.log(`❌ Erro ao criar índices: ${indexError.message}`);
    } else {
      console.log('✅ Índices criados com sucesso');
    }

    // 9. Criar triggers para updated_at
    console.log('\n⚡ Criando triggers...');
    const createTriggersSQL = `
      -- Triggers para updated_at
      DROP TRIGGER IF EXISTS update_banks_updated_at ON banks;
      CREATE TRIGGER update_banks_updated_at 
        BEFORE UPDATE ON banks 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
      CREATE TRIGGER update_bank_accounts_updated_at 
        BEFORE UPDATE ON bank_accounts 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_charges_updated_at ON charges;
      CREATE TRIGGER update_charges_updated_at 
        BEFORE UPDATE ON charges 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_collection_rules_updated_at ON collection_rules;
      CREATE TRIGGER update_collection_rules_updated_at 
        BEFORE UPDATE ON collection_rules 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_nfse_updated_at ON nfse;
      CREATE TRIGGER update_nfse_updated_at 
        BEFORE UPDATE ON nfse 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_nfse_settings_updated_at ON nfse_settings;
      CREATE TRIGGER update_nfse_settings_updated_at 
        BEFORE UPDATE ON nfse_settings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: createTriggersSQL
    });

    if (triggerError) {
      console.log(`❌ Erro ao criar triggers: ${triggerError.message}`);
    } else {
      console.log('✅ Triggers criados com sucesso');
    }

    // 10. Inserir dados iniciais
    console.log('\n📊 Inserindo dados iniciais...');
    
    // Inserir banco Inter
    const insertBanksSQL = `
      INSERT INTO banks (id, name, code, api_endpoint, is_active)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Banco Inter',
        '077',
        'https://cdpj.partners.bancointer.com.br',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    const { error: insertBanksError } = await supabase.rpc('exec_sql', {
      sql_query: insertBanksSQL
    });

    if (insertBanksError) {
      console.log(`❌ Erro ao inserir banco Inter: ${insertBanksError.message}`);
    } else {
      console.log('✅ Banco Inter inserido');
    }

    // Inserir regra de cobrança padrão
    const insertCollectionRuleSQL = `
      INSERT INTO collection_rules (organization_id, name, description, trigger_days, trigger_type, actions, is_active)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Cobrança Padrão',
        'Regra padrão de cobrança: email 3 dias antes, WhatsApp 1 dia antes',
        3,
        'before_due',
        '[
          {"type": "email", "template": "payment_reminder", "days_before": 3},
          {"type": "whatsapp", "template": "payment_reminder", "days_before": 1}
        ]',
        true
      )
      ON CONFLICT DO NOTHING;
    `;

    const { error: insertRuleError } = await supabase.rpc('exec_sql', {
      sql_query: insertCollectionRuleSQL
    });

    if (insertRuleError) {
      console.log(`❌ Erro ao inserir regra de cobrança: ${insertRuleError.message}`);
    } else {
      console.log('✅ Regra de cobrança padrão inserida');
    }

    // 11. Configurar permissões
    console.log('\n🔒 Configurando permissões...');
    const setupPermissionsSQL = `
      -- Habilitar RLS
      ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
      ALTER TABLE collection_rules ENABLE ROW LEVEL SECURITY;
      ALTER TABLE collection_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE nfse ENABLE ROW LEVEL SECURITY;
      ALTER TABLE nfse_settings ENABLE ROW LEVEL SECURITY;

      -- Políticas para service_role
      CREATE POLICY "Service Role Full Access" ON banks FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON bank_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON charges FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON collection_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON collection_history FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON nfse FOR ALL TO service_role USING (true) WITH CHECK (true);
      CREATE POLICY "Service Role Full Access" ON nfse_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

      -- Políticas para authenticated users
      CREATE POLICY "Users can view their organization data" ON bank_accounts FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));
      CREATE POLICY "Users can view their organization charges" ON charges FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));
      CREATE POLICY "Users can view their organization nfse" ON nfse FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

      -- Conceder permissões básicas
      GRANT SELECT ON banks TO anon, authenticated;
      GRANT ALL ON banks TO service_role;
      
      GRANT SELECT ON bank_accounts TO anon, authenticated;
      GRANT ALL ON bank_accounts TO service_role;
      
      GRANT SELECT ON charges TO anon, authenticated;
      GRANT ALL ON charges TO service_role;
      
      GRANT SELECT ON collection_rules TO anon, authenticated;
      GRANT ALL ON collection_rules TO service_role;
      
      GRANT SELECT ON collection_history TO anon, authenticated;
      GRANT ALL ON collection_history TO service_role;
      
      GRANT SELECT ON nfse TO anon, authenticated;
      GRANT ALL ON nfse TO service_role;
      
      GRANT SELECT ON nfse_settings TO anon, authenticated;
      GRANT ALL ON nfse_settings TO service_role;
    `;

    const { error: permissionsError } = await supabase.rpc('exec_sql', {
      sql_query: setupPermissionsSQL
    });

    if (permissionsError) {
      console.log(`❌ Erro ao configurar permissões: ${permissionsError.message}`);
    } else {
      console.log('✅ Permissões configuradas com sucesso');
    }

    console.log('\n🎉 Estrutura financeira criada com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('✅ banks - Bancos integrados');
    console.log('✅ bank_accounts - Contas bancárias');
    console.log('✅ charges - Cobranças');
    console.log('✅ collection_rules - Regras de cobrança');
    console.log('✅ collection_history - Histórico de cobrança');
    console.log('✅ nfse - Notas Fiscais de Serviço Eletrônicas');
    console.log('✅ nfse_settings - Configurações de NFS-e');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
createFinancialTables();
