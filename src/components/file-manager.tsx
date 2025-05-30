'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { createItem, deleteItem, getFolderContents, updateItem } from '@/app/api/endpoints/fileManager';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NotificationToaster, toast } from '@/components/ui/notification-toast';
import { useSiteConfig } from '@/hooks/use-site-config';
import { useGenericMethod } from '@/hooks/useGenericMethod';
import $axios from '@/lib/axiosInstance';
import { cn } from '@/lib/utils';
import { FileType, FolderType } from '@/services/folderService';
import {
    TreeNode,
    ViewMode,
    breadcrumbsAtom,
    fileManagerAtom,
    selectedFolderAtom,
    sortByAtom,
    sortOrderAtom,
    treeActionsAtom,
    viewModeAtom
} from '@/store/fileManager';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';

import { DeleteDialog } from './DeleteDialog';
import { FileActions } from './FileActions';
import { FileDialog } from './FileDialog';
import { FileDisplayArea } from './FileDisplayArea';
import { FileTreeItem } from './FileTreeItem';
import { ViewSortControls } from './ViewSortControls';
import { useAtom } from 'jotai';
import { ChevronDown, ChevronLeft, ChevronRight, File, Folder, FolderInput, Loader2, RefreshCw } from 'lucide-react';

interface Database {
    id: string;
    name: string;
}

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

    const [viewMode, setViewMode] = useAtom(viewModeAtom);
    const [sortBy, setSortBy] = useAtom(sortByAtom);
    const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);

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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { name, logo } = useSiteConfig();

    // Generic method hooks
    const {
        data: rootFolder,
        loading: loadingRoot,
        handleAction: fetchRoot
    } = useGenericMethod({
        method: 'GET',
        apiMethod: getFolderContents,
        successMessage: 'Root folder loaded successfully'
    });

    const {
        data: currentFolder,
        loading: loadingFolder,
        handleAction: fetchFolder
    } = useGenericMethod({
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
            fetchRoot({ id: 'root' }); // Refresh the entire tree from root
        }
    });

    const refreshCurrentFolder = async () => {
        if (state.selectedFolder) {
            try {
                const response = await getFolderContents({ id: state.selectedFolder.id });
                const folder = response.data;
                setState((prev) => {
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
        const newlyExpanded = itemIds.filter((id) => !currentExpanded.includes(id));
        const collapsed = currentExpanded.filter((id) => !itemIds.includes(id));

        // Handle collapse
        collapsed.forEach((id) => {
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
                        const hasChild = folder.children.some((child) => child.id === folderId);
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
                if (folder) {
                    // Ensure folder is not null/undefined
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

    // Fetch databases
    useEffect(() => {
        const fetchDatabases = async () => {
            try {
                const { data } = await $axios.get('/database/', {
                    headers: {
                        'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
                        ROLE: 'admin'
                    }
                });
                setDatabases(data);
            } catch (error) {
                console.error('Error fetching databases:', error);
                toast.error('Failed to fetch databases');
            }
        };

        fetchDatabases();
    }, []);

    const handleAddDatabase = async (newDatabase: { name: string; id: string }) => {
        try {
            setDatabases((prev) => [...prev, { id: newDatabase.id, name: newDatabase.name }]);
            toast.success('Database added successfully');
        } catch (error) {
            console.error('Error adding database:', error);
            toast.error('Failed to add database');
        }
    };

    // Update handleSaveFile to include database information
    const handleSaveFile = async () => {
        if (!state.selectedFolder) return;
        setIsSaving(true);

        try {
            if (isEditMode && state.selectedFile) {
                console.log('state.selectedFile: ', state.selectedFile);

                const { data } = await $axios.patch(
                    `/queries/${state.selectedFile.id}/`,
                    {
                        sql_query: newFileSQL,
                        name: newFileName
                    },
                    {
                        headers: {
                            'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
                            ROLE: userRole
                        }
                    }
                );
                toast.success('File updated successfully');
                setIsAddFileDialogOpen(false);
                await loadFolder(state.selectedFolder.id);
            } else {
                const newFile: Partial<FileType> = {
                    id: isEditMode && state.selectedFile ? state.selectedFile.id : `file-${Date.now()}`,
                    name: newFileName,
                    type: 'file',
                    sql: newFileSQL,
                    updatedAt: new Date().toISOString(),
                    databaseId: selectedDatabase // Add database ID to the file
                };

                if (isEditMode && state.selectedFile) {
                    await updateExistingItem({ id: state.selectedFile.id, updates: newFile });
                    setIsAddFileDialogOpen(false);
                    await loadFolder(state.selectedFolder.id);
                } else {
                    await createNewItem({ parentId: state.selectedFolder.id, item: newFile });
                    setIsAddFileDialogOpen(false);
                    await loadFolder(state.selectedFolder.id);
                }
                setSelectedDatabase(''); // Reset selected database after save
            }
        } catch (error) {
            console.error('Error saving file:', error);
            toast.error('Failed to save file');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle file actions
    const handleFileAction = async (
        action: 'edit' | 'delete' | 'download',
        file: FileType,
        event?: React.MouseEvent
    ) => {
        // Stop event propagation if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        try {
            switch (action) {
                case 'edit':
                    setState((prev) => ({ ...prev, selectedFile: file }));
                    setNewFileName(file.name);
                    setNewFileSQL(file.sql || (file as any).sql_query || '');
                    setIsEditMode(true);
                    setIsAddFileDialogOpen(true);
                    break;
                case 'delete': {
                    const { data } = await $axios.delete(`/queries/${file.id}/`, {
                        headers: {
                            'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
                            ROLE: userRole
                        }
                    });
                    if (state.selectedFolder) {
                        setState((prev) => ({
                            ...prev,
                            selectedFile: null, // Clear selected file
                            selectedFolder: {
                                ...prev.selectedFolder!,
                                children: prev.selectedFolder!.children.filter((item) => item.id !== file.id)
                            }
                        }));
                    }
                    toast.success('File deleted successfully');
                    break;
                }
                case 'download': {
                    const { data } = await $axios.get(`/queries/${file.id}/execute`, {
                        headers: {
                            'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY,
                            ROLE: userRole
                        }
                    });
                    const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${file.name}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success(`File "${file.name}.csv" download started`, {
                        description: 'Your file will be downloaded shortly.'
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in handleFileAction:', error);
            toast.error('An error occurred while performing the action');
        }
    };

    // Handle folder rename
    const handleFolderRename = async (id: string, newName: string) => {
        try {
            await updateExistingItem({ id, updates: { name: newName } });

            // Update the tree data with the new name
            setState((prev) => ({
                ...prev,
                treeData: {
                    ...prev.treeData,
                    [id]: {
                        ...prev.treeData[id],
                        name: newName
                    }
                }
            }));

            // If this is the selected folder, update breadcrumbs
            if (state.selectedFolder?.id === id) {
                const updatedBreadcrumbs = state.breadcrumbs.map((crumb: { id: string; name: string }) =>
                    crumb.id === id ? { ...crumb, name: newName } : crumb
                );
                setBreadcrumbs(updatedBreadcrumbs);
            }

            // Refresh the parent folder to ensure consistent state
            const folder = state.treeData[id];
            if (folder && folder.parentId) {
                await loadFolder(folder.parentId);
            } else {
                // If it's the root folder or no parent found, refresh the current folder
                await loadFolder(id);
            }

            toast.success('Folder renamed successfully');
        } catch (error) {
            console.error('Error renaming folder:', error);
            toast.error('Failed to rename folder');

            // Refresh the folder to ensure consistent state
            await loadFolder(id);
        }
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
            toast.success('Folder deleted successfully');

            if (state.selectedFolder?.id === folderToDelete.id) {
                // If we deleted the selected folder, select its parent
                const parentId = folderToDelete.parentId || 'root';
                handleSelectedChange(null, parentId);
            } else {
                // Otherwise just refresh the current folder
                loadFolder(state.selectedFolder?.id || 'root');
            }
        } catch (error) {
            toast.error('Failed to delete folder', {
                description: 'An error occurred while deleting the folder.'
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
                const treeNode = state.treeData[node.id] || (node as TreeNode);
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
                        onOpenFolder={handleOpenFolder}>
                        {isExpanded && children.length > 0 && renderTree(children)}
                    </FileTreeItem>
                );
            }
            return null;
        });
    };

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            setViewMode(mode);
        },
        [setViewMode]
    );

    const handleSortChange = useCallback(
        (newSortBy: 'name' | 'date' | 'size') => {
            setSortBy(newSortBy);
        },
        [setSortBy]
    );

    const handleSortOrderChange = useCallback(() => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }, [sortOrder, setSortOrder]);

    const handleCollapseAll = () => {
        setState((prev) => ({
            ...prev,
            expanded: ['root'] // Only keep root expanded
        }));
    };

    const handleRefreshAll = async () => {
        setIsLoading(true);
        try {
            const response = await getFolderContents({ id: 'root' });
            const rootFolder = response.data;
            dispatch({ type: 'UPDATE_FOLDER', payload: { folder: rootFolder } });
            // Also refresh the currently selected folder if it's not root
            if (state.selectedFolder && state.selectedFolder.id !== 'root') {
                await loadFolder(state.selectedFolder.id);
            }
        } catch (error) {
            console.error('Error refreshing folders:', error);
        } finally {
            setIsLoading(false);
        }
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

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <>
            <div className='flex h-full gap-6 p-6'>
                {/* Left sidebar with tree view */}
                <div
                    className={cn(
                        'bg-background border-border/10 relative flex flex-col overflow-hidden border-r shadow-lg transition-all duration-500 ease-in-out',
                        isSidebarCollapsed ? 'w-14' : 'w-80'
                    )}>
                    {/* Logo and Name Section */}
                    <div
                        className={cn(
                            'border-b bg-gray-50/50 transition-all duration-500',
                            isSidebarCollapsed ? 'p-2' : 'p-4'
                        )}>
                        <div className='flex items-center gap-3'>
                            <div
                                className={cn(
                                    'relative overflow-hidden rounded transition-all duration-500',
                                    isSidebarCollapsed ? 'h-8 w-8' : `h-${logo.height} w-${logo.width}`
                                )}>
                                <Image
                                    src={logo.src}
                                    alt={logo.alt}
                                    width={isSidebarCollapsed ? 32 : logo.width}
                                    height={isSidebarCollapsed ? 32 : logo.height}
                                    className='object-contain'
                                    priority
                                />
                            </div>
                            <span
                                className={cn(
                                    'truncate text-lg font-semibold text-gray-900 transition-all duration-500',
                                    isSidebarCollapsed ? 'w-0 opacity-0' : 'opacity-100'
                                )}>
                                {name}
                            </span>
                        </div>
                    </div>

                    {/* Toolbar Section */}
                    <div
                        className={cn(
                            'bg-muted/5 border-border/10 border-b transition-all duration-500',
                            isSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-4'
                        )}>
                        <div className='flex items-center justify-between'>
                            <div
                                className={cn(
                                    'flex items-center gap-2 transition-all duration-500',
                                    isSidebarCollapsed ? 'ml-0 w-full justify-center' : 'ml-auto'
                                )}>
                                <div
                                    className={cn(
                                        'flex items-center gap-2 transition-all duration-500',
                                        isSidebarCollapsed ? 'w-0 scale-0' : 'w-auto scale-100'
                                    )}>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={handleCollapseAll}
                                        className='hover:bg-accent transition-colors'
                                        title='Collapse all folders'>
                                        <FolderInput className='text-foreground/70 h-4 w-4' />
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={handleRefreshAll}
                                        disabled={isLoading}
                                        className='hover:bg-accent transition-colors'
                                        title='Refresh all folders'>
                                        <RefreshCw
                                            className={cn('text-foreground/70 h-4 w-4', isLoading && 'animate-spin')}
                                        />
                                    </Button>
                                </div>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleToggleSidebar}
                                    className='hover:bg-accent transition-colors'
                                    title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                                    {isSidebarCollapsed ? (
                                        <ChevronRight className='text-foreground/70 h-4 w-4' />
                                    ) : (
                                        <ChevronLeft className='text-foreground/70 h-4 w-4' />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'transition-all duration-500 ease-in-out',
                            isSidebarCollapsed ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                        )}>
                        <div className='flex-1 overflow-hidden p-2 transition-all duration-200 hover:overflow-auto'>
                            {isLoading ? (
                                <div className='flex items-center justify-center p-8'>
                                    <Loader2 className='text-foreground/50 h-5 w-5 animate-spin' />
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
                                    className='scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent overflow-auto'>
                                    {state.treeData[rootFolderId] && renderTree([state.treeData[rootFolderId]])}
                                </TreeView>
                            )}
                        </div>
                    </div>

                    {/* Minimal Actions in Collapsed State */}
                    <div
                        className={cn(
                            'absolute inset-x-0 top-16 flex flex-col items-center gap-2 px-2 transition-all duration-500',
                            isSidebarCollapsed
                                ? 'translate-y-0 opacity-100'
                                : 'pointer-events-none -translate-y-4 opacity-0'
                        )}>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='hover:bg-accent h-9 w-full transition-colors'
                            onClick={handleRefreshAll}
                            title='Refresh All'>
                            <RefreshCw className={cn('text-foreground/70 h-4 w-4', isLoading && 'animate-spin')} />
                        </Button>
                    </div>
                </div>

                {/* Main content area */}
                <div className='flex flex-1 flex-col space-y-4'>
                    <div className='flex items-center justify-between border-b p-4'>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-1'>
                                <Button variant='ghost' size='icon' onClick={navigateBack} disabled={!canGoBack}>
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>
                                <Button variant='ghost' size='icon' onClick={navigateForward} disabled={!canGoForward}>
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                            </div>

                            <Breadcrumb>
                                <BreadcrumbList>
                                    {state.breadcrumbs.map((crumb, index) => (
                                        <BreadcrumbItem key={crumb.id}>
                                            <BreadcrumbLink
                                                onClick={() => handleSelectedChange(null, crumb.id)}
                                                className={cn(
                                                    'hover:text-primary cursor-pointer',
                                                    state.selectedFolder?.id === crumb.id &&
                                                        'text-primary font-semibold'
                                                )}>
                                                {crumb.name}
                                            </BreadcrumbLink>
                                            {index < state.breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                        </BreadcrumbItem>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className='flex items-center gap-4'>
                            <ViewSortControls
                                viewMode={viewMode}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onViewModeChange={handleViewModeChange}
                                onSortChange={handleSortChange}
                                onSortOrderChange={handleSortOrderChange}
                            />

                            {userRole === 'admin' && state.selectedFolder && (
                                <div className='flex gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleAddItem(state.selectedFolder!.id, 'folder')}>
                                        <Folder className='mr-2 h-4 w-4' />
                                        New Folder
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleAddItem(state.selectedFolder!.id, 'file')}>
                                        <File className='mr-2 h-4 w-4' />
                                        New File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <FileDisplayArea
                        selectedFolder={state.selectedFolder}
                        onFileAction={handleFileAction}
                        userRole={userRole}
                        isLoading={state.treeData[state.selectedFolder?.id || '']?.isLoading}
                        isUpdating={isDeleteDialogOpen}
                        fileToDelete={state.selectedFile?.id}
                        viewMode={viewMode}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                    />
                </div>
            </div>

            {/* Dialogs */}
            <FileDialog
                isOpen={isAddFileDialogOpen}
                onClose={() => {
                    setIsAddFileDialogOpen(false);
                    setSelectedDatabase(''); // Reset selected database when closing
                }}
                onSave={handleSaveFile}
                isEditMode={isEditMode}
                fileName={newFileName}
                fileSQL={newFileSQL}
                onFileNameChange={setNewFileName}
                onFileSQLChange={setNewFileSQL}
                isSaving={isSaving}
                databases={databases}
                selectedDatabase={selectedDatabase}
                onDatabaseChange={setSelectedDatabase}
                onAddDatabase={handleAddDatabase}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setFolderToDelete(null);
                }}
                onConfirm={confirmFolderDelete}
                title='Delete Folder'
                description={`Are you sure you want to delete "${folderToDelete?.name}"? This action cannot be undone and all contents will be permanently deleted.`}
                confirmText='Delete'
                cancelText='Cancel'
                variant='destructive'
            />

            <NotificationToaster />
        </>
    );
}
