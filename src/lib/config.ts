// Configuração centralizada do Nexus ERP

interface AppConfig {
  // Configurações gerais
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };

  // Configurações de API
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };

  // Configurações de autenticação
  auth: {
    sessionTimeout: number;
    refreshTokenInterval: number;
    enable2FA: boolean;
  };

  // Configurações de upload
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    storage: 'local' | 's3' | 'gcs';
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };

  // Configurações de email
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    from: string;
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
    sendgrid?: {
      apiKey: string;
    };
  };

  // Configurações de banco de dados
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };

  // Configurações de cache
  cache: {
    provider: 'redis' | 'memory';
    ttl: number;
    redis?: {
      url: string;
      password?: string;
    };
  };

  // Configurações de integrações
  integrations: {
    stripe?: {
      publishableKey: string;
      secretKey: string;
      webhookSecret: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
    };
    slack?: {
      botToken: string;
      signingSecret: string;
    };
  };

  // Configurações de monitoramento
  monitoring: {
    sentry?: {
      dsn: string;
      environment: string;
    };
    analytics?: {
      googleAnalyticsId: string;
    };
  };
}

// Configurações por ambiente
const configs: Record<string, AppConfig> = {
  development: {
    app: {
      name: 'Nexus ERP',
      version: '1.0.0',
      environment: 'development',
      debug: true,
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      retries: 3,
    },
    auth: {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
      refreshTokenInterval: 15 * 60 * 1000, // 15 minutos
      enable2FA: false,
    },
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      storage: 'local',
    },
    email: {
      provider: 'smtp',
      from: 'noreply@nexus.local',
      smtp: {
        host: 'localhost',
        port: 1025,
        secure: false,
        username: '',
        password: '',
      },
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/nexus_dev',
      pool: {
        min: 2,
        max: 10,
      },
    },
    cache: {
      provider: 'memory',
      ttl: 5 * 60 * 1000, // 5 minutos
    },
    integrations: {
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
    monitoring: {
      analytics: {
        googleAnalyticsId: process.env.GA_TRACKING_ID || '',
      },
    },
  },

  staging: {
    app: {
      name: 'Nexus ERP',
      version: '1.0.0',
      environment: 'staging',
      debug: false,
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nexus.com',
      timeout: 15000,
      retries: 3,
    },
    auth: {
      sessionTimeout: 24 * 60 * 60 * 1000,
      refreshTokenInterval: 15 * 60 * 1000,
      enable2FA: true,
    },
    upload: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      storage: 's3',
      s3: {
        bucket: process.env.S3_BUCKET || 'nexus-staging',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    },
    email: {
      provider: 'sendgrid',
      from: 'noreply@staging.nexus.com',
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY || '',
      },
    },
    database: {
      url: process.env.DATABASE_URL || '',
      pool: {
        min: 5,
        max: 20,
      },
    },
    cache: {
      provider: 'redis',
      ttl: 10 * 60 * 1000, // 10 minutos
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
      },
    },
    integrations: {
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      slack: {
        botToken: process.env.SLACK_BOT_TOKEN || '',
        signingSecret: process.env.SLACK_SIGNING_SECRET || '',
      },
    },
    monitoring: {
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        environment: 'staging',
      },
      analytics: {
        googleAnalyticsId: process.env.GA_TRACKING_ID || '',
      },
    },
  },

  production: {
    app: {
      name: 'Nexus ERP',
      version: '1.0.0',
      environment: 'production',
      debug: false,
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.nexus.com',
      timeout: 20000,
      retries: 5,
    },
    auth: {
      sessionTimeout: 24 * 60 * 60 * 1000,
      refreshTokenInterval: 15 * 60 * 1000,
      enable2FA: true,
    },
    upload: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      storage: 's3',
      s3: {
        bucket: process.env.S3_BUCKET || 'nexus-production',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    },
    email: {
      provider: 'ses',
      from: 'noreply@nexus.com',
    },
    database: {
      url: process.env.DATABASE_URL || '',
      pool: {
        min: 10,
        max: 50,
      },
    },
    cache: {
      provider: 'redis',
      ttl: 15 * 60 * 1000, // 15 minutos
      redis: {
        url: process.env.REDIS_URL || '',
        password: process.env.REDIS_PASSWORD,
      },
    },
    integrations: {
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      slack: {
        botToken: process.env.SLACK_BOT_TOKEN || '',
        signingSecret: process.env.SLACK_SIGNING_SECRET || '',
      },
    },
    monitoring: {
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        environment: 'production',
      },
      analytics: {
        googleAnalyticsId: process.env.GA_TRACKING_ID || '',
      },
    },
  },
};

// Determinar ambiente atual
const getEnvironment = (): string => {
  if (typeof window !== 'undefined') {
    // Cliente
    return process.env.NODE_ENV || 'development';
  } else {
    // Servidor
    return process.env.NODE_ENV || 'development';
  }
};

// Configuração atual
const currentEnv = getEnvironment();
export const config: AppConfig = configs[currentEnv] || configs.development;

// Funções utilitárias de configuração
export const isDevelopment = () => config.app.environment === 'development';
export const isStaging = () => config.app.environment === 'staging';
export const isProduction = () => config.app.environment === 'production';

export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};

export const getUploadUrl = () => {
  return getApiUrl('upload');
};

export const getWebSocketUrl = () => {
  const apiUrl = config.api.baseUrl;
  if (apiUrl.startsWith('https://')) {
    return apiUrl.replace('https://', 'wss://');
  }
  return apiUrl.replace('http://', 'ws://');
};

// Validação de configuração
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (!config.api.baseUrl) {
    errors.push('API base URL não configurada');
  }

  if (isProduction() && !config.database.url) {
    errors.push('Database URL não configurada para produção');
  }

  if (config.upload.storage === 's3' && !config.upload.s3?.bucket) {
    errors.push('S3 bucket não configurado');
  }

  if (config.email.provider === 'sendgrid' && !config.email.sendgrid?.apiKey) {
    errors.push('SendGrid API key não configurada');
  }

  return errors;
};

// Configurações específicas do cliente (seguras para expor)
export const clientConfig = {
  app: {
    name: config.app.name,
    version: config.app.version,
    environment: config.app.environment,
  },
  api: {
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
  },
  auth: {
    sessionTimeout: config.auth.sessionTimeout,
    enable2FA: config.auth.enable2FA,
  },
  upload: {
    maxFileSize: config.upload.maxFileSize,
    allowedTypes: config.upload.allowedTypes,
  },
  integrations: {
    stripe: config.integrations.stripe ? {
      publishableKey: config.integrations.stripe.publishableKey,
    } : undefined,
    google: config.integrations.google ? {
      clientId: config.integrations.google.clientId,
    } : undefined,
  },
  monitoring: {
    analytics: config.monitoring.analytics,
  },
};
