// Custom hook to load Google Maps API
import { useEffect, useState } from 'react';
import CONFIG from '../config/config';

const useGoogleMaps = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            setLoaded(true);
            return;
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            // Wait for it to load
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    setLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            return () => clearInterval(checkLoaded);
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setLoaded(true);
        };

        script.onerror = () => {
            setError('Failed to load Google Maps');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    return { loaded, error };
};

export default useGoogleMaps;



