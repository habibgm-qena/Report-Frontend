"use client"

import { type ReactNode, createContext, useContext } from 'react';

import { useSiteConfig } from '@/hooks/use-site-config';

interface ThemeContextType {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { theme } = useSiteConfig();

    return (
        <ThemeContext.Provider value={theme}>
            <style jsx global>{`
                :root {
                    --primary-color: ${theme.primaryColor};
                    --secondary-color: ${theme.secondaryColor};
                    --accent-color: ${theme.accentColor};
                    --background-color: ${theme.backgroundColor};
                    --text-color: ${theme.textColor};
                }

                body {
                    background-color: var(--background-color);
                    color: var(--text-color);
                }
            `}</style>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
