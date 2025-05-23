'use client';

import { useEffect, useState } from 'react';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { ChevronDown, ChevronRight, File, Loader2, Folder } from 'lucide-react';
import { createItem, deleteItem, getFolderContents, updateItem } from '@/app/api/endpoints/fileManager';
import { useGenericMethod } from '@/hooks/useGenericMethod';
import { FileType, FolderType } from '@/services/folderService';
import { FileTreeItem } from './FileTreeItem';
import { FileActions } from './FileActions';
import { FileDialog } from './FileDialog';
import { DeleteDialog } from './DeleteDialog';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileManagerProps {
    userRole: 'admin' | 'user';
}

type FileSystemItem = FileType | FolderType;

export function FileManager({ userRole }: FileManagerProps) {
    const [expanded, setExpanded] = useState<string[]>(['root']);
    const [selected, setSelected] = useState<string>('root');
    const [loadingFolderId, setLoadingFolderId] = useState<string | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: FolderType }>({});
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
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
            setSelected(currentFolder.id);
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
                setExpandedFolders(prev => ({ ...prev, [currentFolder.id]: currentFolder }));
            }
        }
    }, [currentFolder]);

    const refreshCurrentFolder = () => {
        if (selectedFolder) {
            fetchFolder({ id: selectedFolder.id });
        }
    };

    // Handle expand/collapse
    const handleExpandedChange = async (_event: React.SyntheticEvent | null, itemIds: string[]) => {
        setExpanded(itemIds);
        // Load children for any newly expanded folder
        for (const id of itemIds) {
            if (!expandedFolders[id]) {
                setLoadingFolderId(id);
                const response = await getFolderContents({ id });
                setExpandedFolders(prev => ({ ...prev, [id]: response.data }));
                setLoadingFolderId(null);
            }
        }
    };

    // Handle selection
    const handleSelectedChange = async (_event: React.SyntheticEvent | null, itemIds: string | null) => {
        if (!itemIds) return;
        setSelected(itemIds);
        setLoadingFolderId(itemIds);
        fetchFolder({ id: itemIds });
        setLoadingFolderId(null);
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
                type: 'folder'
            };
            createNewItem({ parentId, item: newFolder });
        }
    };

    // Save a new file
    const handleSaveFile = () => {
        if (!selectedFolder) return;

        const newFile: Partial<FileType> = {
            id: isEditMode && selectedFile ? selectedFile.id : `file-${Date.now()}`,
            name: newFileName,
            type: 'file',
            sql: newFileSQL
        };

        if (isEditMode && selectedFile) {
            updateExistingItem({ id: selectedFile.id, updates: newFile });
        } else {
            createNewItem({ parentId: selectedFolder.id, item: newFile });
        }
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

    // Handle file download (dummy function)
    const handleDownloadFile = (file: FileType) => {
        console.log(`Downloading file: ${file.name}`);
        alert(`File ${file.name} would be downloaded in a real application`);
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
                const isExpanded = expanded.includes(node.id);
                const isLoading = loadingFolderId === node.id;
                return (
                    <FileTreeItem
                        key={node.id}
                        node={node}
                        isExpanded={isExpanded}
                        isLoading={isLoading}
                        userRole={userRole}
                        onAddItem={handleAddItem}
                        onRename={handleFolderRename}>
                        {isExpanded && expandedFolders[node.id]?.children && renderTree(expandedFolders[node.id].children)}
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
                <TreeView
                    expandedItems={expanded}
                    selectedItems={selected}
                    onExpandedItemsChange={handleExpandedChange}
                    onSelectedItemsChange={handleSelectedChange}
                    slots={{
                        expandIcon: ChevronRight,
                        collapseIcon: ChevronDown
                    }}
                    className="overflow-auto">
                    {rootFolder && renderTree([rootFolder])}
                </TreeView>
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
                                            'cursor-pointer hover:underline',
                                            selected === crumb.id && 'font-semibold text-primary'
                                        )}>
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

                {/* File list */}
                <div className="rounded-lg border bg-card">
                    {loadingFolderId === selected ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !selectedFolder?.children?.length ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                            <File className="h-8 w-8 mb-4 text-muted-foreground/50" />
                            <p className="text-sm">No files or folders available</p>
                            {userRole === 'admin' && (
                                <p className="text-sm mt-2">
                                    Click the buttons above to add new items
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {selectedFolder.children
                                .filter((item): item is FileType => item.type === 'file')
                                .map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{file.name}</span>
                                        </div>
                                        <FileActions
                                            file={file}
                                            userRole={userRole}
                                            onEdit={handleEditFile}
                                            onDelete={handleDeleteConfirm}
                                            onDownload={handleDownloadFile}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
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
                onConfirm={() => selectedFile && deleteExistingItem({ id: selectedFile.id })}
                file={selectedFile}
                isDeleting={loadingDelete}
            />
        </div>
    );
}
