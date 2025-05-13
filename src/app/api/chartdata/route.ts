import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

type RequestBody = {
    lat: number;
    lng: number;
    zoom?: number;
};

type GeoJSONFeature = {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: Record<string, any>;
};

function lon2tileX(lon: number, z: number): number {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, z));
}

function lat2tileY(lat: number, z: number): number {
    const rad = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z));
}

// Haversine distance (in meters)
function haversineDist([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export async function POST(request: NextRequest) {
    try {
        const { lat, lng, zoom = 13 } = (await request.json()) as RequestBody;
        const years = Array.from({ length: 2024 - 2017 + 1 }, (_, i) => 2017 + i);

        const results = await Promise.all(
            years.map(async (year) => {
                const x = lon2tileX(lng, zoom);
                const y = lat2tileY(lat, zoom);
                const url = `https://nvdi-index-mtiles.onrender.com/data/${year}/${zoom}/${x}/${y}.geojson`;

                const resp = await axios.get<{ features: GeoJSONFeature[] }>(url, {
                    responseType: 'json'
                });
                const features = resp.data.features;
                if (!features || features.length === 0) {
                    return { year, properties: null, distance: null };
                }
                // Find the feature closest to [lng, lat]
                let nearest = features[0];
                let minDist = haversineDist(nearest.geometry.coordinates, [lng, lat]);

                for (const feature of features) {
                    const dist = haversineDist(feature.geometry.coordinates, [lng, lat]);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = feature;
                    }
                }

                return {
                    year,
                    properties: nearest.properties,
                    distance: minDist
                };
            })
        );

        return NextResponse.json({ data: results });
    } catch (error: any) {
        console.error('Error in /api/point-data:', error);
        return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 500 });
    }
}
