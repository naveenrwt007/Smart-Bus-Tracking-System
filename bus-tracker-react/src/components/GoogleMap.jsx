// Google Map Component
import { useEffect, useRef } from 'react';
import CONFIG from '../config/config';

const GoogleMap = ({ center, zoom = 12, markers = [], onMapLoad }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        // Initialize map
        if (!mapInstanceRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: center || CONFIG.MAP_DEFAULT_CENTER,
                zoom: zoom,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            mapInstanceRef.current = map;
            
            if (onMapLoad) {
                onMapLoad(map);
            }
        }
    }, [center, zoom, onMapLoad]);

    useEffect(() => {
        // Update markers
        if (mapInstanceRef.current && markers.length > 0) {
            // Clear old markers
            Object.values(markersRef.current).forEach(marker => marker.setMap(null));
            markersRef.current = {};

            // Add new markers
            markers.forEach(markerData => {
                const marker = new window.google.maps.Marker({
                    position: { lat: markerData.lat, lng: markerData.lng },
                    map: mapInstanceRef.current,
                    title: markerData.title,
                    icon: markerData.icon || undefined
                });

                if (markerData.infoWindow) {
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: markerData.infoWindow
                    });

                    marker.addListener('click', () => {
                        // Close other info windows
                        Object.values(markersRef.current).forEach(m => {
                            if (m.infoWindow) m.infoWindow.close();
                        });
                        infoWindow.open(mapInstanceRef.current, marker);
                    });

                    marker.infoWindow = infoWindow;
                }

                markersRef.current[markerData.id || `marker-${Date.now()}-${Math.random()}`] = marker;
            });
        }
    }, [markers]);

    useEffect(() => {
        // Update center
        if (mapInstanceRef.current && center) {
            mapInstanceRef.current.panTo(center);
        }
    }, [center]);

    return <div ref={mapRef} className="map-container" style={{ width: '100%', height: '500px' }}></div>;
};

export default GoogleMap;



