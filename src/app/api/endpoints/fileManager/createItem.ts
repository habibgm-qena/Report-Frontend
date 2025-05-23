import  cpClient  from '@/utils/cpClient';
import { FileType, FolderType } from '@/services/folderService';

export const createItem = (data: { parentId: string; item: Partial<FileType | FolderType> }) =>
    cpClient({
        method: 'post',
        url: `/api/folders`,
        data
    }); 