'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { ChevronDown, ChevronRight, File, Loader2, Folder, ChevronLeft } from 'lucide-react';
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
    treeActionsAtom,
    TreeNode
} from '@/store/fileManager';
import { toast } from "@/components/ui/notification-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { NotificationToaster } from "@/components/ui/notification-toast"

interface FileManagerProps {
    userRole: 'admin' | 'user';
}

type FileSystemItem = FileType | TreeNode;

export function FileManager({ userRole }: FileManagerProps) {
    const [state, setState] = useAtom(fileManagerAtom);
    const [, setSelectedFolder] = useAtom(selectedFolderAtom);
    const [, setBreadcrumbs] = useAtom(breadcrumbsAtom);
    const [, dispatch] = useAtom(treeActionsAtom);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [rootFolderId, setRootFolderId] = useState<string>('root');

    const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<TreeNode | null>(null);
    const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [newFileSQL, setNewFileSQL] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [navigationHistory, setNavigationHistory] = useState<string[]>(['root']);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

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

    const refreshCurrentFolder = async () => {
        if (state.selectedFolder) {
            try {
                const response = await getFolderContents({ id: state.selectedFolder.id });
                const folder = response.data;
                setState(prev => {
                    const newFolderTree = { ...prev.treeData };
                    newFolderTree[folder.id] = {
                        ...folder,
                        children: folder.children || []
                    };
                    return {
                        ...prev,
                        treeData: newFolderTree,
                        selectedFolder: folder
                    };
                });
            } catch (error) {
                console.error('Error refreshing folder:', error);
            }
        }
    };

    const loadFolder = async (folderId: string) => {
        dispatch({ type: 'SET_LOADING', payload: { folderId, isLoading: true } });
        try {
            const response = await getFolderContents({ id: folderId });
            dispatch({ type: 'UPDATE_FOLDER', payload: { folder: response.data } });
        } catch (error) {
            console.error('Error loading folder:', error);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: { folderId, isLoading: false } });
        }
    };

    // Handle expand/collapse
    const handleExpandedChange = async (_event: React.SyntheticEvent | null, itemIds: string[]) => {
        const currentExpanded = state.expanded;
        const newlyExpanded = itemIds.filter(id => !currentExpanded.includes(id));
        const collapsed = currentExpanded.filter(id => !itemIds.includes(id));

        // Handle collapse
        collapsed.forEach(id => {
            dispatch({ type: 'COLLAPSE_FOLDER', payload: { folderId: id } });
        });

        // Handle expand
        for (const id of newlyExpanded) {
            dispatch({ type: 'EXPAND_FOLDER', payload: { folderId: id } });
            const node = state.treeData[id];
            if (node && !node.isLoaded && !node.isLoading) {
                await loadFolder(id);
            }
        }
    };

    // Handle folder selection
    const handleSelectedChange = async (_event: React.SyntheticEvent | null, itemIds: string | null) => {
        if (!itemIds) return;
        
        const folder = state.treeData[itemIds];
        if (!folder) return;

        // Update breadcrumbs immediately before loading folder contents
        await updateBreadcrumbs(folder);
        
        dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
        
        if (!folder.isLoaded) {
            await loadFolder(itemIds);
        }
    };

    // Handle opening a folder
    const handleOpenFolder = async (folderId: string, asRoot: boolean = false) => {
        const folder = state.treeData[folderId];
        if (!folder) return;

        // Update breadcrumbs immediately
        await updateBreadcrumbs(folder);

        if (asRoot) {
            setRootFolderId(folderId);
            dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
            
            if (!folder.isLoaded) {
                await loadFolder(folderId);
            }
        } else {
            const newOpenFolders = new Set(openFolders);
            if (newOpenFolders.has(folderId)) {
                newOpenFolders.delete(folderId);
            } else {
                newOpenFolders.add(folderId);
            }
            setOpenFolders(newOpenFolders);
            
            dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
            if (!folder.isLoaded) {
                await loadFolder(folderId);
            }
        }
    };

    // Navigation history handlers
    const canGoBack = currentHistoryIndex > 0;
    const canGoForward = currentHistoryIndex < navigationHistory.length - 1;

    const navigateBack = () => {
        if (!canGoBack) return;
        const newIndex = currentHistoryIndex - 1;
        setCurrentHistoryIndex(newIndex);
        const folderId = navigationHistory[newIndex];
        const folder = state.treeData[folderId];
        if (folder) {
            dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
            updateBreadcrumbs(folder);
        }
    };

    const navigateForward = () => {
        if (!canGoForward) return;
        const newIndex = currentHistoryIndex + 1;
        setCurrentHistoryIndex(newIndex);
        const folderId = navigationHistory[newIndex];
        const folder = state.treeData[folderId];
        if (folder) {
            dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
            updateBreadcrumbs(folder);
        }
    };

    // Add to navigation history
    const addToHistory = (folderId: string) => {
        const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
        if (newHistory[newHistory.length - 1] !== folderId) {
            newHistory.push(folderId);
            setNavigationHistory(newHistory);
            setCurrentHistoryIndex(newHistory.length - 1);
        }
    };

    // Handle folder selection with history
    const handleFolderSelect = (folderId: string) => {
        const folder = state.treeData[folderId];
        if (!folder) return;
        dispatch({ type: 'SELECT_FOLDER', payload: { folder } });
        addToHistory(folderId);
    };

    // Update breadcrumbs helper
    const updateBreadcrumbs = async (currentFolder: TreeNode) => {
        const path = [];
        
        if (currentFolder.id === 'root') {
            path.push({ id: 'root', name: 'Root' });
        } else {
            // Helper function to find the path from a folder to the root
            const findPathToRoot = (folderId: string, visited = new Set<string>()): TreeNode[] => {
                if (visited.has(folderId)) return []; // Prevent cycles
                visited.add(folderId);

                // Find the parent of the current folderId
                let parentNode: TreeNode | null = null;
                for (const [, folder] of Object.entries(state.treeData)) {
                    if (folder.type === 'folder' && folder.children) {
                        const hasChild = folder.children.some(child => child.id === folderId);
                        if (hasChild) {
                            parentNode = folder;
                            break;
                        }
                    }
                }

                if (parentNode) {
                    if (parentNode.id === 'root') {
                        return [state.treeData['root']]; // Return Root node
                    } else {
                        const parentPath = findPathToRoot(parentNode.id, visited);
                        return [...parentPath, parentNode];
                    }
                }
                return []; // Should ideally not happen if tree is consistent
            };

            // Find the path from the current folder's parent to root
            const pathToRoot = findPathToRoot(currentFolder.id);

            // Add the path to breadcrumbs (root first)
            for (const folder of pathToRoot) {
                if (folder) { // Ensure folder is not null/undefined
                    path.push({ id: folder.id, name: folder.name });
                }
            }
            // Add current folder at the end
            path.push({ id: currentFolder.id, name: currentFolder.name });
        }
        
        setBreadcrumbs(path);
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
            createNewItem({ parentId, item: newFolder }).then(() => {
                loadFolder(parentId);
            });
        }
    };

    // Save a new file
    const handleSaveFile = () => {
        if (!state.selectedFolder) return;

        const newFile: Partial<FileType> = {
            id: isEditMode && state.selectedFile ? state.selectedFile.id : `file-${Date.now()}`,
            name: newFileName,
            type: 'file',
            sql: newFileSQL,
            updatedAt: new Date().toISOString()
        };

        if (isEditMode && state.selectedFile) {
            updateExistingItem({ id: state.selectedFile.id, updates: newFile }).then(() => {
                setIsAddFileDialogOpen(false);
                loadFolder(state.selectedFolder!.id);
            });
        } else {
            createNewItem({ parentId: state.selectedFolder.id, item: newFile }).then(() => {
                setIsAddFileDialogOpen(false);
                loadFolder(state.selectedFolder!.id);
            });
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
                toast.success(`File "${file.name}" download started`, {
                    description: "Your file will be downloaded shortly."
                });
                break;
        }
    };

    // Handle folder rename
    const handleFolderRename = async (id: string, newName: string) => {
        await updateExistingItem({ id, updates: { name: newName } });
        loadFolder(id);
    };

    // Handle folder toggle (expand/collapse)
    const handleFolderToggle = async (folderId: string) => {
        const isExpanded = state.expanded.includes(folderId);
        if (isExpanded) {
            dispatch({ type: 'COLLAPSE_FOLDER', payload: { folderId } });
        } else {
            dispatch({ type: 'EXPAND_FOLDER', payload: { folderId } });
            const node = state.treeData[folderId];
            if (node && !node.isLoaded && !node.isLoading) {
                await loadFolder(folderId);
            }
        }
    };

    // Handle folder delete
    const handleFolderDelete = async (folderId: string) => {
        const folder = state.treeData[folderId];
        if (!folder) return;
        
        setFolderToDelete(folder);
        setIsDeleteDialogOpen(true);
    };

    const confirmFolderDelete = async () => {
        if (!folderToDelete) return;

        try {
            await deleteExistingItem({ id: folderToDelete.id });
            toast.success("Folder deleted successfully");

            if (state.selectedFolder?.id === folderToDelete.id) {
                // If we deleted the selected folder, select its parent
                const parentId = folderToDelete.parentId || 'root';
                handleSelectedChange(null, parentId);
            } else {
                // Otherwise just refresh the current folder
                loadFolder(state.selectedFolder?.id || 'root');
            }
        } catch (error) {
            toast.error("Failed to delete folder", {
                description: "An error occurred while deleting the folder."
            });
        }
    };

    // Handle folder refresh
    const handleFolderRefresh = async (folderId: string) => {
        await loadFolder(folderId);
    };

    // Render tree items recursively
    const renderTree = (nodes: (TreeNode | FileType)[]) => {
        if (!nodes) return null;
        return nodes.map((node) => {
            if (node.type === 'folder') {
                const isExpanded = state.expanded.includes(node.id);
                const isOpen = openFolders.has(node.id);
                const isSelected = state.selectedFolder?.id === node.id;
                const treeNode = state.treeData[node.id] || node as TreeNode;
                const children = treeNode.children || [];

                return (
                    <FileTreeItem
                        key={node.id}
                        node={treeNode}
                        isExpanded={isExpanded}
                        isOpen={isOpen}
                        isSelected={isSelected}
                        isLoading={treeNode.isLoading}
                        userRole={userRole}
                        onAddItem={handleAddItem}
                        onRename={handleFolderRename}
                        onDelete={handleFolderDelete}
                        onRefresh={handleFolderRefresh}
                        onSelect={handleFolderSelect}
                        onToggle={handleFolderToggle}
                        onOpenFolder={handleOpenFolder}
                    >
                        {isExpanded && children.length > 0 && renderTree(children)}
                    </FileTreeItem>
                );
            }
            return null;
        });
    };

    // Initial load
    useEffect(() => {
        const loadRoot = async () => {
            setIsLoading(true);
            try {
                const response = await getFolderContents({ id: 'root' });
                const rootFolder = response.data;
                dispatch({ type: 'UPDATE_FOLDER', payload: { folder: rootFolder } });
                dispatch({ type: 'SELECT_FOLDER', payload: { folder: rootFolder } });
            } catch (error) {
                console.error('Error loading root folder:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRoot();
    }, [dispatch]);

    return (
        <>
            <div className="flex h-full gap-6 p-6">
                {/* Left sidebar with tree view */}
                <div className="w-80 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="mb-4">
                        <h2 className="px-2 text-lg font-semibold tracking-tight">Folders</h2>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-4 animate-spin text-primary" />
                        </div>
                    ) : (
                        <TreeView
                            expandedItems={state.expanded}
                            selectedItems={state.selected}
                            onExpandedItemsChange={handleExpandedChange}
                            onSelectedItemsChange={(event, itemIds) => {
                                const selectedId = Array.isArray(itemIds) ? itemIds[0] : itemIds;
                                if (selectedId) {
                                    handleFolderSelect(selectedId);
                                }
                            }}
                            slots={{
                                expandIcon: () => <></>,
                                collapseIcon: () => <></>
                            }}
                            className="overflow-auto">
                            {state.treeData[rootFolderId] && renderTree([state.treeData[rootFolderId]])}
                        </TreeView>
                    )}
                </div>

                {/* Main content area */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={navigateBack}
                                disabled={!canGoBack}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={navigateForward}
                                disabled={!canGoForward}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Breadcrumb>
                            <BreadcrumbList>
                                {state.breadcrumbs.map((crumb, index) => (
                                    <BreadcrumbItem key={crumb.id}>
                                        <BreadcrumbLink
                                            onClick={() => handleSelectedChange(null, crumb.id)}
                                            className={cn(
                                                'cursor-pointer hover:text-primary',
                                                state.selectedFolder?.id === crumb.id && 'font-semibold text-primary'
                                            )}
                                        >
                                            {crumb.name}
                                        </BreadcrumbLink>
                                        {index < state.breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </BreadcrumbItem>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>

                        {userRole === 'admin' && state.selectedFolder && (
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddItem(state.selectedFolder!.id, 'folder')}>
                                    <Folder className="mr-2 h-4 w-4" />
                                    New Folder
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddItem(state.selectedFolder!.id, 'file')}>
                                    <File className="mr-2 h-4 w-4" />
                                    New File
                                </Button>
                            </div>
                        )}
                    </div>

                    <FileDisplayArea
                        selectedFolder={state.selectedFolder}
                        onFileAction={handleFileAction}
                        userRole={userRole}
                        isLoading={state.treeData[state.selectedFolder?.id || '']?.isLoading}
                        isUpdating={isDeleteDialogOpen}
                        fileToDelete={state.selectedFile?.id}
                    />
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
                isSaving={false}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setFolderToDelete(null);
                }}
                onConfirm={confirmFolderDelete}
                title="Delete Folder"
                description={`Are you sure you want to delete "${folderToDelete?.name}"? This action cannot be undone and all contents will be permanently deleted.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />

            <NotificationToaster />
        </>
    );
}
