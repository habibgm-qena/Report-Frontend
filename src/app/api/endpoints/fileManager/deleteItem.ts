import  cpClient  from '@/utils/cpClient';

export const deleteItem = (params: { id: string }) =>
    cpClient({
        method: 'delete',
        url: `/api/folders`,
        params
    }); 