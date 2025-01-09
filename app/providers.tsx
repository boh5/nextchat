'use client';

import { TRPCProvider } from '@/components/providers/trpc-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
