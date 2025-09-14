'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'Erro ao fazer login');
        return;
      }

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Erro inesperado ao fazer login');
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
          
          <p className="text-xl text-blue-100 text-center mb-8 max-w-md">
            Gerencie sua empresa de forma inteligente com nossa plataforma completa de gestão empresarial.
          </p>
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span className="text-blue-100">Relatórios em tempo real</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
              <span className="text-blue-100">Segurança de dados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <span className="text-blue-100">Interface intuitiva</span>
            </div>
          </div>
        </div>
        {/* Decoração de fundo */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="custom" width={200} height={200} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
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
            
            <Button
              type="submit"
              className="w-full h-12 text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#101828' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <a
                href="/register"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: '#101828' }}
              >
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}