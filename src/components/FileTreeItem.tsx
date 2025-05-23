import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileType, FolderType } from '@/services/folderService';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ChevronRight, ChevronDown, File, Folder, Lock, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeItemProps {
    node: FileType | FolderType;
    isExpanded: boolean;
    isLoading: boolean;
    isSelected?: boolean;
    userRole: 'admin' | 'user';
    onAddItem: (parentId: string, type: 'file' | 'folder') => void;
    onRename?: (id: string, newName: string) => void;
    children?: React.ReactNode;
}

export function FileTreeItem({
    node,
    isExpanded,
    isLoading,
    isSelected,
    userRole,
    onAddItem,
    onRename,
    children
}: FileTreeItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(node.name);

    if (node.type !== 'folder') return null;

    const hasChildren = node.children && node.children.some(child => child.type === 'folder');

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (userRole === 'admin') {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onRename && editedName.trim() !== '') {
            onRename(node.id, editedName.trim());
        }
        setIsEditing(false);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        setEditedName(node.name);
    };

    return (
        <TreeItem
            itemId={node.id}
            label={
                <div className={cn(
                    'flex items-center justify-between py-2 px-1 rounded-md transition-colors',
                    isSelected && 'bg-accent',
                    !isSelected && 'hover:bg-accent/50'
                )}>
                    <div className='flex items-center gap-2' onDoubleClick={handleDoubleClick}>
                        <div className="flex items-center gap-1 min-w-[24px]">
                            {hasChildren && (
                                isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )
                                )
                            )}
                            <Folder className={cn(
                                'h-4 w-4',
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                            )} />
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleNameSubmit} onClick={e => e.stopPropagation()}>
                                <Input
                                    value={editedName}
                                    onChange={handleNameChange}
                                    onBlur={handleBlur}
                                    autoFocus
                                    className="h-6 w-40"
                                />
                            </form>
                        ) : (
                            <span className={cn(
                                'text-sm',
                                isSelected && 'font-medium'
                            )}>{node.name}</span>
                        )}
                    </div>
                    {userRole === 'admin' && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant='ghost' 
                                    size='icon' 
                                    className={cn(
                                        'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                                        isSelected && 'opacity-100'
                                    )}>
                                    <Plus className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-48' align="start">
                                <div className='flex flex-col gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='justify-start'
                                        onClick={() => onAddItem(node.id, 'folder')}>
                                        <Folder className='mr-2 h-4 w-4' />
                                        Add Folder
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='justify-start'
                                        onClick={() => onAddItem(node.id, 'file')}>
                                        <File className='mr-2 h-4 w-4' />
                                        Add File
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            }
            className="group">
            {children}
        </TreeItem>
    );
} 