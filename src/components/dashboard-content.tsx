'use client';

import { useState } from 'react';

import CreateDatabaseModal from '@/components/create-database-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Plus } from 'lucide-react';

// Mock static data for databases
const mockDatabases = [
    { id: '1', name: 'Production DB', key: 'prod_db_001' },
    { id: '2', name: 'Staging DB', key: 'staging_db_002' },
    { id: '3', name: 'Development DB', key: 'dev_db_003' },
    { id: '4', name: 'Analytics DB', key: 'analytics_db_004' }
];

export default function DashboardContent() {
    const [name, setName] = useState('');
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [databases, setDatabases] = useState(mockDatabases);

    const handleAddDatabase = (newDatabase: { name: string; key: string }) => {
        const database = {
            id: (databases.length + 1).toString(),
            name: newDatabase.name,
            key: newDatabase.key
        };
        setDatabases((prev) => [...prev, database]);
    };

    return (
        <div className='max-w-2xl'>
            <Card className='border-gray-200'>
                <CardHeader>
                    <CardTitle className='text-xl text-black'>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                        <Label htmlFor='name' className='text-black'>
                            Organization Name
                        </Label>
                        <Input
                            id='name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter report name'
                            className='border-gray-300 focus:border-black'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label className='text-black'>Database</Label>
                        <div className='flex gap-2'>
                            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
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
                    </div>

                    <Button className='w-full bg-black text-white hover:bg-gray-800'>Create Report</Button>
                </CardContent>
            </Card>

            <CreateDatabaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddDatabase}
            />
        </div>
    );
}
