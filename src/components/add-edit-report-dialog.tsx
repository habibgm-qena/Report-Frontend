import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { FileType } from '@/lib/api'; // Assuming types are moved to api.ts

interface AddEditReportDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isEditMode: boolean;
    reportName: string;
    onReportNameChange: (name: string) => void;
    reportSQL: string;
    onReportSQLChange: (sql: string) => void;
    onSave: () => void;
    isLoading?: boolean;
}

export const AddEditReportDialog: React.FC<AddEditReportDialogProps> = ({
    isOpen,
    onOpenChange,
    isEditMode,
    reportName,
    onReportNameChange,
    reportSQL,
    onReportSQLChange,
    onSave,
    isLoading
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Report' : 'Add New Report'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update the report details below.' : 'Enter the details for your new report.'}
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                        <Label htmlFor='name'>Report Name</Label>
                        <Input
                            id='name'
                            value={reportName}
                            onChange={(e) => onReportNameChange(e.target.value)}
                            placeholder='Enter report name'
                            disabled={isLoading}
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='sql'>SQL Query</Label>
                        <Textarea
                            id='sql'
                            value={reportSQL}
                            onChange={(e) => onReportSQLChange(e.target.value)}
                            placeholder='Enter SQL query'
                            rows={5}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 