import { Button } from '@/components/ui/button';
import { FileType } from '@/services/folderService';
import { Download, Edit, Trash2 } from 'lucide-react';

interface FileActionsProps {
    file: FileType;
    userRole: 'admin' | 'user';
    onEdit: (file: FileType) => void;
    onDelete: (file: FileType) => void;
    onDownload: (file: FileType) => void;
}

export function FileActions({ file, userRole, onEdit, onDelete, onDownload }: FileActionsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDownload(file)}
                title="Download">
                <Download className="h-4 w-4" />
            </Button>
            {userRole === 'admin' && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(file)}
                        title="Edit">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(file)}
                        title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
} 