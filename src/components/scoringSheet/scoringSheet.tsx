'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TimeRange } from '@/utils/dateFormatter';

import AreaChartComponent from '../charts/areaChart';
import GaugeChart from '../charts/gaugeChart';
import { Badge } from '../ui/badge';
import RenderScoreProgressTable from './components/scoringSheetTable';
import './scoringSheet.scss';
import { LightbulbIcon, Loader2 } from 'lucide-react';

interface KeyFactor {
    label: string;
    value: string;
}

interface DebtAnalysisItem {
    label: string;
    value: string;
}

const scoreProgressData: any = [
    { hash: 'EKG46SJFN17', score: 779, date: '14/07/2024', limit: '5,000 ETB', status: 'Paid' },
    { hash: 'EKG46SJFN17', score: 811, date: '12/08/2024', limit: '10,000 ETB', status: 'Paid' },
    { hash: 'EKG46SJFN17', score: 829, date: '24/09/2024', limit: '14,000 ETB', status: 'Paid' },
    { hash: 'EKG46SJFN17', score: 879, date: '24/10/2024', limit: '20,000 ETB', status: 'Paid' }
];

const keyFactors: KeyFactor[] = [
    { label: 'On-time Payments', value: '100%' },
    { label: 'Credit Utilization', value: '5.24%' },
    { label: 'Credit Age', value: '4y 1m' },
    { label: 'New Accounts', value: '5' }
];

const debtAnalysis: DebtAnalysisItem[] = [
    { label: 'Total Debt Balance', value: '46,000' },
    { label: 'Monthly Payment', value: '6,000' },
    { label: 'Debt Income Ratio', value: '58%' }
];

interface CreditScoreDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product_id?: string;
    customer_id?: string;
}

const CreditScoreDrawer: React.FC<CreditScoreDrawerProps> = ({
    isOpen,
    onOpenChange,
    product_id = '5',
    customer_id = '5'
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('6m');
    const sheetContentRef = useRef<HTMLDivElement>(null!);
    const sheetTitleRef = useRef<HTMLDivElement>(null!);

    const handleTimeRangeChange = (value: string) => {
        setIsLoading(true);
        setTimeRange(value as TimeRange);
        // Simulate data loading
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side='right' className='z-9999 w-3/4 overflow-y-auto' ref={sheetContentRef}>
                <SheetHeader>
                    <SheetTitle ref={sheetTitleRef}>
                        <div className='grid grid-cols-1 gap-6 border-none md:grid-cols-2'>
                            <div>
                                <div className='flex items-center justify-between'>
                                    <p>Credit Score</p>
                                </div>
                            </div>
                            <div>
                                <div className='mb-3 flex items-center justify-between'>
                                    <CardTitle>
                                        <p>Score Progress</p>
                                    </CardTitle>
                                    {/* <select
                    className="border rounded p-1"
                    onChange={handleTimeRangeChange}
                    value={timeRange}
                    disabled={isLoading}
                  >
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                    <option value="2y">Last 2 Years</option>
                  </select> */}
                                    <Select
                                        value={timeRange}
                                        // onValueChange={handleTimeRangeChange}
                                        disabled={isLoading}
                                        onValueChange={handleTimeRangeChange}>
                                        <SelectTrigger className='max-w-xs rounded border p-1'>
                                            <SelectValue placeholder='Select Time Range' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='6m'>Last 6 Months</SelectItem>
                                            <SelectItem value='1y'>Last Year</SelectItem>
                                            <SelectItem value='2y'>Last 2 Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {/* select */}
                                </div>
                                <hr />
                            </div>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <div className='py-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='w-[100%]'>
                            <div className='relative mx-0 my-0 flex min-h-[12.7rem] w-[100%] justify-start align-top'>
                                <GaugeChart product_id={product_id} customer_id={customer_id} />
                            </div>

                            <div className='mt-[120px]'>
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

                            <div className='mt-10 text-[21px]'>
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

                        {/* Right Column */}
                        <div className='w-[100%]'>
                            <div className='w-full overflow-x-auto'>
                                {isLoading && (
                                    <div className='relative'>
                                        <div className='absolute left-[50%] flex h-40 items-center justify-center'>
                                            <Loader2 className='size-12 animate-spin' />
                                        </div>
                                    </div>
                                )}

                                <RenderScoreProgressTable scoreProgressData={scoreProgressData} />
                                <AreaChartComponent />
                            </div>

                            <Card className='mt-5 mb-6 border-none shadow-none'>
                                <CardHeader>
                                    <CardTitle>
                                        <p className='mb-2 text-[24px]'>General credit report</p>
                                        <hr />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <h3 className='mb-5 flex flex-row justify-between font-semibold'>
                                        <span>MY DEBT ANALYSIS</span>
                                        <Badge className='bg-yellow-500 hover:bg-yellow-500'>B</Badge>
                                    </h3>
                                    <div className='mb-4 flex gap-2'>
                                        {['B', 'F', 'A', 'B', 'A'].map((letter, index) => (
                                            <span
                                                key={index}
                                                className={`flex size-8 items-center justify-center rounded ${index === 0 ? 'bg-yellow-500 text-white' : ''} ${index === 1 ? 'bg-orange-500 text-white' : ''} ${index > 1 ? 'border' : ''} `}>
                                                {letter}
                                            </span>
                                        ))}
                                    </div>

                                    <div className='w-full space-y-2'>
                                        {debtAnalysis.map((item, index) => (
                                            <div key={index} className='flex justify-between border-b py-2'>
                                                <span>{item.label}</span>
                                                <span>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CreditScoreDrawer;
