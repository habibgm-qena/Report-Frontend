import { useState } from 'react';

import CreateDatabaseModal from '@/components/create-database-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileType } from '@/services/folderService';

import { Loader2, Plus } from 'lucide-react';

interface Database {
    id: string;
    name: string;
}

interface FileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    isEditMode: boolean;
    fileName: string;
    fileSQL: string;
    onFileNameChange: (value: string) => void;
    onFileSQLChange: (value: string) => void;
    isSaving: boolean;
    databases: Database[];
    selectedDatabase: string;
    onDatabaseChange: (value: string) => void;
    onAddDatabase: (database: Database) => void;
}

export function FileDialog({
    isOpen,
    onClose,
    onSave,
    isEditMode,
    fileName,
    fileSQL,
    onFileNameChange,
    onFileSQLChange,
    isSaving,
    databases,
    selectedDatabase,
    onDatabaseChange,
    onAddDatabase
}: FileDialogProps) {
    const [isCreateDatabaseModalOpen, setIsCreateDatabaseModalOpen] = useState(false);

    // Handle dialog close with cleanup
    const handleDialogClose = () => {
        // Reset all local state
        setIsCreateDatabaseModalOpen(false);
        // Call the parent's onClose handler
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit File' : 'Add New File'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Edit the file details below.' : 'Enter the details for the new file.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                            <Label htmlFor='name'>Name</Label>
                            <Input
                                id='name'
                                value={fileName}
                                onChange={(e) => onFileNameChange(e.target.value)}
                                placeholder='Enter file name'
                            />
                        </div>
                        {!isEditMode && (
                            <div className='grid gap-2'>
                                <Label>Database</Label>
                                <div className='flex gap-2'>
                                    <Select value={selectedDatabase} onValueChange={onDatabaseChange}>
                                        <SelectTrigger className='flex-1'>
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
                                        onClick={() => setIsCreateDatabaseModalOpen(true)}>
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className='grid gap-2'>
                            <Label htmlFor='sql'>SQL Query</Label>
                            <Textarea
                                id='sql'
                                value={fileSQL}
                                onChange={(e) => onFileSQLChange(e.target.value)}
                                placeholder='Enter SQL query'
                                className='h-32'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={handleDialogClose}>
                            Cancel
                        </Button>
                        <Button onClick={onSave} disabled={isSaving || (!isEditMode && !selectedDatabase)}>
                            {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateDatabaseModal
                isOpen={isCreateDatabaseModalOpen}
                onClose={() => setIsCreateDatabaseModalOpen(false)}
                onSuccess={onAddDatabase}
            />
        </>
    );
}
