'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { SignInData } from '@/lib/auth-enhanced';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const { signIn, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  // Verificar se há mensagem de sucesso do cadastro
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      const { error } = await signIn(formData);
      
      if (!error) {
        console.log('Login bem-sucedido, redirecionando para:', redirectTo);
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex">
        {/* Lado esquerdo - Formulário */}
        <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Logo size="xxl" className="mx-auto" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Entre na sua conta
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Crie uma nova conta
                </Link>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <Alert>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Sua senha"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                          Lembrar de mim
                        </Label>
                      </div>

                      <div className="text-sm">
                        <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                          Esqueceu a senha?
                        </Link>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lado direito - Imagem/Background */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Bem-vindo de volta</h3>
            <p className="text-lg opacity-90">
              Acesse sua conta e continue gerenciando sua empresa
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}