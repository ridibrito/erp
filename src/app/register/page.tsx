'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { SignUpData } from '@/lib/auth-enhanced';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ChevronRight, ChevronLeft, Building2, User, Lock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    organizationName: '',
    cnpj: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [cnpjData, setCnpjData] = useState<any>(null);
  
  const { signUp, error, clearError } = useAuth();
  const router = useRouter();

  const steps = [
    { id: 1, title: 'Dados da Empresa', icon: Building2 },
    { id: 2, title: 'Seus Dados', icon: User },
    { id: 3, title: 'Segurança', icon: Lock }
  ];

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Validar dados da empresa
      if (!formData.organizationName) {
        errors.organizationName = 'Nome da empresa é obrigatório';
      } else if (formData.organizationName.length < 2) {
        errors.organizationName = 'Nome da empresa deve ter pelo menos 2 caracteres';
      }

      if (!formData.cnpj) {
        errors.cnpj = 'CNPJ é obrigatório';
      } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
        errors.cnpj = 'CNPJ deve ter 14 dígitos';
      }
    } else if (step === 2) {
      // Validar dados pessoais
      if (!formData.name) {
        errors.name = 'Nome é obrigatório';
      } else if (formData.name.length < 2) {
        errors.name = 'Nome deve ter pelo menos 2 caracteres';
      }

      if (!formData.email) {
        errors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email inválido';
      }

      if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
        errors.phone = 'Telefone deve estar no formato (11) 99999-9999';
      }
    } else if (step === 3) {
      // Validar segurança
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        errors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    // Se for a etapa 1, validar CNPJ com API
    if (currentStep === 1) {
      if (!formData.cnpj) {
        setValidationErrors({ cnpj: 'CNPJ é obrigatório' });
        return;
      }

      try {
        const { validateCNPJWithAPI } = await import('@/lib/cnpj-validator');
        const cnpjValidation = await validateCNPJWithAPI(formData.cnpj!);
        
        if (!cnpjValidation.isValid) {
          setValidationErrors({ cnpj: cnpjValidation.error || 'CNPJ inválido' });
          return;
        }
        
        setCnpjData(cnpjValidation.data);
        
        // Preencher automaticamente a razão social
        if (cnpjValidation.data?.razao_social) {
          setFormData(prev => ({
            ...prev,
            organizationName: cnpjValidation.data!.razao_social
          }));
        }
        
        // Limpar erros e mostrar sucesso
        setValidationErrors({});
        
        // Aguardar um pouco para mostrar o sucesso antes de avançar
        setTimeout(() => {
          if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
          }
        }, 1500);
        
        return;
      } catch (error) {
        setValidationErrors({ cnpj: 'Erro ao validar CNPJ' });
        return;
      }
    }

    // Para outras etapas, validar normalmente
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    if (!validateStep(3)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signUp(formData);
      
      if (error) {
        setValidationErrors({ general: error.message });
        setIsSubmitting(false);
        return;
      }
      
      // Usuário criado com sucesso, redirecionar para login
      console.log('Usuário criado com sucesso, redirecionando para login...');
      router.push(`/login?message=Conta criada com sucesso! Um email de confirmação foi enviado para ${formData.email}. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.`);
    } catch (error) {
      console.error('Erro no registro:', error);
      setValidationErrors({ general: 'Erro interno do servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({
      ...prev,
      cnpj: formatted
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="cnpj">CNPJ da Empresa</Label>
              <div className="flex space-x-2">
                <Input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  placeholder="00.000.000/0000-00"
                  className="mt-1 flex-1"
                  required
                />
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.cnpj || cnpjData}
                  className="mt-1"
                >
                  {cnpjData ? '✓ Validado' : 'Validar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                CNPJ será validado na Receita Federal
              </p>
              {validationErrors.cnpj && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.cnpj}</p>
              )}
            </div>

            {cnpjData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-green-800">CNPJ Validado com Sucesso!</h4>
                </div>
                <p className="text-sm text-green-700 mt-2">{cnpjData.razao_social}</p>
                <p className="text-xs text-green-600">{cnpjData.municipio} - {cnpjData.uf}</p>
                <p className="text-xs text-green-600 mt-1">Avançando para a próxima etapa...</p>
              </div>
            )}

            {cnpjData && (
              <div>
                <Label htmlFor="organizationName">Nome da Empresa</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Nome da sua empresa"
                  className="mt-1"
                  required
                  disabled={true}
                />
                <p className="mt-1 text-xs text-green-600">
                  ✓ Preenchido automaticamente com base no CNPJ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você será o administrador desta empresa
                </p>
                {validationErrors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.organizationName}</p>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                className="mt-1"
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="mt-1"
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className="mt-1"
                required
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleInputChange}
                placeholder="Digite a senha novamente"
                className="mt-1"
                required
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
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
                Crie sua conta
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Faça login
                </Link>
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
                      {steps[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription>
                      Etapa {currentStep} de {steps.length}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`w-2 h-2 rounded-full ${
                          step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                {validationErrors.general && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{validationErrors.general}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
                  {renderStepContent()}

                  <div className="flex justify-between pt-4">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lado direito - Imagem/Background */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Bem-vindo ao Cortus ERP</h3>
            <p className="text-lg opacity-90">
              Gerencie sua empresa de forma inteligente e eficiente
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}