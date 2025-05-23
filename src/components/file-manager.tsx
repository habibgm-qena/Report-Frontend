'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { ChevronDown, ChevronRight, File, Loader2, Folder } from 'lucide-react';
import { createItem, deleteItem, getFolderContents, updateItem } from '@/app/api/endpoints/fileManager';
import { useGenericMethod } from '@/hooks/useGenericMethod';
import { FileType, FolderType } from '@/services/folderService';
import { FileTreeItem } from './FileTreeItem';
import { FileActions } from './FileActions';
import { FileDialog } from './FileDialog';
import { DeleteDialog } from './DeleteDialog';
import { FileDisplayArea } from './FileDisplayArea';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    fileManagerAtom,
    selectedFolderAtom,
    breadcrumbsAtom,
} from '@/store/fileManager';

interface FileManagerProps {
    userRole: 'admin' | 'user';
}

type FileSystemItem = FileType | FolderType;

export function FileManager({ userRole }: FileManagerProps) {
    const [state, setState] = useAtom(fileManagerAtom);
    const [selectedFolder, setSelectedFolder] = useAtom(selectedFolderAtom);
    const [breadcrumbs, setBreadcrumbs] = useAtom(breadcrumbsAtom);

    const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [newFileSQL, setNewFileSQL] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Generic method hooks
    const { data: rootFolder, loading: loadingRoot, handleAction: fetchRoot } = useGenericMethod({
        method: 'GET',
        apiMethod: getFolderContents,
        successMessage: 'Root folder loaded successfully'
    });

    const { data: currentFolder, loading: loadingFolder, handleAction: fetchFolder } = useGenericMethod({
        method: 'GET',
        apiMethod: getFolderContents,
        successMessage: 'Folder contents loaded successfully'
    });

    const { loading: loadingCreate, handleAction: createNewItem } = useGenericMethod({
        method: 'POST',
        apiMethod: createItem,
        successMessage: 'Item created successfully',
        onSuccess: () => {
            setIsAddFileDialogOpen(false);
            refreshCurrentFolder();
        }
    });

    const { loading: loadingUpdate, handleAction: updateExistingItem } = useGenericMethod({
        method: 'PATCH',
        apiMethod: updateItem,
        successMessage: 'Item updated successfully',
        onSuccess: () => {
            setIsAddFileDialogOpen(false);
            refreshCurrentFolder();
        }
    });

    const { loading: loadingDelete, handleAction: deleteExistingItem } = useGenericMethod({
        method: 'DELETE',
        apiMethod: deleteItem,
        successMessage: 'Item deleted successfully',
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            refreshCurrentFolder();
        }
    });

    // Initial load
    useEffect(() => {
        fetchRoot();
    }, []);

    // Update selected folder when currentFolder changes
    useEffect(() => {
        if (currentFolder) {
            setSelectedFolder(currentFolder);
            setState(prev => ({ ...prev, selected: currentFolder.id }));
            const buildBreadcrumbs = async (folder: FolderType) => {
                const path = [];
                let current: FolderType | null = folder;
                while (current) {
                    path.unshift({ id: current.id, name: current.name });
                    if (current.parentId && current.parentId !== 'root') {
                        const response = await getFolderContents({ id: current.parentId });
                        current = response.data;
                    } else {
                        current = null;
                    }
                }
                if (path[0]?.id !== 'root') {
                    path.unshift({ id: 'root', name: 'Root' });
                }
                setBreadcrumbs(path);
            };
            buildBreadcrumbs(currentFolder);
            if (currentFolder.id !== 'root') {
                setState(prev => ({
                    ...prev,
                    expandedFolders: {
                        ...prev.expandedFolders,
                        [currentFolder.id]: currentFolder
                    }
                }));
            }
        }
    }, [currentFolder]);

    const refreshCurrentFolder = () => {
        if (selectedFolder) {
            fetchFolder({ id: selectedFolder.id });
        }
        // Also refresh the root folder to keep the tree in sync
        fetchRoot();
    };

    // Handle expand/collapse
    const handleExpandedChange = async (_event: React.SyntheticEvent | null, itemIds: string[]) => {
        setState(prev => ({ ...prev, expanded: itemIds }));
        // Load children for any newly expanded folder
        for (const id of itemIds) {
            if (!state.expandedFolders[id]) {
                setState(prev => ({ ...prev, loadingFolderId: id }));
                try {
                    const response = await getFolderContents({ id });
                    setState(prev => ({
                        ...prev,
                        expandedFolders: { 
                            ...prev.expandedFolders, 
                            [id]: {
                                ...response.data,
                                children: response.data.children || []
                            }
                        },
                        loadingFolderId: null
                    }));
                } catch (error) {
                    console.error('Error loading folder contents:', error);
                    setState(prev => ({ ...prev, loadingFolderId: null }));
                }
            }
        }
    };

    // Handle selection
    const handleSelectedChange = async (_event: React.SyntheticEvent | null, itemIds: string | null) => {
        if (!itemIds) return;
        setState(prev => ({ ...prev, selected: itemIds, loadingFolderId: itemIds }));
        try {
            await fetchFolder({ id: itemIds });
        } catch (error) {
            console.error('Error loading folder:', error);
        }
        setState(prev => ({ ...prev, loadingFolderId: null }));
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
            // Add a new folder
            const newFolder: Partial<FolderType> = {
                id: `folder-${Date.now()}`,
                name: 'New Folder',
                type: 'folder',
                children: []
            };
            createNewItem({ parentId, item: newFolder });
        }
    };

    // Save a new file
    const handleSaveFile = () => {
        if (!selectedFolder) return;

        const newFile: Partial<FileType> = {
            id: isEditMode && state.selectedFile ? state.selectedFile.id : `file-${Date.now()}`,
            name: newFileName,
            type: 'file',
            sql: newFileSQL,
            updatedAt: new Date().toISOString()
        };

        if (isEditMode && state.selectedFile) {
            updateExistingItem({ id: state.selectedFile.id, updates: newFile });
        } else {
            createNewItem({ parentId: selectedFolder.id, item: newFile });
        }
    };

    // Handle file actions
    const handleFileAction = (action: 'edit' | 'delete' | 'download', file: FileType) => {
        switch (action) {
            case 'edit':
                setState(prev => ({ ...prev, selectedFile: file }));
                setNewFileName(file.name);
                setNewFileSQL(file.sql || '');
                setIsEditMode(true);
                setIsAddFileDialogOpen(true);
                break;
            case 'delete':
                setState(prev => ({ ...prev, selectedFile: file }));
                setIsDeleteDialogOpen(true);
                break;
            case 'download':
                console.log(`Downloading file: ${file.name}`);
                alert(`File ${file.name} would be downloaded in a real application`);
                break;
        }
    };

    // Handle folder rename
    const handleFolderRename = async (id: string, newName: string) => {
        await updateExistingItem({ id, updates: { name: newName } });
        refreshCurrentFolder();
    };

    // Render tree items recursively
    const renderTree = (nodes: FileSystemItem[]) => {
        if (!nodes) return null;
        return nodes.map((node) => {
            if (node.type === 'folder') {
                const isExpanded = state.expanded.includes(node.id);
                const isLoading = state.loadingFolderId === node.id;
                const expandedFolder = state.expandedFolders[node.id];
                const children = expandedFolder?.children || [];

                return (
                    <FileTreeItem
                        key={node.id}
                        node={node}
                        isExpanded={isExpanded}
                        isLoading={isLoading}
                        userRole={userRole}
                        onAddItem={handleAddItem}
                        onRename={handleFolderRename}>
                        {isExpanded && children && renderTree(children)}
                    </FileTreeItem>
                );
            }
            return null;
        });
    };

    return (
        <div className="flex h-full gap-6 p-6">
            {/* Left sidebar with tree view */}
            <div className="w-80 rounded-lg border bg-card p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="px-2 text-lg font-semibold tracking-tight">Folders</h2>
                </div>
                {loadingRoot ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <TreeView
                        expandedItems={state.expanded}
                        selectedItems={state.selected}
                        onExpandedItemsChange={handleExpandedChange}
                        onSelectedItemsChange={(event, itemIds) => {
                            const selectedId = Array.isArray(itemIds) ? itemIds[0] : itemIds;
                            if (selectedId) {
                                handleSelectedChange(event, selectedId);
                            }
                        }}
                        slots={{
                            expandIcon: ChevronRight,
                            collapseIcon: ChevronDown
                        }}
                        className="overflow-auto">
                        {rootFolder && renderTree([rootFolder])}
                    </TreeView>
                )}
            </div>

            {/* Main content area */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <BreadcrumbItem key={crumb.id}>
                                    <BreadcrumbLink
                                        onClick={() => handleSelectedChange(null, crumb.id)}
                                        className={cn(
                                            'cursor-pointer',
                                            state.selected === crumb.id && 'font-semibold text-primary'
                                        )}
                                    >
                                        {crumb.name}
                                    </BreadcrumbLink>
                                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    {userRole === 'admin' && selectedFolder && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddItem(selectedFolder.id, 'folder')}>
                                <Folder className="mr-2 h-4 w-4" />
                                New Folder
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddItem(selectedFolder.id, 'file')}>
                                <File className="mr-2 h-4 w-4" />
                                New File
                            </Button>
                        </div>
                    )}
                </div>

                <FileDisplayArea
                    selectedFolder={selectedFolder}
                    onFileAction={handleFileAction}
                    userRole={userRole}
                    isLoading={loadingFolder}
                    isUpdating={loadingDelete}
                    fileToDelete={state.selectedFile?.id}
                />
            </div>

            {/* Dialogs */}
            <FileDialog
                isOpen={isAddFileDialogOpen}
                onClose={() => setIsAddFileDialogOpen(false)}
                onSave={handleSaveFile}
                isEditMode={isEditMode}
                fileName={newFileName}
                fileSQL={newFileSQL}
                onFileNameChange={setNewFileName}
                onFileSQLChange={setNewFileSQL}
                isSaving={loadingCreate || loadingUpdate}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => state.selectedFile && deleteExistingItem({ id: state.selectedFile.id })}
                file={state.selectedFile}
                isDeleting={loadingDelete}
            />
        </div>
    );
}
