'use client';

import type React from 'react';
import { useState } from 'react';

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
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
// import { TreeView } from '@mui/x-tree-view/TreeView';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { ChevronDown, ChevronRight, Download, Edit, File, Folder, Lock, Plus, Trash2 } from 'lucide-react';

// Types for our file system
type FileType = {
    id: string;
    name: string;
    type: 'file';
    sql?: string;
};

type FolderType = {
    id: string;
    name: string;
    type: 'folder';
    children: (FileType | FolderType)[];
};

type FileSystemItem = FileType | FolderType;

// Initial mock data
const initialFileSystem: FolderType[] = [
    {
        id: 'folder-1',
        name: 'Reports',
        type: 'folder',
        children: [
            {
                id: 'folder-1-1',
                name: 'Financial',
                type: 'folder',
                children: [
                    {
                        id: 'file-1-1-1',
                        name: 'Q1 Report',
                        type: 'file',
                        sql: 'SELECT * FROM financial_data WHERE quarter = 1'
                    },
                    {
                        id: 'file-1-1-2',
                        name: 'Q2 Report',
                        type: 'file',
                        sql: 'SELECT * FROM financial_data WHERE quarter = 2'
                    }
                ]
            },
            {
                id: 'folder-1-2',
                name: 'Marketing',
                type: 'folder',
                children: [
                    {
                        id: 'file-1-2-1',
                        name: 'Campaign Analysis',
                        type: 'file',
                        sql: 'SELECT * FROM marketing_campaigns'
                    }
                ]
            }
        ]
    },
    {
        id: 'folder-2',
        name: 'Dashboards',
        type: 'folder',
        children: [
            { id: 'file-2-1', name: 'Executive Dashboard', type: 'file', sql: 'SELECT * FROM executive_metrics' }
        ]
    }
];

interface FileManagerProps {
    userRole: 'admin' | 'user';
}

