'use client';

import { useState } from 'react';

import { FileManager } from '@/components/file-manager';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Github } from 'lucide-react';

export default function Home() {
    // Mock user role - in a real app, this would come from authentication
    const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');

    return (
        <div className='flex h-screen flex-col'>
            {/* <header className='sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-xl font-semibold'>File Manager</h1>
                        <div className='h-6 w-px bg-border' />
                        <Select value={userRole} onValueChange={(value: 'admin' | 'user') => setUserRole(value)}>
                            <SelectTrigger className='w-[120px]'>
                                <SelectValue placeholder='Select role' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='admin'>Admin</SelectItem>
                                <SelectItem value='user'>User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex items-center gap-4'>
                        <Button variant='outline' size='icon' asChild>
                            <a
                                href='https://github.com/your-username/file-manager'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <Github className='h-4 w-4' />
                            </a>
                        </Button>
                        <ModeToggle />
                    </div>
                </div>
            </header> */}
            <main className='flex-1 overflow-hidden'>
                <FileManager userRole={userRole} />
            </main>
        </div>
    );
}
