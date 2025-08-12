# 🚀 Nexus ERP

**Sistema ERP completo para gestão empresarial**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [API](#-api)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **Nexus ERP** é um sistema completo de gestão empresarial desenvolvido com tecnologias modernas, oferecendo uma solução robusta e escalável para empresas de todos os portes.

### ✨ Características Principais

- **Interface Moderna**: Design responsivo e intuitivo
- **Módulos Integrados**: CRM, Financeiro, Projetos, Relatórios
- **Sistema de Permissões**: Controle granular de acesso
- **Integrações**: Conectividade com serviços externos
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Performance**: Otimizado para alta performance

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral dos principais indicadores
- Gráficos e métricas em tempo real
- Acesso rápido às funcionalidades

### 👥 CRM (Customer Relationship Management)
- **Leads**: Gestão de prospects e oportunidades
- **Clientes**: Cadastro e histórico completo
- **Negócios**: Pipeline de vendas e acompanhamento
- **Atividades**: Log de interações e tarefas
- **Propostas**: Criação e gestão de propostas comerciais

### 💰 Financeiro
- **Contas a Receber**: Gestão de faturas e recebimentos
- **Contas a Pagar**: Controle de despesas e fornecedores
- **Movimentações**: Registro de transações bancárias
- **Relatórios**: DRE, fluxo de caixa e análises
- **Centro de Custos**: Controle de custos por departamento

### 📋 Projetos
- **Gestão de Projetos**: Planejamento e execução
- **Tarefas**: Controle de atividades e prazos
- **Timesheet**: Registro de horas trabalhadas
- **Contratos**: Gestão de contratos e serviços

### 📈 Relatórios
- **DRE**: Demonstrativo de Resultados
- **Análises**: Relatórios customizáveis
- **Exportação**: Dados em múltiplos formatos

### ⚙️ Configurações
- **Usuários**: Gestão de usuários e permissões
- **Integrações**: Configuração de serviços externos
- **Empresa**: Dados da organização
- **Sistema**: Configurações gerais

## 🛠 Tecnologias

### Frontend
- **[Next.js 14](https://nextjs.org/)**: Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utilitário
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones
- **[React Hook Form](https://react-hook-form.com/)**: Gerenciamento de formulários

### Backend (Planejado)
- **[Node.js](https://nodejs.org/)**: Runtime JavaScript
- **[Express.js](https://expressjs.com/)**: Framework web
- **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados
- **[Prisma](https://www.prisma.io/)**: ORM
- **[JWT](https://jwt.io/)**: Autenticação

### Infraestrutura
- **[Docker](https://www.docker.com/)**: Containerização
- **[AWS](https://aws.amazon.com/)**: Cloud computing
- **[Vercel](https://vercel.com/)**: Deploy e hosting

## 📁 Estrutura do Projeto

```
nexus/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── crm/              # Módulo CRM
│   │   ├── financeiro/       # Módulo Financeiro
│   │   ├── projetos/         # Módulo Projetos
│   │   ├── relatorios/       # Módulo Relatórios
│   │   ├── settings/         # Configurações
│   │   ├── perfil/           # Perfil do usuário
│   │   └── layout.tsx        # Layout principal
│   ├── components/           # Componentes React
│   │   ├── layout/          # Componentes de layout
│   │   ├── ui/              # Componentes de interface
│   │   └── settings/        # Componentes de configuração
│   ├── lib/                 # Utilitários e configurações
│   │   ├── authz.ts         # Autorização
│   │   ├── session.ts       # Gestão de sessão
│   │   ├── utils.ts         # Funções utilitárias
│   │   ├── constants.ts     # Constantes do sistema
│   │   └── config.ts        # Configurações
│   ├── types/               # Definições TypeScript
│   │   └── database.ts      # Tipos do banco de dados
│   └── hooks/               # Hooks personalizados
│       └── useApi.ts        # Hook para APIs
├── public/                  # Arquivos estáticos
├── scripts/                 # Scripts de automação
└── docs/                    # Documentação
```

## 🚀 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/nexus-erp.git
   cd nexus-erp
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse o sistema**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Aplicação
NEXT_PUBLIC_APP_NAME=Nexus ERP
NEXT_PUBLIC_APP_VERSION=1.0.0

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/nexus

# Autenticação
NEXUS_DEV_ROLE=admin
JWT_SECRET=your-secret-key

# Integrações
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Storage
S3_BUCKET=nexus-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Monitoramento
SENTRY_DSN=your-sentry-dsn
GA_TRACKING_ID=your-ga-id
```

### Configurações por Ambiente

O sistema suporta diferentes configurações para:

- **Development**: Configurações para desenvolvimento local
- **Staging**: Configurações para ambiente de testes
- **Production**: Configurações para produção

## 🛠 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript

# Scaffolding
npm run scaffold     # Gera estrutura inicial do sistema
```

### Padrões de Código

- **TypeScript**: Uso obrigatório para tipagem
- **ESLint**: Linting de código
- **Prettier**: Formatação automática
- **Conventional Commits**: Padrão de commits

### Estrutura de Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório**
   ```bash
   vercel --prod
   ```

2. **Configure as variáveis de ambiente**
   - Acesse o dashboard do Vercel
   - Configure as variáveis em Settings > Environment Variables

### Docker

1. **Build da imagem**
   ```bash
   docker build -t nexus-erp .
   ```

2. **Execute o container**
   ```bash
   docker run -p 3000:3000 nexus-erp
   ```

### AWS

1. **Deploy no ECS**
   ```bash
   aws ecs create-service --cluster nexus --service-name nexus-erp
   ```

2. **Configure o Load Balancer**
   ```bash
   aws elbv2 create-target-group --name nexus-tg --protocol HTTP --port 3000
   ```

## 📡 API

### Endpoints Principais

```
GET    /api/dashboard          # Dados do dashboard
GET    /api/crm/leads          # Lista de leads
POST   /api/crm/leads          # Criar lead
GET    /api/financeiro/invoices # Lista de faturas
POST   /api/financeiro/invoices # Criar fatura
GET    /api/projetos           # Lista de projetos
POST   /api/projetos           # Criar projeto
```

### Autenticação

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "role": "admin"
  }
}
```

### Headers Necessários

```bash
Authorization: Bearer <token>
Content-Type: application/json
```

## 🤝 Contribuição

1. **Fork o projeto**
2. **Crie uma branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit suas mudanças** (`git commit -m 'Add some AmazingFeature'`)
4. **Push para a branch** (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Mantenha commits pequenos e focados

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@nexus.com
- **Documentação**: [docs.nexus.com](https://docs.nexus.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/nexus-erp/issues)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela excelente framework
- [Tailwind CSS](https://tailwindcss.com/) pelo sistema de design
- [Lucide](https://lucide.dev/) pelos ícones
- Comunidade open source

---

**Desenvolvido com ❤️ pela equipe Nexus Tech**
