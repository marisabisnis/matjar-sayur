'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './MapPicker.module.css';

interface LocationData {
    lat: number;
    lng: number;
    alamat: string;
    jarak: number; // km
}

interface MapPickerProps {
    storeLat: number;
    storeLng: number;
    maxJarak: number;
    onLocationSelect: (location: LocationData | null) => void;
}

/**
 * Haversine formula — fallback jarak garis lurus (km)
 */
function hitungJarakLurus(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

/**
 * OSRM — hitung jarak tempuh jalan (km)
 * Gratis, tanpa API key. Profil 'car' = rute jalan raya (sama dengan motor)
 * Fallback ke Haversine jika OSRM gagal
 */
async function hitungJarakJalan(
    storeLat: number, storeLng: number,
    destLat: number, destLng: number
): Promise<number> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${storeLng},${storeLat};${destLng},${destLat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.length > 0) {
            // OSRM returns distance in meters
            return Math.round(data.routes[0].distance / 100) / 10; // → km, 1 desimal
        }
    } catch {
        // Fallback to straight line
    }
    return hitungJarakLurus(storeLat, storeLng, destLat, destLng);
}

/**
 * Reverse geocode via Nominatim (gratis, tanpa API key)
 */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

export default function MapPicker({ storeLat, storeLng, maxJarak, onLocationSelect }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [tooFar, setTooFar] = useState(false);

    const handleMapClick = useCallback(
        async (lat: number, lng: number, L: typeof import('leaflet')) => {
            setLoading(true);
            setTooFar(false);

            // Move or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else if (mapInstanceRef.current) {
                const icon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                });
                markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
            }

            // Calculate road distance via OSRM (fallback to straight line)
            const jarak = await hitungJarakJalan(storeLat, storeLng, lat, lng);
            const isTooFar = jarak > maxJarak;
            setTooFar(isTooFar);

            // Reverse geocode
            const alamat = await reverseGeocode(lat, lng);

            const locationData: LocationData = { lat, lng, alamat, jarak };
            setSelectedLocation(locationData);

            if (!isTooFar) {
                onLocationSelect(locationData);
            } else {
                onLocationSelect(null);
            }

            setLoading(false);
        },
        [storeLat, storeLng, maxJarak, onLocationSelect]
    );

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Dynamic import leaflet (client only)
        import('leaflet').then((L) => {
            // Fix default icon path issue
            delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current!, {
                center: [storeLat, storeLng],
                zoom: 13,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            // Store marker (green circle)
            L.circleMarker([storeLat, storeLng], {
                radius: 8,
                color: '#16a34a',
                fillColor: '#16a34a',
                fillOpacity: 0.8,
                weight: 2,
            })
                .addTo(map)
                .bindPopup('📍 Toko Pesan Sayur');

            // Delivery radius circle
            L.circle([storeLat, storeLng], {
                radius: maxJarak * 1000,
                color: '#16a34a',
                fillColor: '#16a34a',
                fillOpacity: 0.05,
                weight: 1,
                dashArray: '5, 10',
            }).addTo(map);

            // Click handler
            map.on('click', (e: L.LeafletMouseEvent) => {
                handleMapClick(e.latlng.lat, e.latlng.lng, L);
            });

            mapInstanceRef.current = map;

            // Force resize after a tick
            setTimeout(() => map.invalidateSize(), 100);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [storeLat, storeLng, maxJarak, handleMapClick]);

    return (
        <div className={styles.mapWrapper}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                crossOrigin=""
            />
            <div ref={mapRef} className={styles.mapContainer} />

            {loading && (
                <div className={styles.mapInfo}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>
                        progress_activity
                    </span>
                    Mencari alamat...
                </div>
            )}

            {!loading && selectedLocation && !tooFar && (
                <div className={styles.mapInfo}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
                        check_circle
                    </span>
                    <span>{selectedLocation.jarak} km dari toko</span>
                </div>
            )}

            {!loading && tooFar && (
                <div className={`${styles.mapInfo} ${styles.mapInfoError}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        error
                    </span>
                    <span>Lokasi terlalu jauh ({selectedLocation?.jarak} km). Maks {maxJarak} km.</span>
                </div>
            )}

            {!loading && !selectedLocation && (
                <div className={`${styles.mapInfo} ${styles.mapInfoHint}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        touch_app
                    </span>
                    <span>Ketuk peta untuk pilih lokasi pengiriman</span>
                </div>
            )}
        </div>
    );
}
