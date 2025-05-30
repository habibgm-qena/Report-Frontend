// src/lib/api.ts

// Types (can be shared or redefined if not importing from component)
export type FileType = {
    id: string;
    name: string;
    type: 'file';
    sql?: string;
    databaseId?: string;
};

export type FolderType = {
    id: string;
    name: string;
    type: 'folder';
    children: (FileType | FolderType)[];
};

export type FileSystemItem = FileType | FolderType;

// Initial mock data - this would be on a server
let mockFileSystem: FolderType[] = [
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

const SIMULATED_DELAY = 1000; // ms

// Helper to find an item and its parent
const findItemRecursive = (
    items: FileSystemItem[],
    itemId: string,
    parent: FolderType | null = null
): { item: FileSystemItem | null; parent: FolderType | null; index: number } => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === itemId) {
            return { item, parent, index: i };
        }
        if (item.type === 'folder') {
            const found = findItemRecursive(item.children, itemId, item);
            if (found.item) return found;
        }
    }
    return { item: null, parent: null, index: -1 };
};

const findFolderRecursive = (items: FileSystemItem[], folderId: string): FolderType | null => {
    for (const item of items) {
        if (item.type === 'folder') {
            if (item.id === folderId) {
                return item;
            }
            const found = findFolderRecursive(item.children, folderId);
            if (found) return found;
        }
    }
    return null;
};

export const fetchFileSystem = (): Promise<FolderType[]> => {
    console.log('[API] Fetching initial file system');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockFileSystem))); // Deep copy
        }, SIMULATED_DELAY);
    });
};

export const fetchFolderContents = (folderId: string): Promise<(FileType | FolderType)[]> => {
    console.log(`[API] Fetching contents for folder: ${folderId}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const folder = findFolderRecursive(mockFileSystem, folderId);
            if (folder) {
                resolve(JSON.parse(JSON.stringify(folder.children))); // Deep copy
            } else {
                reject(new Error('Folder not found'));
            }
        }, SIMULATED_DELAY);
    });
};

export const addFileSystemItem = (parentId: string, newItem: FileSystemItem): Promise<FileSystemItem> => {
    console.log(`[API] Adding item to folder: ${parentId}`, newItem);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const parentFolder = findFolderRecursive(mockFileSystem, parentId);
            if (parentFolder) {
                parentFolder.children.push(newItem);
                resolve(JSON.parse(JSON.stringify(newItem)));
            } else {
                reject(new Error('Parent folder not found'));
            }
        }, SIMULATED_DELAY);
    });
};

export const updateFileSystemItem = (
    itemId: string,
    updatedItemData: Partial<FileType | FolderType>
): Promise<FileSystemItem> => {
    console.log(`[API] Updating item: ${itemId}`, updatedItemData);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { item } = findItemRecursive(mockFileSystem, itemId);
            if (item) {
                Object.assign(item, updatedItemData);
                resolve(JSON.parse(JSON.stringify(item)));
            } else {
                reject(new Error('Item not found for update'));
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteFileSystemItem = (itemId: string): Promise<{ id: string }> => {
    console.log(`[API] Deleting item: ${itemId}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { item, parent, index } = findItemRecursive(mockFileSystem, itemId);
            if (item) {
                if (item.type === 'folder' && item.children.length > 0) {
                    return reject(new Error('Cannot delete folder with files in it'));
                }
                if (parent) {
                    parent.children.splice(index, 1);
                    resolve({ id: itemId });
                } else {
                    // Root folder deletion (optional, handle as needed)
                    mockFileSystem = mockFileSystem.filter((rootItem) => rootItem.id !== itemId) as FolderType[];
                    resolve({ id: itemId });
                }
            } else {
                reject(new Error('Item not found for deletion'));
            }
        }, SIMULATED_DELAY);
    });
};
