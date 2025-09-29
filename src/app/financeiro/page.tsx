"use client";

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  DollarSign,
  Calendar,
  AlertCircle,
  FileText,
  Banknote,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceiroPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas finanças, cobranças e NFS-e</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
                  <p className="text-2xl font-bold">R$ 25.430,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Receitas do Mês</p>
                  <p className="text-2xl font-bold">R$ 45.200,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Despesas do Mês</p>
                  <p className="text-2xl font-bold">R$ 19.770,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Contas a Vencer</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulos Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cobranças - Nova funcionalidade */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <CreditCard className="h-5 w-5 mr-2" />
                Cobranças
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">NOVO</span>
              </CardTitle>
              <CardDescription>
                Integração bancária e cobrança automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gere cobranças via PIX/Boleto, regras automáticas e integração com Banco Inter.
              </p>
              <Link href="/financeiro/cobrancas">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Acessar Cobranças
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* NFS-e - Nova funcionalidade */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <FileText className="h-5 w-5 mr-2" />
                NFS-e
                <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">NOVO</span>
              </CardTitle>
              <CardDescription>
                Notas Fiscais de Serviço Eletrônicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Emissão automática de NFS-e após confirmação de pagamento.
              </p>
              <Link href="/financeiro/nfse">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Acessar NFS-e
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Contas a Receber
              </CardTitle>
              <CardDescription>
                Gerencie suas contas a receber e clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Controle de receitas, clientes e cobranças.
              </p>
              <Link href="/financeiro/receber">
                <Button className="w-full">
                  Acessar Contas a Receber
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                Contas a Pagar
              </CardTitle>
              <CardDescription>
                Gerencie suas contas a pagar e fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Controle de despesas, fornecedores e pagamentos programados.
              </p>
              <Link href="/financeiro/pagar">
                <Button className="w-full">
                  Acessar Contas a Pagar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Movimentação
              </CardTitle>
              <CardDescription>
                Visualize todas as movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Histórico completo de entradas e saídas.
              </p>
              <Link href="/financeiro/movimentacao">
                <Button className="w-full">
                  Acessar Movimentação
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Relatórios financeiros e análises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                DRE, fluxo de caixa e relatórios personalizados.
              </p>
              <Link href="/financeiro/relatorios">
                <Button className="w-full">
                  Acessar Relatórios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Integrações */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Integrações Financeiras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Banco Inter
                </CardTitle>
                <CardDescription>
                  Integração com Banco Inter para cobranças
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure sua conta PJ do Banco Inter para gerar cobranças automáticas.
                </p>
                <Button variant="outline" className="w-full">
                  Configurar Integração
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações
                </CardTitle>
                <CardDescription>
                  Configurações financeiras do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bancos, categorias, regras de cobrança e configurações gerais.
                </p>
                <Button variant="outline" className="w-full">
                  Acessar Configurações
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
