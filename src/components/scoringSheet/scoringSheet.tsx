'use client';

import { useEffect, useRef, useState } from 'react';

import { agriRecommend } from '@/app/api/endpoints/creditScoring/creditScoring';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLocation } from '@/hooks/location_context';
import { useGenericMethod } from '@/hooks/useGenericMethod';

import AreaChartComponent from '../charts/areaChart';
import './scoringSheet.scss';
import { LightbulbIcon, Loader2 } from 'lucide-react';

interface KeyFactor {
    label: string;
    value: string;
}

const keyFactors: KeyFactor[] = [
    { label: 'On-time Payments', value: '100%' },
    { label: 'Credit Utilization', value: '5.24%' },
    { label: 'Credit Age', value: '4y 1m' },
    { label: 'New Accounts', value: '5' }
];

interface CreditScoreDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreditScoreDrawer: React.FC<CreditScoreDrawerProps> = ({ isOpen, onOpenChange }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const sheetContentRef = useRef<HTMLDivElement>(null!);
    const sheetTitleRef = useRef<HTMLDivElement>(null!);
    const [rCrops, setrCrops] = useState<any>([]);
    const [rFertilizers, setrFertilizers] = useState<any>([]);
    const [nvdiScoresdata, setNvdiScoresdata] = useState<any>([]);
    const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const [loading, setLoading] = useState<boolean>(true);
    const { lat, lng } = useLocation();

    const nvdiScores = useGenericMethod({
        method: 'GET',
        apiMethod: agriRecommend,
        skipWithOutParams: true,
        onSuccess: (data) => {
            console.log('Data fetched successfully:', data);
            setrFertilizers(data.recommended_fertilizers);
            setrCrops(data.recommended_crops);
            setNvdiScoresdata(
                data.ndvi_score_list.map((item: any, index: number) => ({
                    year: years[index],
                    score: item
                }))
            );
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
                crop_location: { latitude: lat, longitude: lng }
            });
        }
    }, [lat, lng]);

    return (
        <div className='w-screen'>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side='right' className='z-10000 w-3/4 overflow-y-auto' ref={sheetContentRef}>
                    <SheetHeader>
                        <SheetTitle ref={sheetTitleRef}>
                            <div className='grid grid-cols-1 gap-6 border-none md:grid-cols-2'>
                                <div>
                                    <div className='flex items-center justify-between'>
                                        <p>NDVI Score Progress</p>
                                    </div>
                                </div>
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    <div className=''>
                        <div className='w-[100%]'>
                            <div className='w-full overflow-x-auto'>
                                {isLoading && (
                                    <div className='relative'>
                                        <div className='absolute left-[50%] flex h-40 items-center justify-center'>
                                            <Loader2 className='size-12 animate-spin' />
                                        </div>
                                    </div>
                                )}

                                <AreaChartComponent />
                            </div>
                        </div>

                        <div className='w-[100%]'>
                            <div className='mx-10 mt-7'>
                                <div className='mb-2 flex items-center gap-2 text-orange-500'>
                                    <LightbulbIcon className='size-5' aria-hidden='true' />
                                    <h3 className='font-semibold'>Crop Recommendations</h3>
                                </div>
                                <ul className='list-disc space-y-2 pl-10 text-sm'>
                                    {rCrops.map((crop: any, index: number) => (
                                        <li key={index} className='text-[15px] font-thin'>
                                            {crop}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='mx-10 mt-10 text-[21px]'>
                                <h3 className='font-semibold'>Fertilizer Recommendations</h3>
                                <hr className='mb-4' />
                                <div className='space-y-4'>
                                    {rFertilizers.map((factor: any, index: number) => (
                                        <div key={index} className='flex justify-between'>
                                            <span className='text-[17px] font-thin'>{factor}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default CreditScoreDrawer;
