import { type Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { siteConfig } from '@/config/site';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    keywords: siteConfig.metadata.keywords,
    authors: [{ name: siteConfig.metadata.author }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [{ url: siteConfig.metadata.ogImage }]
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.metadata.ogImage]
    }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning className='h-full'>
            <body className={`${inter.className} flex min-h-screen flex-col bg-gray-50`}>
                <ThemeProvider>
                    <main className='flex-1'>{children}</main>
                </ThemeProvider>
            </body>
        </html>
    );
}
