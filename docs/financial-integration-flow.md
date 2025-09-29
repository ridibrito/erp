# 💰 Fluxo de Integração Bancária e NFS-e

## 🏗️ Arquitetura do Sistema

### 📊 Estrutura de Tabelas

```
🏦 BANCO DE DADOS FINANCEIRO
├── banks                    # Bancos integrados (Inter, etc.)
├── bank_accounts           # Contas bancárias da empresa
├── charges                 # Cobranças geradas
├── collection_rules        # Regras de cobrança automática
├── collection_history      # Histórico de ações de cobrança
├── nfse                    # Notas Fiscais de Serviço Eletrônicas
└── nfse_settings          # Configurações de NFS-e por cidade
```

## 🔄 Fluxo Completo

### 1️⃣ **Geração de Cobrança**
```
Cliente/Serviço → Sistema ERP
├── Dados do cliente (nome, documento, email, telefone)
├── Valor da cobrança
├── Data de vencimento
├── Descrição do serviço
└── Conta bancária para recebimento
```

### 2️⃣ **Integração com Banco Inter**
```
Sistema ERP → API Banco Inter
├── Criar cobrança via PIX/Boleto
├── Obter link de pagamento
├── Configurar webhook para confirmação
└── Salvar transaction_id
```

### 3️⃣ **Regra de Cobrança Automática**
```
Sistema → Regras Configuradas
├── 3 dias antes: Email de lembrete
├── 1 dia antes: WhatsApp
├── No vencimento: Email urgente
└── Após vencimento: Cobrança extra
```

### 4️⃣ **Confirmação de Pagamento**
```
Banco Inter → Webhook → Sistema
├── Atualizar status da cobrança
├── Registrar data de pagamento
├── Salvar dados da transação
└── Trigger para NFS-e
```

### 5️⃣ **Emissão de NFS-e**
```
Pagamento Confirmado → NFS-e
├── Buscar dados da cobrança
├── Gerar XML da NFS-e
├── Enviar para prefeitura
├── Salvar código de verificação
└── Gerar PDF para cliente
```

## 📋 Detalhamento das Tabelas

### 🏦 **banks**
```sql
- id: UUID (PK)
- name: "Banco Inter"
- code: "077"
- api_endpoint: URL da API
- api_key: Chave de API
- api_secret: Segredo da API
- webhook_url: URL para receber confirmações
- is_active: boolean
- settings: JSON (configurações específicas)
```

### 💳 **bank_accounts**
```sql
- id: UUID (PK)
- organization_id: UUID (FK → organizations)
- bank_id: UUID (FK → banks)
- account_number: Número da conta
- agency: Agência
- account_type: "checking" | "savings" | "business"
- holder_name: Nome do titular
- holder_document: CPF/CNPJ do titular
- is_primary: boolean (conta principal)
```

### 📋 **charges**
```sql
- id: UUID (PK)
- organization_id: UUID (FK → organizations)
- bank_account_id: UUID (FK → bank_accounts)
- customer_name: Nome do cliente
- customer_document: CPF/CNPJ
- customer_email: Email
- customer_phone: Telefone
- amount: DECIMAL(15,2)
- due_date: DATE
- description: Descrição do serviço
- status: "pending" | "sent" | "paid" | "cancelled" | "overdue"
- payment_method: "pix" | "boleto" | "credit_card"
- payment_date: TIMESTAMP
- bank_transaction_id: ID da transação no banco
- nfse_id: UUID (FK → nfse)
```

### 📧 **collection_rules**
```sql
- id: UUID (PK)
- organization_id: UUID (FK → organizations)
- name: Nome da regra
- trigger_days: Dias antes/depois do vencimento
- trigger_type: "before_due" | "after_due" | "on_due"
- actions: JSON Array
  [
    {
      "type": "email",
      "template": "payment_reminder",
      "days_before": 3
    },
    {
      "type": "whatsapp",
      "template": "payment_reminder",
      "days_before": 1
    }
  ]
```

### 📝 **collection_history**
```sql
- id: UUID (PK)
- charge_id: UUID (FK → charges)
- collection_rule_id: UUID (FK → collection_rules)
- action_type: "email" | "whatsapp" | "sms" | "call"
- action_data: JSON (dados da ação)
- status: "sent" | "delivered" | "failed" | "opened" | "clicked"
- sent_at: TIMESTAMP
- delivered_at: TIMESTAMP
- error_message: TEXT
```

### 🧾 **nfse**
```sql
- id: UUID (PK)
- organization_id: UUID (FK → organizations)
- charge_id: UUID (FK → charges)
- number: Número da NFS-e
- series: Série
- issue_date: Data de emissão
- service_date: Data do serviço
- customer_name: Nome do cliente
- customer_document: CPF/CNPJ
- customer_address: JSON (endereço)
- service_description: Descrição do serviço
- service_code: Código do serviço (LC 116)
- quantity: Quantidade
- unit_value: Valor unitário
- total_value: Valor total
- tax_rate: Alíquota de imposto
- tax_value: Valor do imposto
- net_value: Valor líquido
- status: "draft" | "issued" | "cancelled"
- nfse_code: Código da NFS-e na prefeitura
- verification_code: Código de verificação
- xml_content: XML da NFS-e
- pdf_url: URL do PDF
```

### ⚙️ **nfse_settings**
```sql
- id: UUID (PK)
- organization_id: UUID (FK → organizations)
- city_code: Código da cidade (IBGE)
- city_name: Nome da cidade
- provider: "ginfes" | "dsf" | "betha" | "issnet"
- api_endpoint: URL da API da prefeitura
- api_key: Chave de API
- certificate_path: Caminho do certificado
- certificate_password: Senha do certificado
- environment: "development" | "production"
```

## 🔧 APIs Necessárias

### 🏦 **Banco Inter API**
- **Criar Cobrança**: `POST /cobranca/v2/cobranca`
- **Consultar Cobrança**: `GET /cobranca/v2/cobranca/{id}`
- **Webhook**: `POST /webhook` (receber confirmações)

### 🧾 **APIs de NFS-e**
- **GINFES**: API para cidades que usam GINFES
- **DSF**: API para cidades que usam DSF
- **Betha**: API para cidades que usam Betha
- **IssNet**: API para cidades que usam IssNet

### 📧 **APIs de Comunicação**
- **Email**: SendGrid, AWS SES, ou similar
- **WhatsApp**: WhatsApp Business API
- **SMS**: Twilio, AWS SNS, ou similar

## 🚀 Próximos Passos

1. **✅ Estrutura do banco criada**
2. **🔄 Implementar APIs de integração**
3. **📧 Configurar sistema de emails**
4. **📱 Integrar WhatsApp Business**
5. **🧾 Implementar emissão de NFS-e**
6. **🔔 Configurar webhooks**
7. **📊 Criar dashboard de cobranças**
8. **📈 Implementar relatórios**

## 💡 Benefícios

- **🤖 Automação completa** do processo de cobrança
- **📱 Múltiplos canais** de comunicação (email, WhatsApp, SMS)
- **🧾 NFS-e automática** após confirmação de pagamento
- **📊 Rastreamento completo** do histórico de cobrança
- **🔒 Segurança** com RLS e criptografia
- **📈 Escalabilidade** para múltiplas organizações
