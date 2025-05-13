import MapGrid from '@/components/map/nvdi_visualizer';
import { LocationProvider } from '@/hooks/location_context';

const Page = () => {
    return (
        <LocationProvider>
            <MapGrid />
        </LocationProvider>
    );
};

export default Page;
