'use client';

import { useRef, useState } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
                                    <h3 className='font-semibold'>Score Tip</h3>
                                </div>
                                <ul className='list-disc space-y-2 pl-10 text-sm'>
                                    <li>The Nano Loan is a financing solution</li>
                                    <li>Specifically designed to meet the short-term working</li>
                                    <li>Capital needs of small and medium-sized enterprises (SMEs)</li>
                                    <li>Short-term working capital needs of SMEs</li>
                                </ul>
                            </div>

                            <div className='mx-10 mt-10 text-[21px]'>
                                <h3 className='font-semibold'>Key Factors</h3>
                                <p className='pb-2 text-[13.5px]'>Affecting your score</p>
                                <hr className='mb-4' />
                                <div className='space-y-4'>
                                    {keyFactors.map((factor, index) => (
                                        <div key={index} className='flex justify-between'>
                                            <span className='text-[17px] font-thin'>{factor.label}</span>
                                            <span className='text-[17px] font-thin'>{factor.value}</span>
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
