import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'md' | 'lg' | 'custom';
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
  width?: number;
  height?: number;
}

const sizeClasses = {
  md: 'h-18 w-18',
  lg: 'h-32 w-32',
  custom: '',
};

export function Logo({ 
  className, 
  size = 'md', 
  showText = false, 
  variant = 'default',
  width,
  height
}: LogoProps) {
  const logoSize = size === 'custom' ? '' : sizeClasses[size];
  const logoSrc = variant === 'white' ? '/logo_branca_cortus.png' : '/logo_cortus.png';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', logoSize)}>
        <Image
          src={logoSrc}
          alt="Cortus ERP"
          width={size === 'custom' ? width : undefined}
          height={size === 'custom' ? height : undefined}
          fill={size !== 'custom'}
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}

// Componente apenas com o ícone
export function LogoIcon({ 
  className, 
  size = 'md', 
  variant = 'default' 
}: { 
  className?: string; 
  size?: 'md' | 'lg';
  variant?: 'default' | 'white' | 'dark';
}) {
  const logoSize = sizeClasses[size];
  const logoSrc = variant === 'white' ? '/logo_branca_cortus.png' : '/logo_cortus.png';
  
  return (
    <div className={cn('relative', logoSize, className)}>
      <Image
        src={logoSrc}
        alt="Cortus ERP"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
