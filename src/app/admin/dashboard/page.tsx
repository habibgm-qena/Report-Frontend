import Link from 'next/link';

import DashboardContent from '@/components/dashboard-content';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    return (
        <div className='min-h-screen bg-gray-50'>
            <header className='border-b border-gray-200 bg-white'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between py-6'>
                        <h1 className='text-2xl font-bold text-black'>Reporting Dashboard</h1>
                        <Button variant="outline" asChild>
                            <Link href={'/admin/login'} className='text-sm text-gray-600 hover:text-black'>
                                Sign out
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
                <DashboardContent />
            </main>
        </div>
    );
}
