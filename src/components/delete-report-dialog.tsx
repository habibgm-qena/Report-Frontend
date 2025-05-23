import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { FileType } from '@/lib/api'; // Assuming types are moved to api.ts

interface DeleteReportDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    reportName: string | undefined;
    onDelete: () => void;
    isLoading?: boolean;
}

export const DeleteReportDialog: React.FC<DeleteReportDialogProps> = ({
    isOpen,
    onOpenChange,
    reportName,
    onDelete,
    isLoading
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{reportName}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}; 