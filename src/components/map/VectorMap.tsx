'use client';

import React, { useEffect, useState } from 'react';

import { useLocation } from '@/hooks/location_context';

import L, { latLng } from 'leaflet';
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

if (!(L.DomEvent as any).fakeStop) {
    (L.DomEvent as any).fakeStop = (e: any) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
    };
}

L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet_images/marker-icon-2x.png',
    iconUrl: '/leaflet_images/marker-icon.png',
    shadowUrl: '/leaflet_images/marker-shadow.png'
});

const DEFAULT_CENTER: [number, number] = [9.145, 40.489673];
const DEFAULT_ZOOM = 6;

function VectorTileLayer({ url }: { url: string }) {
    const map = useMap();

    const getColorByScore = (score: number) => {
        const t = Math.max(0, Math.min(1, (score + 1) / 2));
        const r = Math.round((1 - t) * 255);
        const g = Math.round(t * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`;
    };

    useEffect(() => {
        const layer = new (L as any).VectorGrid.Protobuf(url, {
            rendererFactory: (L.canvas as any).tile,
            interactive: false,
            vectorTileLayerStyles: {}
        });

        layer.once('load', () => {
            const styles: Record<string, any> = {};
            layer.getDataLayerNames().forEach((name: string) => {
                styles[name] = (props: any) => ({
                    fill: true,
                    color: props.outlineColor || 'transparent',
                    weight: props.weight || 1,
                    fillColor: props.score != null ? getColorByScore(props.score) : props.color || 'transparent',
                    fillOpacity: props.opacity ?? 0.7,
                    radius: props.radius || 8
                });
            });
            layer.options.vectorTileLayerStyles = styles;
            layer.redraw();
        });

        layer.addTo(map);
        return () => void map.removeLayer(layer);
    }, [map, url]);

    return null;
}

function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    const { lat, lng, setLat, setLng } = useLocation();
    useMapEvents({
        click(e: any) {
            setLat(e.latlng.lat);
            setLng(e.latlng.lng);
            onClick(e.latlng);
        }
    });
    return null;
}

export default function VectorMap({ url }: { url: string }) {
    const [markerPos, setMarkerPos] = useState<any>(null);

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            zoomControl={true}
            style={{ height: '100%', width: '100%' }}
            preferCanvas>
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='© OpenStreetMap contributors'
            />

            <VectorTileLayer url={url} />
            <ClickHandler onClick={setMarkerPos} />

            {markerPos && (
                <Marker position={markerPos}>
                    <Popup>
                        Lat: {markerPos.lat.toFixed(5)}
                        <br />
                        Lng: {markerPos.lng.toFixed(5)}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
