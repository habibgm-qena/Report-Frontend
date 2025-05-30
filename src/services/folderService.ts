import axios from 'axios';

export interface FileType {
    id: string;
    name: string;
    type: 'file';
    sql?: string;
    updatedAt?: string;
    size?: number;
    description?: string;
    databaseId?: string;
}

export interface FolderType {
    id: string;
    name: string;
    type: 'folder';
    parentId?: string;
    children: (FileType | FolderType)[];
}

export type FileSystemItem = FileType | FolderType;

export const folderService = {
    getFolderContents: (folderId?: string) => {
        return axios.get(`/api/folders${folderId ? `?id=${folderId}` : ''}`);
    },

    createItem: (parentId: string, item: Partial<FileType | FolderType>) => {
        return axios.post('/api/folders', { parentId, item });
    },

    updateItem: (id: string, updates: Partial<FileType | FolderType>) => {
        return axios.patch('/api/folders', { id, updates });
    },

    deleteItem: (id: string) => {
        return axios.delete(`/api/folders?id=${id}`);
    }
};
