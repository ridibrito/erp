# Migration CRM - Pipelines e Negócios

## 🎯 Objetivo

Esta migration cria as tabelas necessárias para o módulo CRM:
- `crm_pipelines` - Pipelines de vendas
- `crm_pipeline_stages` - Etapas dos pipelines
- `crm_accounts` - Empresas/Contas
- `crm_contacts` - Contatos
- `crm_negocios` - Negócios/Oportunidades

## 📋 Como Executar

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `005_crm_pipelines_negocios.sql`
6. Cole no editor e clique em **Run**

### Opção 2: Linha de Comando (Supabase CLI)

```bash
# Se você tem o Supabase CLI instalado
supabase db push

# Ou execute o arquivo diretamente
psql $DATABASE_URL < supabase/migrations/005_crm_pipelines_negocios.sql
```

### Opção 3: Script Node.js

```bash
# Certifique-se de que as variáveis de ambiente estão configuradas
node scripts/apply-crm-migration.mjs
```

## ✅ Verificação

Após executar a migration, você pode verificar se as tabelas foram criadas:

```sql
-- No SQL Editor do Supabase
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'crm_%';
```

Você deve ver:
- `crm_pipelines`
- `crm_pipeline_stages`
- `crm_accounts`
- `crm_contacts`
- `crm_negocios`

## 🔐 Segurança

As tabelas já vêm com:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso por organização
- ✅ Índices para performance

## 📝 Próximos Passos

Após executar a migration, você pode:

1. Criar um pipeline inicial
2. Adicionar etapas ao pipeline
3. Cadastrar empresas e contatos
4. Criar negócios

## ❗ Importante

- Esta migration é **idempotente** - pode ser executada várias vezes sem problemas
- Usa `CREATE TABLE IF NOT EXISTS` e `CREATE INDEX IF NOT EXISTS`
- As políticas RLS garantem que cada organização vê apenas seus próprios dados

