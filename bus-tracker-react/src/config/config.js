// Smart Bus Tracker - Frontend Configuration
export const CONFIG = {
    // Backend API Configuration
    // Use '/api' to proxy through Vite (same origin - no CORS issues!)
    API_BASE_URL: '/api',
    
    // Google Maps API Configuration
    GOOGLE_MAPS_API_KEY: 'AIzaSyAox3S5oNRZwCcejffiUEqA0Q2k-jOeDnY',
    
    // Map Default Settings
    MAP_DEFAULT_CENTER: {
        lat: 30.273378372192383,
        lng: 77.99981689453125
    },
    MAP_DEFAULT_ZOOM: 12,
    
    // Auto-refresh settings (milliseconds)
    AUTO_REFRESH_INTERVAL: 3000, // 3 seconds (faster updates for students)
    
    // GPS Update settings (milliseconds)
    GPS_UPDATE_INTERVAL: 5000, // 5 seconds
    
    // Toast notification duration (milliseconds)
    TOAST_DURATION: 3000,
    
    // Application Info
    APP_NAME: 'Smart Bus Tracker',
    APP_VERSION: '1.0.0'
};

export default CONFIG;

