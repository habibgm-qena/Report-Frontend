import  cpClient  from '@/utils/cpClient';

export const getFolderContents = (params: { id?: string }) =>
    cpClient({
        method: 'get',
        url: `/api/folders`,
        params
    }); 