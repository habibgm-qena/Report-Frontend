'use client';

import type React from 'react';
import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'react-toastify';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock authentication
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

            if (email && password) {
                toast.success('Login successful');
                router.push('/dashboard');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            toast.error('Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className='border-gray-200'>
            <CardHeader>
                <CardTitle className='text-xl text-black'>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='email' className='text-black'>
                            Email
                        </Label>
                        <Input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter your email'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='password' className='text-black'>
                            Password
                        </Label>
                        <Input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter your password'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <Button type='submit' className='w-full bg-black text-white hover:bg-gray-800' disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
                <div className='mt-4 text-center'>
                    <p className='text-sm text-gray-600'>
                        Don't have an account?{' '}
                        <Link href='/signup' className='font-medium text-black hover:underline'>
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
