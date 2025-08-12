"use client";
import { can } from '@/lib/authz';
export function RequireScope({ scopes, need, children }: { scopes: string[]; need: string | string[]; children: React.ReactNode }) {
  if (!can(scopes, need)) return null; return <>{children}</>;
}
