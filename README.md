# 🏢 Cortus ERP

Sistema ERP completo para gestão empresarial com foco em empresas brasileiras.

## ✨ Características Principais

### 🏗️ **Arquitetura Moderna**
- **Next.js 15** com App Router para performance otimizada
- **TypeScript** para tipagem estática e melhor DX
- **Supabase** como backend completo (banco + auth + realtime)
- **Tailwind CSS** para design system consistente
- **Multi-tenancy** com isolamento de dados por empresa

### 🛡️ **Sistema de Segurança Robusto**
- **RBAC granular** com permissões por módulo/ação/recurso
- **Autenticação empresarial** com validação de CNPJ
- **Consulta à Receita Federal** para validação de empresas
- **Auditoria completa** de ações dos usuários
- **LGPD compliance** com gestão de consentimentos

### 🏢 **Foco Empresarial**
- **Validação de CNPJ** com consulta em tempo real
- **Cadastro empresarial** com dados da Receita Federal
- **Multi-tenancy** por empresa
- **Gestão de usuários** por organização
- **Relatórios empresariais** personalizados

## 🚀 **Como Usar**

### 1. **Acesso à Aplicação**
```
URL: http://localhost:3000
```

### 2. **Usuários de Teste Disponíveis**

#### 🏢 **Conta Empresarial (Admin)**
- **Email:** `admin@techsolutions.com`
- **Senha:** `TechSolutions2024!`
- **Empresa:** Tech Solutions LTDA
- **CNPJ:** 11.222.333/0001-81
- **Permissões:** Administrador completo

#### 👤 **Conta de Usuário (Manager)**
- **Email:** `joao@techsolutions.com`
- **Senha:** `JoaoSilva2024!`
- **Nome:** João Silva
- **Empresa:** Tech Solutions LTDA
- **Permissões:** Gestor de projetos e CRM

### 3. **Cadastro de Nova Empresa**

1. Acesse `/register`
2. Preencha os **dados pessoais**
3. Digite o **CNPJ da empresa**
4. Clique em **"Validar CNPJ"** para consultar a Receita Federal
5. Confirme os **dados da empresa** (preenchidos automaticamente)
6. Crie sua **senha de acesso**
7. Clique em **"Criar conta empresarial"**

## 🏗️ **Estrutura do Projeto**

```
src/
├── app/                    # Páginas da aplicação
│   ├── login/             # Página de login
│   ├── register/          # Página de cadastro empresarial
│   ├── dashboard/         # Dashboard principal
│   └── layout.tsx         # Layout global
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   └── layout/           # Componentes de layout
├── contexts/             # Contextos React
│   └── AuthContext.tsx   # Contexto de autenticação
├── lib/                  # Utilitários e configurações
│   ├── auth.ts          # Sistema de autenticação
│   ├── authz.ts         # Sistema de permissões
│   ├── config.ts        # Configurações da aplicação
│   ├── supabase.ts      # Cliente Supabase
│   └── cnpj-validator.ts # Validador de CNPJ
└── scripts/             # Scripts de configuração
    ├── create-enterprise-user.js
    └── create-test-user.js
```

## 🔧 **Configuração do Ambiente**

### 1. **Variáveis de Ambiente**
Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pnfpcytrpuvhjzrmtbwy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
NODE_ENV=development
CORTUS_DEV_ROLE=admin
CORTUS_DEV_USER_ID=dev-user
CORTUS_DEV_ORG_ID=dev-org
```

### 2. **Instalação de Dependências**
```bash
npm install
```

### 3. **Executar em Desenvolvimento**
```bash
npm run dev
```

## 🏢 **Módulos Disponíveis**

### 📊 **Dashboard**
- Visão geral da empresa
- Métricas principais
- Acesso rápido aos módulos

### 👥 **CRM**
- Gestão de leads
- Contas de clientes
- Oportunidades de negócio
- Pipeline de vendas

### 💰 **Financeiro**
- Contas a pagar/receber
- Faturas e notas fiscais
- Relatórios financeiros
- Controle de fluxo de caixa

### 📋 **Projetos**
- Gestão de projetos
- Controle de tarefas
- Times e recursos
- Cronogramas

### 📊 **Relatórios**
- Relatórios personalizados
- Dashboards executivos
- Análises de performance
- Exportação de dados

### ⚙️ **Configurações**
- Gestão de usuários
- Configurações da empresa
- Permissões e papéis
- Integrações

## 🛡️ **Sistema de Permissões**

### **Papéis Disponíveis**
- **Admin:** Acesso completo ao sistema
- **Manager:** Gestão de projetos e CRM
- **User:** Acesso básico aos módulos
- **Viewer:** Apenas visualização

### **Permissões por Módulo**
- `dashboard.view` - Visualizar dashboard
- `users.*` - Gestão de usuários
- `crm.*` - Módulo CRM completo
- `finance.*` - Módulo financeiro
- `projects.*` - Gestão de projetos
- `reports.view` - Visualizar relatórios
- `settings.*` - Configurações do sistema

## 🔍 **Validação de CNPJ**

O sistema integra com a **Receita Federal** para:
- ✅ Validar formato do CNPJ
- ✅ Verificar dígitos verificadores
- ✅ Consultar dados da empresa
- ✅ Preencher automaticamente informações
- ✅ Verificar situação cadastral

## 📱 **Responsividade**

- **Desktop:** Interface completa
- **Tablet:** Layout adaptado
- **Mobile:** Interface otimizada

## 🎨 **Design System**

- **Cores:** Paleta empresarial profissional
- **Tipografia:** Inter font para melhor legibilidade
- **Componentes:** Baseados em shadcn/ui
- **Tema:** Light mode com alto contraste

## 🚀 **Próximos Passos**

1. **Implementar módulos específicos** (CRM, Financeiro, etc.)
2. **Adicionar relatórios avançados**
3. **Implementar notificações em tempo real**
4. **Adicionar integrações com APIs externas**
5. **Implementar backup automático**
6. **Adicionar testes automatizados**

## 📞 **Suporte**

Para dúvidas ou suporte técnico:
- **Email:** suporte@cortus.com
- **Documentação:** [docs.cortus.com](https://docs.cortus.com)
- **GitHub:** [github.com/cortus/erp](https://github.com/cortus/erp)

---

**Cortus ERP** - Transformando a gestão empresarial brasileira 🚀