// Bus Tracking Page Component
import { useState, useEffect, useCallback } from 'react';
import GoogleMap from '../components/GoogleMap';
import api from '../services/api';
import showToast from '../utils/toast';
import useGoogleMaps from '../hooks/useGoogleMaps';
import CONFIG from '../config/config';

const Tracking = () => {
    const { loaded: mapsLoaded } = useGoogleMaps();
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState('');
    const [busLocation, setBusLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [autoRefreshActive, setAutoRefreshActive] = useState(true); // Auto-enabled
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadRoutes();
        // Auto-start refresh when component mounts
        const interval = setInterval(() => {
            if (selectedBusId) {
                trackSelectedBus(selectedBusId);
            } else {
                refreshAllBusLocations();
            }
        }, CONFIG.AUTO_REFRESH_INTERVAL);
        
        setAutoRefreshInterval(interval);
        
        return () => {
            // Cleanup on unmount
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadRoutes = async () => {
        try {
            const response = await api.routes.getAll();
            if (response.data.success) {
                setRoutes(response.data.data);
            }
        } catch (error) {
            showToast('Failed to load routes', 'error');
        }
    };

    const loadBusesByRoute = async (routeId) => {
        try {
            const response = await api.buses.getByRoute(routeId);
            if (response.data.success) {
                setBuses(response.data.data);
                setSelectedBusId(''); // Reset selected bus
                setMarkers([]); // Clear markers
            }
        } catch (error) {
            showToast('Failed to load buses for this route', 'error');
        }
    };

    const handleRouteChange = (e) => {
        const routeId = e.target.value;
        setSelectedRouteId(routeId);
        if (routeId) {
            loadBusesByRoute(routeId);
        } else {
            setBuses([]);
            setSelectedBusId('');
            setMarkers([]);
        }
    };

    const trackSelectedBus = useCallback(async (busId) => {
        if (!busId) {
            setBusLocation(null);
            setMarkers([]);
            return;
        }

        try {
            setIsRefreshing(true);
            const response = await api.buses.getLocation(busId);
            if (response.data.success) {
                const location = response.data.data;
                setBusLocation(location);
                setLastUpdate(new Date());
                
                // Create marker
                const marker = {
                    id: location.B_ID,
                    lat: parseFloat(location.LATITUDE),
                    lng: parseFloat(location.LONGITUDE),
                    title: `Bus ${location.B_NO}`,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="18" fill="#4f46e5" stroke="white" stroke-width="3"/>
                                <text x="20" y="26" font-size="20" fill="white" text-anchor="middle" font-family="Arial">🚌</text>
                            </svg>
                        `),
                        scaledSize: new window.google.maps.Size(40, 40)
                    },
                    infoWindow: `
                        <div style="padding: 10px;">
                            <h4 style="margin: 0 0 10px 0;">Bus ${location.B_NO}</h4>
                            <p style="margin: 5px 0;"><strong>Driver:</strong> ${location.D_NAME}</p>
                            <p style="margin: 5px 0;"><strong>Last Updated:</strong> ${new Date(location.TIMESTAMP).toLocaleString()}</p>
                        </div>
                    `
                };
                
                setMarkers([marker]);
            } else {
                showToast(response.data.message || 'No tracking data available', 'warning');
                setMarkers([]);
            }
        } catch (error) {
            showToast('Failed to get bus location', 'error');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleBusSelect = (e) => {
        const busId = e.target.value;
        setSelectedBusId(busId);
        trackSelectedBus(busId);
    };

    const refreshAllBusLocations = async () => {
        try {
            setIsRefreshing(true);
            const response = await api.buses.getAllLocations();
            if (response.data.success) {
                const locations = response.data.data;
                setLastUpdate(new Date());
                const newMarkers = locations.map(loc => ({
                    id: loc.B_ID,
                    lat: parseFloat(loc.LATITUDE),
                    lng: parseFloat(loc.LONGITUDE),
                    title: `Bus ${loc.B_NO}`,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="3"/>
                                <text x="20" y="26" font-size="20" fill="white" text-anchor="middle" font-family="Arial">🚌</text>
                            </svg>
                        `),
                        scaledSize: new window.google.maps.Size(40, 40)
                    },
                    infoWindow: `
                        <div style="padding: 10px;">
                            <h4 style="margin: 0 0 10px 0;">Bus ${loc.B_NO}</h4>
                            <p style="margin: 5px 0;"><strong>Driver:</strong> ${loc.D_NAME || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Last Updated:</strong> ${new Date(loc.TIMESTAMP).toLocaleString()}</p>
                        </div>
                    `
                }));
                
                setMarkers(newMarkers);
                // Remove the annoying toast - just update silently
                // showToast(`Showing ${newMarkers.length} buses`, 'success');
            }
        } catch (error) {
            showToast('Failed to load all bus locations', 'error');
        } finally {
            setIsRefreshing(false);
        }
    };

    const toggleAutoRefresh = () => {
        if (autoRefreshActive) {
            // Stop auto-refresh
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                setAutoRefreshInterval(null);
            }
            setAutoRefreshActive(false);
            showToast('Auto-refresh disabled', 'info');
        } else {
            // Start auto-refresh
            const interval = setInterval(() => {
                if (selectedBusId) {
                    trackSelectedBus(selectedBusId);
                } else {
                    refreshAllBusLocations();
                }
            }, CONFIG.AUTO_REFRESH_INTERVAL);
            
            setAutoRefreshInterval(interval);
            setAutoRefreshActive(true);
            showToast('Auto-refresh enabled', 'success');
        }
    };

    useEffect(() => {
        return () => {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
        };
    }, [autoRefreshInterval]);

    if (!mapsLoaded) {
        return (
            <div className="page-section">
                <div className="page-header">
                    <h1><i className="fas fa-spinner fa-spin"></i> Loading Maps...</h1>
                </div>
            </div>
        );
    }

    return (
        <section id="tracking" className="page-section">
            <div className="page-header">
                <h1><i className="fas fa-satellite-dish"></i> Live Bus Tracking</h1>
                <p>Track your bus in real-time on the map</p>
            </div>
            
            <div className="content-card">
                <div className="map-controls">
                    <div className="form-group">
                        <label htmlFor="routeSelect"><i className="fas fa-route"></i> Step 1: Select Route:</label>
                        <select id="routeSelect" value={selectedRouteId} onChange={handleRouteChange}>
                            <option value="">Choose a route first...</option>
                            {routes.map(route => (
                                <option key={route.R_ID} value={route.R_ID}>
                                    {route.R_NAME} ({route.START_POINT} → {route.END_POINT})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="busSelect"><i className="fas fa-bus"></i> Step 2: Select Bus:</label>
                        <select id="busSelect" value={selectedBusId} onChange={handleBusSelect} disabled={!selectedRouteId}>
                            <option value="">{selectedRouteId ? 'All Buses on Route' : 'Select a route first'}</option>
                            {buses.map(bus => (
                                <option key={bus.B_ID} value={bus.B_ID}>
                                    Bus {bus.B_NO} - {bus.D_NAME}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="button-group">
                        <button 
                            className="btn btn-primary" 
                            onClick={() => selectedRouteId && loadBusesByRoute(selectedRouteId)} 
                            disabled={!selectedRouteId || isRefreshing}
                        >
                            <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i> Refresh Buses
                        </button>
                        <button 
                            className="btn btn-success" 
                            onClick={refreshAllBusLocations} 
                            disabled={!selectedRouteId || isRefreshing}
                        >
                            <i className={`fas fa-map-marked-alt ${isRefreshing ? 'fa-spin' : ''}`}></i> Show All Buses
                        </button>
                        <button className="btn btn-warning" onClick={toggleAutoRefresh}>
                            <i className={`fas ${autoRefreshActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i> 
                            <span id="autoRefreshText">
                                {autoRefreshActive ? 'Disable Auto-Refresh' : 'Enable Auto-Refresh'}
                            </span>
                        </button>
                    </div>
                    
                    {lastUpdate && (
                        <div className="status-indicator">
                            <i className="fas fa-clock"></i> Last updated: {lastUpdate.toLocaleTimeString()}
                            {isRefreshing && <span style={{ marginLeft: '10px' }}><i className="fas fa-spinner fa-spin"></i> Refreshing...</span>}
                        </div>
                    )}
                </div>
                
                {/* Google Map */}
                <GoogleMap 
                    center={busLocation ? { 
                        lat: parseFloat(busLocation.LATITUDE), 
                        lng: parseFloat(busLocation.LONGITUDE) 
                    } : CONFIG.MAP_DEFAULT_CENTER}
                    zoom={busLocation ? 14 : CONFIG.MAP_DEFAULT_ZOOM}
                    markers={markers}
                />
                
                {/* Bus Info Panel */}
                {busLocation && (
                    <div className="bus-info-panel">
                        <h3><i className="fas fa-bus"></i> Bus Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Bus Number:</span>
                                <span className="value">{busLocation.B_NO}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Driver:</span>
                                <span className="value">{busLocation.D_NAME}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Latitude:</span>
                                <span className="value">{parseFloat(busLocation.LATITUDE).toFixed(6)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Longitude:</span>
                                <span className="value">{parseFloat(busLocation.LONGITUDE).toFixed(6)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Last Updated:</span>
                                <span className="value">{new Date(busLocation.TIMESTAMP).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Tracking;

