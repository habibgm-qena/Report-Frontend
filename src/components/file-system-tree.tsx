import React from 'react';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { ChevronDown, ChevronRight, Folder, File, Plus, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileSystemItem, FolderType as ApiFolderType } from '@/lib/api'; // Use types from API

interface FileSystemTreeProps {
    fileSystem: ApiFolderType[];
    onNodeSelect: (event: React.SyntheticEvent | null, nodeId: string) => void;
    onAddItem: (parentId: string, type: 'file' | 'folder') => void;
    userRole: 'admin' | 'user';
    // expandedItems: string[];
    // onToggle: (nodeId: string, isExpanded: boolean) => void;
    // selectedItems: string;
    // loadingItems: Record<string, boolean>; // To track loading state for specific folders
    isRootLoading: boolean;
}

export const FileSystemTree: React.FC<FileSystemTreeProps> = ({
    fileSystem,
    onNodeSelect,
    onAddItem,
    userRole,
    // expandedItems,
    // onToggle,
    // selectedItems,
    // loadingItems = {},
    isRootLoading
}) => {

    const renderTreeItems = (nodes: FileSystemItem[]) => {
        return nodes.map((node) => {
            if (node.type === 'folder') {
                // const isLoading = loadingItems[node.id];
                return (
                    <TreeItem
                        key={node.id}
                        itemId={node.id}
                        // slots={{ groupTransition: Collapse, iconContainer: FileIconContainer, label: TreeItemLabel }}
                        // slotProps={{
                        //     iconContainer: { 'data-testid': 'icon-container' },
                        //     label: { 'data-testid': 'label' },
                        // }}
                        label={(
                            <div className='flex items-center justify-between py-1'>
                                <div className='flex items-center gap-2'>
                                    {/* {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Folder className='h-4 w-4' />} */}
                                    <Folder className='h-4 w-4' />
                                    <span>{node.name}</span>
                                </div>
                                {userRole === 'admin' ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='ghost' size='icon' className='h-6 w-6' onClick={(e) => e.stopPropagation()}>
                                                <Plus className='h-3 w-3' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-48'>
                                            <div className='flex flex-col gap-2'>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='justify-start'
                                                    onClick={(e) => { e.stopPropagation(); onAddItem(node.id, 'folder'); }}>
                                                    <Folder className='mr-2 h-4 w-4' />
                                                    Add Folder
                                                </Button>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='justify-start'
                                                    onClick={(e) => { e.stopPropagation(); onAddItem(node.id, 'file'); }}>
                                                    <File className='mr-2 h-4 w-4' />
                                                    Add File
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <Lock className='text-muted-foreground h-4 w-4' />
                                )}
                            </div>
                        )}>
                        {(node as ApiFolderType).children?.length > 0 && renderTreeItems((node as ApiFolderType).children)}
                    </TreeItem>
                );
            }
            return null; // Do not render files in the tree directly, they are shown in the main area
        });
    };

    if (isRootLoading) {
        return (
            <div className='flex h-full items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <TreeView
            aria-label='file system navigator'
            // expandedItems={expandedItems}
            // selectedItems={selectedItems}
            // onSelectedItemsChange={(event, itemIds) => {
            //     const nodeId = Array.isArray(itemIds) ? itemIds[0] : itemIds;
            //     if (event) { // MUI V5 and below might not pass event
            //         onNodeSelect(event, nodeId);
            //     } else {
            //         onNodeSelect(null, nodeId); // Handle cases where event is not passed
            //     }
            // }}
            onSelectedItemsChange={onNodeSelect as any} // Updated based on SimpleTreeView usage
            // onItemExpansionToggle={(_event, nodeId, isExpanded) => onToggle(nodeId, isExpanded)}
            slots={{ collapseIcon: ChevronDown, expandIcon: ChevronRight }}
            slotProps={{
                collapseIcon: { className: 'h-4 w-4' },
                expandIcon: { className: 'h-4 w-4' }
            }}
            sx={{
                flexGrow: 1,
                overflowY: 'auto',
                [`& .${treeItemClasses.content}`]: {
                    paddingY: '2px',
                  },
                [`& .${treeItemClasses.iconContainer}`]: {
                    width: 'auto',
                    marginRight: '4px',
                },
                [`& .${treeItemClasses.label}`]: {
                    paddingLeft: 0,
                },
            }}
        >
            {renderTreeItems(fileSystem)}
        </TreeView>
    );
}; 