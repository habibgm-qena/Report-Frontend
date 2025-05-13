// app/api/point-data/route.ts  (or wherever your GET handler lives)
import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

type GeoJSONFeature = {
    type: string;
    geometry: { type: string; coordinates: [number, number] };
    properties: { score?: number; [key: string]: any };
};

function lon2tileX(lon: number, z: number) {
    return Math.floor(((lon + 180) / 360) * 2 ** z);
}

function lat2tileY(lat: number, z: number) {
    const rad = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
}

// Haversine distance (meters)
function haversineDist([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6_371_000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get('lat') ?? '');
        const lng = parseFloat(url.searchParams.get('lng') ?? '');
        const zoom = parseInt(url.searchParams.get('zoom') ?? '13', 10);

        console.log('@get -->   lat:', lat, 'lng:', lng, 'zoom:', zoom);

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: 'lat and lng query parameters are required and must be numbers' },
                { status: 400 }
            );
        }

        const years = Array.from({ length: 2024 - 2017 + 1 }, (_, i) => 2017 + i);

        const data = await Promise.all(
            years.map(async (year) => {
                const x = lon2tileX(lng, zoom);
                const y = lat2tileY(lat, zoom);
                const tileUrl = `https://nvdi-index-mtiles.onrender.com/data/${year}/${zoom}/${x}/${y}.geojson`;
                console.log('tileUrl:', tileUrl);
                let resp: any;

                try {
                    resp = await axios.get(tileUrl);
                } catch (error) {
                    console.error('Error fetching tile data:', error);
                    return { year: year.toString(), score: 0.01 };
                }
                console.log('resp:', resp.data);
                const features = resp.data.features;

                if (!features || features.length === 0) {
                    return { year: year.toString(), score: 0.01 };
                }

                let nearest = features[0];
                let minDist = haversineDist(nearest.geometry.coordinates, [lng, lat]);

                for (const feat of features) {
                    const d = haversineDist(feat.geometry.coordinates, [lng, lat]);
                    if (d < minDist) {
                        minDist = d;
                        nearest = feat;
                    }
                }

                return {
                    year: year.toString(),
                    score: typeof nearest.properties.score === 'number' ? nearest.properties.score : 0.01
                };
            })
        );

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('GET /api/point-data error:', err);
        return NextResponse.json({ error: err.message ?? 'Unexpected server error' }, { status: 500 });
    }
}
