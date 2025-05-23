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
import { FileType } from '@/services/folderService';
import { Loader2 } from 'lucide-react';

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
    isSaving
}: FileDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit File' : 'Add New File'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Edit the file details below.'
                            : 'Enter the details for the new file.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={fileName}
                            onChange={(e) => onFileNameChange(e.target.value)}
                            placeholder="Enter file name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sql">SQL Query</Label>
                        <Textarea
                            id="sql"
                            value={fileSQL}
                            onChange={(e) => onFileSQLChange(e.target.value)}
                            placeholder="Enter SQL query"
                            className="h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 