export function FileManager({ userRole }: FileManagerProps) {
    const [fileSystem, setFileSystem] = useState<FolderType[]>(initialFileSystem);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
    const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [newFileSQL, setNewFileSQL] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Function to find a folder by ID in the file system
    const findFolderById = (
        items: FileSystemItem[],
        id: string,
        path: { id: string; name: string }[] = []
    ): { folder: FolderType | null; path: { id: string; name: string }[] } => {
        for (const item of items) {
            if (item.id === id && item.type === 'folder') {
                return { folder: item as FolderType, path: [...path, { id: item.id, name: item.name }] };
            }
            if (item.type === 'folder') {
                const result = findFolderById((item as FolderType).children, id, [
                    ...path,
                    { id: item.id, name: item.name }
                ]);
                if (result.folder) return result;
            }
        }
        return { folder: null, path: [] };
    };

    // Handle tree node selection
    const handleNodeSelect = (_event: React.SyntheticEvent, nodeId: string) => {
        const { folder, path } = findFolderById(fileSystem, nodeId);
        if (folder) {
            setSelectedFolder(folder);
            setBreadcrumbs(path);
            setSelectedFile(null);
        }
    };

    // Handle adding a new item (file or folder)
    const handleAddItem = (parentId: string, type: 'file' | 'folder') => {
        setNewItemType(type);
        setNewFileName('');
        setNewFileSQL('');
        setIsEditMode(false);
        if (type === 'file') {
            setIsAddFileDialogOpen(true);
        } else {
            // Add a new folder directly
            const newFolder: FolderType = {
                id: `folder-${Date.now()}`,
                name: 'New Folder',
                type: 'folder',
                children: []
            };

            addItemToFileSystem(parentId, newFolder);
        }
    };

    // Add item to file system
    const addItemToFileSystem = (parentId: string, newItem: FileSystemItem) => {
        const updateFileSystem = (items: FileSystemItem[]): FileSystemItem[] => {
            return items.map((item) => {
                if (item.id === parentId && item.type === 'folder') {
                    return {
                        ...item,
                        children: [...(item as FolderType).children, newItem]
                    };
                }
                if (item.type === 'folder') {
                    return {
                        ...item,
                        children: updateFileSystem((item as FolderType).children)
                    };
                }
                return item;
            });
        };

        setFileSystem(updateFileSystem(fileSystem) as FolderType[]);
    };

    // Save a new file
    const handleSaveFile = () => {
        if (!selectedFolder) return;

        const newFile: FileType = {
            id: isEditMode && selectedFile ? selectedFile.id : `file-${Date.now()}`,
            name: newFileName,
            type: 'file',
            sql: newFileSQL
        };

        if (isEditMode && selectedFile) {
            // Update existing file
            updateFile(selectedFile.id, newFile);
        } else {
            // Add new file
            addItemToFileSystem(selectedFolder.id, newFile);
        }

        setIsAddFileDialogOpen(false);
    };

    // Update a file in the file system
    const updateFile = (fileId: string, updatedFile: FileType) => {
        const updateItems = (items: FileSystemItem[]): FileSystemItem[] => {
            return items.map((item) => {
                if (item.id === fileId) {
                    return updatedFile;
                }
                if (item.type === 'folder') {
                    return {
                        ...item,
                        children: updateItems((item as FolderType).children)
                    };
                }
                return item;
            });
        };

        setFileSystem(updateItems(fileSystem) as FolderType[]);
    };

    // Handle file edit
    const handleEditFile = (file: FileType) => {
        setSelectedFile(file);
        setNewFileName(file.name);
        setNewFileSQL(file.sql || '');
        setIsEditMode(true);
        setIsAddFileDialogOpen(true);
    };

    // Handle file delete confirmation
    const handleDeleteConfirm = (file: FileType) => {
        setSelectedFile(file);
        setIsDeleteDialogOpen(true);
    };

    // Delete a file from the file system
    const deleteFile = () => {
        if (!selectedFile) return;

        const deleteFromItems = (items: FileSystemItem[]): FileSystemItem[] => {
            return items.filter((item) => {
                if (item.id === selectedFile.id) {
                    return false;
                }
                if (item.type === 'folder') {
                    return {
                        ...item,
                        children: deleteFromItems((item as FolderType).children)
                    };
                }
                return true;
            });
        };

        setFileSystem(deleteFromItems(fileSystem) as FolderType[]);
        setIsDeleteDialogOpen(false);
        setSelectedFile(null);
    };

    // Handle file download (dummy function)
    const handleDownloadFile = (file: FileType) => {
        console.log(`Downloading file: ${file.name}`);
        alert(`File ${file.name} would be downloaded in a real application`);
    };

    // Render tree items recursively
    const renderTree = (nodes: FileSystemItem[]) => {
        return nodes.map((node) => {
            if (node.type === 'folder') {
                return (
                    <TreeItem
                        key={node.id}
                        itemId={node.id}
                        label={
                            <div className='flex items-center justify-between py-1'>
                                <div className='flex items-center gap-2'>
                                    <Folder className='h-4 w-4' />
                                    <span>{node.name}</span>
                                </div>
                                {userRole === 'admin' ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='ghost' size='icon' className='h-6 w-6'>
                                                <Plus className='h-3 w-3' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-48'>
                                            <div className='flex flex-col gap-2'>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='justify-start'
                                                    onClick={() => handleAddItem(node.id, 'folder')}>
                                                    <Folder className='mr-2 h-4 w-4' />
                                                    Add Folder
                                                </Button>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='justify-start'
                                                    onClick={() => handleAddItem(node.id, 'file')}>
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
                        }>
                        {(node as FolderType).children.length > 0 && renderTree((node as FolderType).children)}
                    </TreeItem>
                );
            }
            return null;
        });
    };

    return (
        <div className='flex flex-1 overflow-hidden'>
            {/* Left sidebar with TreeView */}
            <div className='bg-muted/20 w-64 border-r p-4'>
                <TreeView
                    aria-label='file system navigator'
                    slots={{ collapseIcon: ChevronDown, expandIcon: ChevronRight }}
                    slotProps={{
                        collapseIcon: { className: 'h-4 w-4' },
                        expandIcon: { className: 'h-4 w-4' }
                    }}
                    onSelectedItemsChange={(event, itemIds) => {
                        const nodeId = Array.isArray(itemIds) ? itemIds[0] : itemIds;
                        if (event) {
                            handleNodeSelect(event, nodeId);
                        }
                    }}
                    className='overflow-auto'>
                    {renderTree(fileSystem)}
                </TreeView>
            </div>

            {/* Right side with file list */}
            <div className='flex flex-1 flex-col overflow-hidden'>
                <div className='flex items-center justify-between border-b p-4'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href='#'>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            {breadcrumbs.map((crumb, index) => (
                                <BreadcrumbItem key={crumb.id}>
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbLink href='#' className='font-medium'>
                                            {crumb.name}
                                        </BreadcrumbLink>
                                    ) : (
                                        <>
                                            <BreadcrumbLink href='#'>{crumb.name}</BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                        </>
                                    )}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    {userRole === 'admin' && selectedFolder && (
                        <Button size='sm' onClick={() => handleAddItem(selectedFolder.id, 'file')}>
                            Add New
                        </Button>
                    )}
                </div>

                <div className='flex-1 overflow-auto p-4'>
                    {selectedFolder ? (
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                            {selectedFolder.children
                                .filter((item) => item.type === 'file')
                                .map((file) => (
                                    <div
                                        key={file.id}
                                        className='group hover:border-primary relative rounded-md border p-3'>
                                        <div className='flex items-center gap-2'>
                                            <File className='text-muted-foreground h-4 w-4' />
                                            <span className='truncate text-sm font-medium'>
                                                {(file as FileType).name}
                                            </span>
                                        </div>

                                        <div className='absolute top-2 right-2 hidden gap-1 group-hover:flex'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-6 w-6'
                                                onClick={() => handleDownloadFile(file as FileType)}>
                                                <Download className='h-3 w-3' />
                                            </Button>
                                            {userRole === 'admin' && (
                                                <>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-6 w-6'
                                                        onClick={() => handleEditFile(file as FileType)}>
                                                        <Edit className='h-3 w-3' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-6 w-6'
                                                        onClick={() => handleDeleteConfirm(file as FileType)}>
                                                        <Trash2 className='h-3 w-3' />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className='flex h-full items-center justify-center'>
                            <p className='text-muted-foreground'>Select a folder to view files</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit File Dialog */}
            <Dialog open={isAddFileDialogOpen} onOpenChange={setIsAddFileDialogOpen}>
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
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder='Enter report name'
                            />
                        </div>
                        <div className='grid gap-2'>
                            <Label htmlFor='sql'>SQL Query</Label>
                            <Textarea
                                id='sql'
                                value={newFileSQL}
                                onChange={(e) => setNewFileSQL(e.target.value)}
                                placeholder='Enter SQL query'
                                rows={5}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsAddFileDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveFile}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{selectedFile?.name}&quot;? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteFile}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
