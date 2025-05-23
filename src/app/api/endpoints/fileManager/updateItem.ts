import  cpClient  from '@/utils/cpClient';
import { FileType, FolderType } from '@/services/folderService';

export const updateItem = (data: { id: string; updates: Partial<FileType | FolderType> }) =>
    cpClient({
        method: 'patch',
        url: `/api/folders`,
        data
    }); 