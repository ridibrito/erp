"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { useSidebar } from '@/contexts/SidebarContext';
import { supabase } from '@/lib/supabase';
import { Search, Bell, Calendar, Mail, User, ChevronDown, Settings, LogOut, Menu } from 'lucide-react';

export function Topbar({ 
  orgLabel, 
  roleLabel, 
  userName, 
  userEmail,
  userAvatar
}: { 
  orgLabel?: string; 
  roleLabel?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}){
  const { signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orgName, setOrgName] = useState<string>('Organização');
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('Topbar: orgLabel:', orgLabel);
  console.log('Topbar: roleLabel:', roleLabel);
  console.log('Topbar: userName:', userName);
  console.log('Topbar: userEmail:', userEmail);

  // Buscar nome da organização do banco de dados
  useEffect(() => {
    const fetchOrgName = async () => {
      if (orgLabel) {
        try {
          const { data, error } = await supabase
            .from('organizations')
            .select('fantasy_name, name')
            .eq('id', orgLabel)
            .single();
          
          if (error) {
            console.error('Topbar: Erro ao buscar organização:', error);
            return;
          }
          
          // Usar fantasy_name se disponível, senão usar name (razão social)
          const displayName = data?.fantasy_name || data?.name || 'Organização';
          console.log('Topbar: Nome da organização carregado:', displayName);
          setOrgName(displayName);
        } catch (error) {
          console.error('Topbar: Erro ao buscar organização:', error);
        }
      }
    };

    fetchOrgName();
  }, [orgLabel]);

  const handleSignOut = async () => {
    try {
      console.log('Topbar: Iniciando logout...');
      await signOut();
      console.log('Topbar: Logout realizado, redirecionando para login...');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, redirecionar para login
      router.push('/login');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Left side - Menu button and Breadcrumb */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
              title="Alternar sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{orgName}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{roleLabel ?? 'Usuário'}</span>
            </div>
          </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Buscar no sistema..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Calendar */}
        <Link href="/calendario">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
        </Link>

        {/* Email/Inbox */}
        <Link href="/inbox">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
        </Link>

        {/* User Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <User className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-medium">{userName ?? 'Usuário'}</div>
              <div className="text-xs text-muted-foreground capitalize">{roleLabel ?? 'admin'}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-[9999]">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-medium text-sm">{userName ?? 'Usuário'}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
                <div className="text-xs text-muted-foreground capitalize">{roleLabel ?? 'admin'}</div>
              </div>
              
              <div className="py-1">
                <Link href="/perfil">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </button>
                </Link>
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
                
                <div className="border-t border-border my-1"></div>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
