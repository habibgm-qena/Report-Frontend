'use client';

import type React from 'react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'react-toastify';

export default function SignupForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success('Account created successfully');
            router.push('/login');
        } catch (error) {
            toast(error instanceof Error ? error.message : 'Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className='border-gray-200'>
            <CardHeader>
                <CardTitle className='text-xl text-black'>Create Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='name' className='text-black'>
                            Full Name
                        </Label>
                        <Input
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Enter your full name'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='email' className='text-black'>
                            Email
                        </Label>
                        <Input
                            id='email'
                            name='email'
                            type='email'
                            value={formData.email}
                            onChange={handleChange}
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
                            name='password'
                            type='password'
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='Create a password'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='confirmPassword' className='text-black'>
                            Confirm Password
                        </Label>
                        <Input
                            id='confirmPassword'
                            name='confirmPassword'
                            type='password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder='Confirm your password'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <Button type='submit' className='w-full bg-black text-white hover:bg-gray-800' disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
