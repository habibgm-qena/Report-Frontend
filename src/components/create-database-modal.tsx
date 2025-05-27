'use client';

import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'react-toastify';

interface CreateDatabaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (database: { name: string; key: string }) => void;
}

export default function CreateDatabaseModal({ isOpen, onClose, onSuccess }: CreateDatabaseModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        key: ''
    });
    const [isLoading, setIsLoading] = useState(false);

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
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Simulate random success/failure for demo
            const isSuccess = Math.random() > 0.3;

            if (isSuccess) {
                onSuccess(formData);
                toast.success(`${formData.name} has been added to your databases.`);
                setFormData({ name: '', key: '' });
                onClose();
            } else {
                throw new Error('Database key already exists');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', key: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='text-black'>Create New Database</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='db-name' className='text-black'>
                            Database Name
                        </Label>
                        <Input
                            id='db-name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Enter database name'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='db-key' className='text-black'>
                            Database Key
                        </Label>
                        <Input
                            id='db-key'
                            name='key'
                            value={formData.key}
                            onChange={handleChange}
                            placeholder='Enter unique database key'
                            required
                            className='border-gray-300 focus:border-black'
                        />
                    </div>
                    <div className='flex gap-2 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClose}
                            className='flex-1 border-gray-300 hover:bg-gray-50'>
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='flex-1 bg-black text-white hover:bg-gray-800'>
                            {isLoading ? 'Creating...' : 'Create Database'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
