'use client';

import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useLocation } from '@/hooks/location_context';

import CreditScoreDrawer from '../scoringSheet/scoringSheet';
import ColorScaleRuler from './colorRuler';
import { Info, Menu } from 'lucide-react';

const VectorMap = dynamic(() => import('./VectorMap'), { ssr: false });

type MapItem = { title: string; url: string };

const maps: MapItem[] = [
    { title: '2017', url: 'https://nvdi-index-mtiles.onrender.com/data/2017/{z}/{x}/{y}.pbf' },
    { title: '2018', url: 'https://nvdi-index-mtiles.onrender.com/data/2018/{z}/{x}/{y}.pbf' },
    { title: '2019', url: 'https://nvdi-index-mtiles.onrender.com/data/2019/{z}/{x}/{y}.pbf' },
    { title: '2020', url: 'https://nvdi-index-mtiles.onrender.com/data/2020/{z}/{x}/{y}.pbf' },
    { title: '2021', url: 'https://nvdi-index-mtiles.onrender.com/data/2021/{z}/{x}/{y}.pbf' },
    { title: '2022', url: 'https://nvdi-index-mtiles.onrender.com/data/2022/{z}/{x}/{y}.pbf' },
    { title: '2023', url: 'https://nvdi-index-mtiles.onrender.com/data/2023/{z}/{x}/{y}.pbf' }
];

function YearSlider({
    maps,
    selectedIndex,
    onChange
}: {
    maps: MapItem[];
    selectedIndex: number;
    onChange: (index: number) => void;
}) {
    return (
        <div className='flex w-full flex-col space-y-2'>
            <span className='text-md font-bold'>{maps[selectedIndex].title}</span>
            <Slider
                defaultValue={[selectedIndex]}
                max={maps.length - 1}
                step={1}
                onValueChange={(values) => onChange(values[0])}
                className='w-full'
            />
        </div>
    );
}

export default function MapGrid() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { lat, lng } = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (lat && lng) {
            setIsOpen(true);
        }
    }, [lat, lng]);

    return (
        <div className='relative h-screen w-screen overflow-hidden'>
            {/* Full Page Map */}
            <div className='h-full w-full'>
                <VectorMap url={maps[selectedIndex].url} />
            </div>

            {/* UI Controls Overlay */}
            <div className='absolute top-4 right-4 z-1000 flex items-center gap-2'>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='rounded-full bg-white/90 shadow-md hover:bg-white'>
                            <Info className='h-5 w-5' />
                            <span className='sr-only'>NDVI Information</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='z-1000 sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>NDVI Color Range</DialogTitle>
                            <DialogDescription>
                                Normalized Difference Vegetation Index (NDVI) visualization.
                            </DialogDescription>
                        </DialogHeader>
                        <ColorScaleRuler />
                    </DialogContent>
                </Dialog>

                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsOpen(true)}
                    className='z-1000 rounded-full bg-white/90 shadow-md hover:bg-white'>
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Open menu</span>
                </Button>

                <CreditScoreDrawer isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)} />
            </div>

            {/* Year Slider Overlay at Bottom */}
            <div className='absolute top-6 left-1/2 z-1000 w-80 -translate-x-1/2 transform rounded-lg bg-white/90 p-4 shadow-md'>
                <YearSlider maps={maps} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
            </div>
        </div>
    );
}
