-- Inserir contatos de teste para verificar o select
-- Substitua o org_id pelo ID da sua organização

-- Contato 1 - Pessoa física
INSERT INTO crm_contacts (
    id,
    type,
    name,
    first_name,
    last_name,
    email,
    phone,
    document,
    document_type,
    position,
    status,
    org_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'person',
    'João Silva',
    'João',
    'Silva',
    'joao.silva@email.com',
    '(11) 99999-9999',
    '12345678901',
    'cpf',
    'Gerente de Vendas',
    'active',
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0', -- Substitua pelo seu org_id
    NOW(),
    NOW()
);

-- Contato 2 - Pessoa física sem nome completo
INSERT INTO crm_contacts (
    id,
    type,
    first_name,
    last_name,
    email,
    phone,
    document,
    document_type,
    status,
    org_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'person',
    'Maria',
    'Santos',
    'maria.santos@email.com',
    '(11) 88888-8888',
    '98765432100',
    'cpf',
    'active',
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0', -- Substitua pelo seu org_id
    NOW(),
    NOW()
);

-- Contato 3 - Empresa
INSERT INTO crm_contacts (
    id,
    type,
    name,
    fantasy_name,
    email,
    phone,
    document,
    document_type,
    status,
    org_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'company',
    'TechCorp Ltda',
    'TechCorp',
    'contato@techcorp.com',
    '(11) 77777-7777',
    '12345678000199',
    'cnpj',
    'active',
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0', -- Substitua pelo seu org_id
    NOW(),
    NOW()
);

-- Contato 4 - Pessoa com nome fantasia
INSERT INTO crm_contacts (
    id,
    type,
    name,
    fantasy_name,
    email,
    phone,
    document,
    document_type,
    position,
    status,
    org_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'person',
    'Carlos Oliveira',
    'Carlos Tech',
    'carlos@carlostech.com',
    '(11) 66666-6666',
    '11122233344',
    'cpf',
    'Desenvolvedor',
    'active',
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0', -- Substitua pelo seu org_id
    NOW(),
    NOW()
);

-- Verificar se os contatos foram inseridos
SELECT 
    id,
    type,
    name,
    first_name,
    last_name,
    fantasy_name,
    email,
    status,
    org_id
FROM crm_contacts 
WHERE org_id = '9c2745cc-86e3-40ff-9052-cc9258c86fa0' -- Substitua pelo seu org_id
ORDER BY created_at DESC;
