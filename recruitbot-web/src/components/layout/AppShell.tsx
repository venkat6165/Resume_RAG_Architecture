import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base text-text-primary antialiased selection:bg-primary/30 selection:text-white">
      {children}
    </div>
  );
}
