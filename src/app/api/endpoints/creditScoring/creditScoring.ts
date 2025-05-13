import cpClient from '@/utils/cpClient';

export const scoreChartScore = (params: any) =>
    cpClient({
        method: 'get',
        url: `api/chartdata`,
        params
    });

export const agriRecommend = (data: any) =>
    cpClient({
        method: 'post',
        url: `https://klted5twxn3rl3czlgn4aixgs40jrttq.lambda-url.us-east-1.on.aws/`,
        data
    });
