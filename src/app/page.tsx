'use client';

import { useState } from 'react';

import { FileManager } from '@/components/file-manager';

export default function Home() {
    // Mock user role - in a real app, this would come from authentication
    const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');

    return (
        <div className='flex h-screen flex-col'>
            <header className='flex h-14 items-center border-b px-4 lg:px-6'>
                <h1 className='text-lg font-semibold'>File Manager</h1>
                <div className='ml-auto flex items-center gap-4'>
                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as 'admin' | 'user')}
                        className='border-input bg-background rounded-md border px-3 py-1 text-sm'>
                        <option value='admin'>Admin</option>
                        <option value='user'>User</option>
                    </select>
                </div>
            </header>
            <FileManager userRole={userRole} />
        </div>
    );
}
