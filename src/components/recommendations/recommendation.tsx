import React, { useEffect, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import '../scoringSheet/scoringSheet.scss';
import { ChevronDown, ChevronRight, FlaskConical, Leaf, Loader, Sparkles, Wheat } from 'lucide-react';

export interface CropRecommendation {
    crop: string;
    summary: string;
    detailed: string;
    icon: string;
}

export interface FertilizerRecommendation {
    fertilizer: string;
    composition: string;
    recommendation: string;
    alignment: string;
}

export interface Recommendations {
    crops: CropRecommendation[];
    fertilizers: FertilizerRecommendation[];
}

interface RecommendationsDisplayProps {
    recommendations?: Recommendations;
    // maxHeight?: string; // Allow customizable height
}

export const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({
    recommendations
    // maxHeight = 'calc(100vh - 400px)' // Default reasonable height that leaves space for headers/footers
}) => {
    const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (recommendations) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [recommendations]);

    const toggleCropDetails = (index: number) => {
        setExpandedCrops((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className='mx-auto mb-10 flex min-h-0 w-full max-w-4xl flex-1 flex-col px-3'>
            <Tabs defaultValue='crops' className='flex min-h-0 w-full flex-1 flex-col'>
                <TabsList className='mb-4 flex w-full rounded-lg bg-white shadow-sm dark:bg-gray-800'>
                    <TabsTrigger
                        value='crops'
                        className='flex-1 border-b-2 border-transparent px-1 py-2 text-sm transition-all data-[state=active]:border-green-500 data-[state=active]:bg-green-50/50 data-[state=active]:font-medium data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-400'>
                        <div className='flex items-center gap-1.5'>
                            <Wheat className='h-4 w-4' />
                            <span>Crops</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value='fertilizers'
                        className='flex-1 border-b-2 border-transparent px-1 py-2 text-sm transition-all data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:font-medium data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400'>
                        <div className='flex items-center gap-1.5'>
                            <FlaskConical className='h-4 w-4' />
                            <span>Fertilizers</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* Apply custom scrollable styles directly to TabsContent */}
                {!loading && (
                    <TabsContent
                        value='crops'
                        className='flex-1 space-y-3 overflow-y-auto'
                        style={{
                            // maxHeight: maxHeight,
                            // overflowY: 'scroll',
                            paddingRight: '8px' // Add some padding for scrollbar
                        }}>
                        {recommendations &&
                            recommendations.crops.map((crop, index) => (
                                <Card
                                    key={index}
                                    className='border-0 bg-white shadow-sm transition-all duration-200 hover:shadow dark:bg-gray-800'>
                                    <div className='border-b border-gray-100 bg-white p-2 pb-3 dark:border-gray-700 dark:bg-gray-800'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'>
                                                    {crop.icon}
                                                </div>
                                                <div className='text-lg font-medium text-gray-800 dark:text-gray-100'>
                                                    {crop.crop}
                                                </div>
                                            </div>
                                            <Badge className='flex items-center gap-1 rounded-full border-0 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300'>
                                                <Sparkles className='h-3 w-3' />
                                                Top Pick
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className='px-3'>
                                        <p className='text-sm text-gray-600 dark:text-gray-300'>{crop.summary}</p>

                                        {expandedCrops[index] && (
                                            <div className='mt-3 rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-700/30'>
                                                <p className='whitespace-pre-line text-gray-600 dark:text-gray-300'>
                                                    {crop.detailed}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            className='flex h-auto items-center gap-1 justify-self-end p-0 pt-1 text-xs font-medium text-green-600 hover:bg-transparent hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                                            onClick={() => toggleCropDetails(index)}>
                                            {expandedCrops[index] ? 'Less info' : 'More info'}
                                            <ChevronDown
                                                className={`h-3 w-3 transition-transform ${expandedCrops[index] ? 'rotate-180' : ''}`}
                                            />
                                        </Button>
                                    </div>

                                    {/* <div className='flex justify-start border-t border-gray-100 p-2 pt-3 dark:border-gray-700'>
                                
                            </div> */}
                                </Card>
                            ))}
                    </TabsContent>
                )}

                {!loading && (
                    <TabsContent
                        value='fertilizers'
                        className='flex-1 space-y-3 overflow-y-auto'
                        style={{
                            // maxHeight: maxHeight,
                            // overflowY: 'scroll',
                            paddingRight: '8px' // Add some padding for scrollbar
                        }}>
                        {recommendations &&
                            recommendations.fertilizers.map((fertilizer, index) => (
                                <Card
                                    key={index}
                                    className='border-0 bg-white shadow-sm transition-all duration-200 hover:shadow dark:bg-gray-800'>
                                    <Accordion type='single' collapsible className='w-full'>
                                        <AccordionItem value={`item-${index}`} className='border-0'>
                                            <CardHeader className='border-b border-gray-100 p-3 dark:border-gray-700'>
                                                <AccordionTrigger className='flex w-full items-center justify-between py-0 hover:no-underline'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'>
                                                            <FlaskConical className='h-4 w-4' />
                                                        </div>
                                                        <div className='text-left'>
                                                            <CardTitle className='text-lg font-medium text-gray-800 dark:text-gray-100'>
                                                                {fertilizer.fertilizer}
                                                            </CardTitle>
                                                            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                                                {fertilizer.composition}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* <ChevronDown className='h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400' /> */}
                                                </AccordionTrigger>
                                            </CardHeader>

                                            <AccordionContent>
                                                <CardContent className='space-y-3 p-3 pt-3'>
                                                    <div>
                                                        <h4 className='mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400'>
                                                            Recommendation
                                                        </h4>
                                                        <p className='text-xs text-gray-700 dark:text-gray-300'>
                                                            {fertilizer.recommendation}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className='mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400'>
                                                            Soil Alignment
                                                        </h4>
                                                        <p className='text-xs text-gray-700 dark:text-gray-300'>
                                                            {fertilizer.alignment}
                                                        </p>
                                                    </div>
                                                </CardContent>

                                                <CardFooter className='flex justify-start border-t border-gray-100 p-2 dark:border-gray-700'>
                                                    <Badge className='flex items-center gap-1 rounded-full border-0 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                                                        <Sparkles className='h-3 w-3' />
                                                        Best Match
                                                    </Badge>
                                                </CardFooter>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </Card>
                            ))}
                    </TabsContent>
                )}

                {loading && (
                    <div className='mt-10 flex h-72 w-full items-center justify-center'>
                        <Loader className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900' />
                    </div>
                )}
            </Tabs>
        </div>
    );
};

export default RecommendationsDisplay;
