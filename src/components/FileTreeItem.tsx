import React from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TreeNode } from '@/store/fileManager';
import { FolderContextMenu } from './FolderContextMenu';

interface FileTreeItemProps {
    node: TreeNode;
    isExpanded: boolean;
    isOpen: boolean;
    isLoading: boolean;
    userRole: 'admin' | 'user';
    onAddItem: (parentId: string, type: 'file' | 'folder') => void;
    onRename: (id: string, newName: string) => void;
    onDelete?: (id: string) => void;
    onRefresh?: (id: string) => void;
    onSelect?: (id: string) => void;
    onToggle?: (id: string) => void;
    onOpenFolder?: (id: string) => void;
    children?: React.ReactNode;
}

export function FileTreeItem({
    node,
    isExpanded,
    isOpen,
    isLoading,
    userRole,
    onAddItem,
    onRename,
    onDelete,
    onRefresh,
    onSelect,
    onToggle,
    onOpenFolder,
    children
}: FileTreeItemProps) {
    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (onSelect && onToggle) {
            onSelect(node.id);
            onToggle(node.id);
        }
    };

    const handleExpanderClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (onToggle) {
            onToggle(node.id);
        }
    };

    const content = (
        <div
            className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent',
                'cursor-pointer select-none'
            )}
            onClick={handleClick}
        >
            <div className="flex items-center gap-1 min-w-[24px]">
                <div onClick={handleExpanderClick} className="cursor-pointer">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                {isOpen ? (
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                ) : (
                    <Folder className="h-4 w-4 text-blue-500" />
                )}
            </div>
            <span className="text-sm">{node.name}</span>
        </div>
    );

    return (
        <FolderContextMenu
            folder={node}
            onAddItem={onAddItem}
            onRename={onRename}
            onDelete={onDelete}
            onRefresh={onRefresh}
            onOpenFolder={onOpenFolder}
            userRole={userRole}
        >
            <div role="treeitem" className="relative">
                {content}
                {isExpanded && (
                    <div role="group" className="ml-6">
                        {children || (
                            <div className="py-2 px-4 text-sm text-muted-foreground italic">
                                This folder is empty
                            </div>
                        )}
                    </div>
                )}
            </div>
        </FolderContextMenu>
    );
} 