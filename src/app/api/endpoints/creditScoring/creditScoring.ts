import cpClient from '@/utils/cpClient';

export const scoreChartScore = (params: any) =>
    cpClient({
        method: 'get',
        url: `api/chartdata`,
        params
    });
