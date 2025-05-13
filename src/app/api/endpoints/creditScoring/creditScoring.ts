import cpClient from '@/utils/cpClient';

export const makeCreditScore = (data: any) =>
    cpClient({
        method: 'post',
        url: `api/v1/credit-scoring/score-credit/`,
        data
    });
