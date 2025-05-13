'use client';

import React, { use, useEffect, useState } from 'react';

import { scoreChartScore } from '@/app/api/endpoints/creditScoring/creditScoring';
import { useLocation } from '@/hooks/location_context';
import { useGenericMethod } from '@/hooks/useGenericMethod';

import { Loader } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DataPoint {
    year: string;
    score: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
    }>;
}

interface CustomAxisTickProps {
    x?: number;
    y?: number;
    payload?: {
        value: string;
    };
}

interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: DataPoint;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className='rounded-md bg-zinc-800/90 px-3 py-1.5 text-xs text-white shadow-sm'>
                Evaluated score: {payload[0].value}
            </div>
        );
    }
    return null;
};

const CustomAxisTick: React.FC<CustomAxisTickProps> = ({ x = 0, y = 0, payload }) => (
    <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor='middle' fill='#6B7280' className='text-xs'>
            {payload?.value}
        </text>
    </g>
);

const CustomDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
    if (payload?.year === '2024') {
        return <circle cx={cx} cy={cy} r={4} fill='#FFF' stroke='#000' strokeWidth={2} />;
    }
    return null;
};

const AreaChartComponent: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const { lat, lng, setLat, setLng } = useLocation();
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [ymax, setYmax] = useState(1);
    const [ymin, setYmin] = useState(-1);

    // useEffect(() => {
    //     const timer = setTimeout(() => setLoading(false), 10000); // 10 seconds
    //     return () => clearTimeout(timer);
    // }, []);

    const nvdiScores = useGenericMethod({
        method: 'GET',
        apiMethod: scoreChartScore,
        skipWithOutParams: true,
        onSuccess: (data) => {
            console.log('Data fetched successfully:', data);
            const formattedData = data.map((item: any) => ({
                year: item.year,
                score: item.score
            }));
            setChartData(formattedData);
            setYmax(Math.max(...formattedData.map((item: any) => item.score)) + 0.2);
            setYmin(Math.min(...formattedData.map((item: any) => item.score)) - 0.2);
            setLoading(false);
        },
        onError: (error) => {
            setLoading(false);
            console.error('Error fetching data:', error);
        }
    });

    useEffect(() => {
        if (lat && lng) {
            nvdiScores.handleAction({
                lat: lat,
                lng: lng
            });
        }
    }, [lat, lng]);

    if (loading) {
        return (
            <div className='mt-10 flex h-72 w-full items-center justify-center'>
                <Loader className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900' />
            </div>
        );
    }

    return (
        <div className='mx-0 mt-10 h-72 w-full p-0'>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData} margin={{ top: 10, right: -20, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id='areaGradient' x1='0' y1={-1} x2='0' y2={1}>
                            <stop offset='0%' stopColor='rgba(216, 238, 16, 0.22)' />
                            <stop offset='75%' stopColor='rgba(234, 238, 16, 0.07)' />
                            <stop offset='81%' stopColor='rgba(255, 56, 56, 0.05)' />
                            <stop offset='100%' stopColor='rgba(243, 53, 27, 0)' />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E5E7EB' opacity={0.5} />
                    <XAxis dataKey='year' axisLine={false} tickLine={false} tick={<CustomAxisTick />} interval={0} />
                    <YAxis
                        yAxisId='right'
                        orientation='right'
                        domain={[ymin, ymax]}
                        axisLine={false}
                        tickLine={false}
                        tickCount={8}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            stroke: '#374151',
                            strokeDasharray: '3 3',
                            strokeWidth: 1
                        }}
                    />
                    <Area
                        type='monotone'
                        dataKey='score'
                        stroke='#374151'
                        strokeWidth={1.5}
                        fill='url(#areaGradient)'
                        dot={<CustomDot />}
                        yAxisId='right'
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChartComponent;
