import * as React from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
    FolderPlus, 
    FilePlus, 
    Trash2, 
    Pencil, 
    Copy as CopyIcon, 
    Scissors,
    ClipboardPaste,
    FolderOpen,
    RefreshCw
} from 'lucide-react';
import { TreeNode } from '@/store/fileManager';

interface FolderContextMenuProps {
    children: React.ReactNode;
    folder: TreeNode;
    onAddItem: (parentId: string, type: 'file' | 'folder') => void;
    onRename: (id: string, newName: string) => void;
    onDelete?: (id: string) => void;
    onRefresh?: (id: string) => void;
    onOpenFolder?: (id: string) => void;
    userRole: 'admin' | 'user';
}

export function FolderContextMenu({
    children,
    folder,
    onAddItem,
    onRename,
    onDelete,
    onRefresh,
    onOpenFolder,
    userRole
}: FolderContextMenuProps) {
    const [clipboardItem, setClipboardItem] = React.useState<{ type: 'cut' | 'copy', item: TreeNode } | null>(null);

    const handleRename = () => {
        const newName = window.prompt('Enter new name:', folder.name);
        if (newName && newName !== folder.name) {
            onRename(folder.id, newName);
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={() => onOpenFolder?.(folder.id)}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open Folder
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onAddItem(folder.id, 'file')} disabled={userRole !== 'admin'}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAddItem(folder.id, 'folder')} disabled={userRole !== 'admin'}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => setClipboardItem({ type: 'cut', item: folder })}>
                    <Scissors className="mr-2 h-4 w-4" />
                    Cut
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setClipboardItem({ type: 'copy', item: folder })}>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy
                </ContextMenuItem>
                {clipboardItem && (
                    <ContextMenuItem onClick={() => {
                        // Implement paste logic here
                        console.log('Paste', clipboardItem);
                    }}>
                        <ClipboardPaste className="mr-2 h-4 w-4" />
                        Paste
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleRename} disabled={userRole !== 'admin'}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                </ContextMenuItem>
                {onDelete && (
                    <ContextMenuItem 
                        onClick={() => onDelete(folder.id)}
                        className="text-red-600"
                        disabled={userRole !== 'admin'}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                {onRefresh && (
                    <ContextMenuItem onClick={() => onRefresh(folder.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
} 