'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

import ApiKeyModal from '@/components/api-key-modal';
import CreateDatabaseModal from '@/components/create-database-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import $axios from '@/lib/axiosInstance';
import { cpClientRequest } from '@/lib/cpClient';

import { cp } from 'fs';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

// Mock static data for databases
// const mockDatabases = [
//     { id: '1', name: 'Production DB', key: 'prod_db_001' },
//     { id: '2', name: 'Staging DB', key: 'staging_db_002' },
//     { id: '3', name: 'Development DB', key: 'dev_db_003' },
//     { id: '4', name: 'Analytics DB', key: 'analytics_db_004' }
// ];

export default function DashboardContent() {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [databases, setDatabases] = useState<any>([]);

    // useEffect(() => {
    //     const fetchDatabases = async () => {
    //         const { data } = await $axios.get("/database", {
    //             headers: {
    //                 'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
    //                 'ROLE': 'admin'
    //             }
    //         });

    //         setDatabases(data);
    //     };

    //     fetchDatabases();
    // });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // const handleDatabaseChange = (value: string) => {
    //     setFormData((prev) => ({
    //         ...prev,
    //         database: value
    //     }));
    // };

    // const handleAddDatabase = (newDatabase: { name: string; key: string }) => {
    //     const database = {
    //         id: (databases.length + 1).toString(),
    //         name: newDatabase.name,
    //         key: newDatabase.key
    //     };
    //     setDatabases((prev) => [...prev, database]);
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Mock API call to create organization
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const token = localStorage.getItem("access_token");
            console.log("token: ", token);
            const  { data } = await $axios.post("/organizations/", {
                name: formData.name,
                description: formData.description
            }, {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
            });

            setApiKey(data.api_key);
            setIsApiKeyModalOpen(true);

            // Reset form
            setFormData({
                name: '',
                description: '',
            });
        } catch (error) {
            toast.error('Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='max-w-2xl'>
            <Card className='border-gray-200'>
                <CardHeader>
                    <CardTitle className='text-xl text-black'>Add Organization</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='space-y-2'>
                            <Label htmlFor='name' className='text-black'>
                                Organization Name
                            </Label>
                            <Input
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder='Enter organization name'
                                required
                                className='border-gray-300 focus:border-black'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='description' className='text-black'>
                                Organization Description
                            </Label>
                            <Textarea
                                id='description'
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Enter organization description'
                                required
                                className='min-h-[100px] border-gray-300 focus:border-black'
                            />
                        </div>

                        {/* <div className='space-y-2'>
                            <Label className='text-black'>Database</Label>
                            <div className='flex gap-2'>
                                <Select value={formData.database} onValueChange={handleDatabaseChange}>
                                    <SelectTrigger className='flex-1 border-gray-300 focus:border-black'>
                                        <SelectValue placeholder='Select a database' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {databases.map((db) => (
                                            <SelectItem key={db.id} value={db.id}>
                                                {db.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='icon'
                                    onClick={() => setIsModalOpen(true)}
                                    className='border-gray-300 hover:bg-gray-50'>
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                        </div> */}

                        <Button
                            type='submit'
                            className='w-full bg-black text-white hover:bg-gray-800'
                            disabled={isLoading}>
                            {isLoading ? 'Creating Organization...' : 'Create Organization'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* <CreateDatabaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddDatabase}
            /> */}

            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                apiKey={apiKey}
                organizationName={formData.name}
            />
        </div>
    );
}
