'use client';

import React, { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';

interface LocationContextType {
    lat: number | null;
    lng: number | null;
    setLat: Dispatch<SetStateAction<number | null>>;
    setLng: Dispatch<SetStateAction<number | null>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    return <LocationContext.Provider value={{ lat, lng, setLat, setLng }}>{children}</LocationContext.Provider>;
};

// 5. Custom hook for consuming the context
export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

// Usage example (e.g. in App.tsx):
// import { LocationProvider } from './LocationContext';
//
//
//   <YourApp />
// </LocationProvider>

// And in any component:
// const { lat, lng, setLat, setLng } = useLocation();
// setLat(9.145);
// setLng(40.489673);
