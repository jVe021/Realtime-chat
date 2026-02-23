import type { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

// Minimal wrapper, useful later for ThemeProviders, ErrorBoundaries, etc.
export const Providers = ({ children }: ProvidersProps) => {
    return <>{children}</>;
};