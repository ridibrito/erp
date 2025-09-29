// Validador de CNPJ e integração com API Brasil
export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
  situacao: string;
  data_situacao: string;
  capital_social: string;
  porte: string;
  natureza_juridica: string;
  abertura: string;
}

export interface CNPJValidationResult {
  isValid: boolean;
  data?: CNPJData;
  error?: string;
}

// Função para validar formato do CNPJ
export function validateCNPJFormat(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false;
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let weight = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleanCNPJ[12]) !== firstDigit) {
    return false;
  }
  
  // Segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(cleanCNPJ[13]) === secondDigit;
}

// Função para formatar CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length <= 14) {
    return cleanCNPJ
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return cnpj;
}

// Função para consultar CNPJ na API Brasil
export async function validateCNPJWithAPI(cnpj: string): Promise<CNPJValidationResult> {
  try {
    // Primeiro valida o formato
    if (!validateCNPJFormat(cnpj)) {
      return {
        isValid: false,
        error: 'CNPJ inválido'
      };
    }
    
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Consulta a API Brasil
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          isValid: false,
          error: 'CNPJ não encontrado na Receita Federal'
        };
      }
      
      return {
        isValid: false,
        error: 'Erro ao consultar CNPJ na Receita Federal'
      };
    }
    
    const data = await response.json();
    
          // Verifica se a empresa está ativa (algumas APIs não retornam situacao)
          if (data.situacao && data.situacao !== 'ATIVA' && data.situacao !== 'undefined') {
            return {
              isValid: false,
              error: `Empresa com situação: ${data.situacao}`
            };
          }
    
    return {
      isValid: true,
      data: {
        cnpj: cleanCNPJ,
        razao_social: data.razao_social || '',
        nome_fantasia: data.nome_fantasia || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
        telefone: data.telefone || '',
        email: data.email || '',
        situacao: data.situacao || 'ATIVA',
        data_situacao: data.data_situacao || '',
        capital_social: data.capital_social || '',
        porte: data.porte || '',
        natureza_juridica: data.natureza_juridica || '',
        abertura: data.abertura || ''
      }
    };
  } catch (error) {
    console.error('Erro ao validar CNPJ:', error);
    return {
      isValid: false,
      error: 'Erro interno ao validar CNPJ'
    };
  }
}