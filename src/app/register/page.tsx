'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Building2, Search, CheckCircle, XCircle, User, Lock, Building } from 'lucide-react';
import { validateCNPJ, consultCNPJ, formatCNPJ, type CNPJData } from '@/lib/cnpj-validator';
import { Logo } from '@/components/ui/Logo';

export default function RegisterPage() {
  // Dados pessoais
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Dados empresariais
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null);
  const [cnpjValidating, setCnpjValidating] = useState(false);
  const [cnpjValid, setCnpjValid] = useState<boolean | null>(null);
  
  // Estados gerais
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  // Função para validar CNPJ usando API Brasil
  const handleCNPJValidation = async () => {
    if (!cnpj.trim()) return;
    
    setCnpjValidating(true);
    setCnpjValid(null);
    setCnpjData(null);
    setError('');
    
    try {
      // Primeiro valida o formato
      const validation = validateCNPJ(cnpj);
      if (!validation.isValid) {
        setCnpjValid(false);
        setError(validation.errors.join(', '));
        return;
      }
      
      // Consulta na API Brasil
      const data = await consultCNPJ(cnpj);
      if (data) {
        setCnpjData(data);
        setCnpjValid(true);
        setCompanyName(data.razaoSocial);
        setError('');
      } else {
        setCnpjValid(false);
        setError('CNPJ não encontrado');
      }
    } catch (err) {
      setCnpjValid(false);
      setError(err instanceof Error ? err.message : 'Erro ao validar CNPJ');
    } finally {
      setCnpjValidating(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!cnpjValid || !cnpjData) {
      setError('CNPJ deve ser validado antes de continuar');
      return;
    }

    if (!companyName.trim()) {
      setError('Nome da empresa é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        setError(error.message || 'Erro ao criar conta');
        return;
      }

      // Redirecionar para login
      router.push('/login?message=Conta criada com sucesso! Verifique seu email.');
    } catch (err) {
      setError('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Apresentação da Empresa */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Comece sua jornada
          </h1>
          <p className="text-xl text-blue-100 text-center mb-8 max-w-md">
            Transforme a gestão da sua empresa com nossa plataforma completa e intuitiva.
          </p>
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🏢</span>
              </div>
              <span className="text-blue-100">Gestão empresarial completa</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <span className="text-blue-100">Crescimento sustentável</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤝</span>
              </div>
              <span className="text-blue-100">Suporte especializado</span>
            </div>
          </div>
        </div>
        {/* Decoração de fundo */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Lado Direito - Formulário de Registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="custom" width={200} height={200} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Criar conta empresarial
            </h2>
            <p className="text-gray-600">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className=" p-6 rounded-xl  bspace-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 text-accent mr-2" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nome completo *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Empresariais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 text-accent mr-2" />
                  Dados da Empresa
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                      CNPJ *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.replace(
                            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                            '$1.$2.$3/$4-$5'
                          );
                          setCnpj(formatted);
                          setCnpjValid(null);
                          setCnpjData(null);
                        }}
                        required
                        disabled={loading}
                        className="flex-1 h-12 border-gray-300 focus:border-accent focus:ring-accent"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCNPJValidation}
                        disabled={loading || cnpjValidating || !cnpj.trim()}
                        className="px-4 h-12 border-gray-300 hover:border-accent hover:text-accent"
                      >
                        {cnpjValidating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Status da validação do CNPJ */}
                    {cnpjValid === true && cnpjData && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>CNPJ válido - {cnpjData.razaoSocial}</span>
                      </div>
                    )}
                    
                    {cnpjValid === false && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        <span>CNPJ inválido ou não encontrado</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      Nome da Empresa *
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Razão social da empresa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      disabled={loading || cnpjValid === true}
                      className="h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    />
                    {cnpjValid === true && (
                      <p className="text-xs text-gray-500">
                        Nome preenchido automaticamente pela API Brasil
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados de Acesso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lock className="w-5 h-5 text-accent mr-2" />
                  Dados de Acesso
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12 border-gray-300 focus:border-accent focus:ring-accent pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmar senha *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#101828' }}
              disabled={loading || !cnpjValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta empresarial'
              )}
            </Button>
            
            {!cnpjValid && (
              <p className="text-sm text-amber-600 text-center">
                ⚠️ Valide o CNPJ antes de criar a conta
              </p>
            )}
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <a
                href="/login"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: '#101828' }}
              >
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
