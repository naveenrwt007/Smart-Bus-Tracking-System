// API Service - Handles all backend API calls
import axios from 'axios';
import CONFIG from '../config/config';

const API_BASE = CONFIG.API_BASE_URL;

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// API Service object
const api = {
    // Authentication APIs
    auth: {
        login: (username, password) =>
            apiClient.post('/auth/login', { username, password }),
        
        register: (data) =>
            apiClient.post('/auth/register', data),
        
        logout: () =>
            apiClient.post('/auth/logout'),
        
        checkStatus: () =>
            apiClient.get('/auth/status')
    },

    // Bus APIs
    buses: {
        getAll: () =>
            apiClient.get('/buses'),
        
        getByRoute: (routeId) =>
            apiClient.get(`/buses/route/${routeId}`),
        
        getLocation: (busId) =>
            apiClient.get(`/bus-location/${busId}`),
        
        getAllLocations: () =>
            apiClient.get('/all-bus-locations'),
        
        trackBus: (busId) =>
            apiClient.post(`/track/${busId}`),
        
        getTrackingHistory: (busId) =>
            apiClient.get(`/tracking-history/${busId}`)
    },

    // Route APIs
    routes: {
        getAll: () =>
            apiClient.get('/routes'),
        
        getStops: (routeId) =>
            apiClient.get(`/stops/${routeId}`),
        
        getSchedule: (routeId) =>
            apiClient.get(`/schedule/${routeId}`)
    },

    // Student APIs
    students: {
        register: (data) =>
            apiClient.post('/student-register', data),
        getDetails: (email) =>
            apiClient.get(`/student/details/${email}`)
    },

    // Driver APIs
    driver: {
        updateLocation: (data) =>
            apiClient.post('/update-location', data)
    },

    // Notification APIs
    notifications: {
        getAll: (studentId, unreadOnly = false, limit = 20) =>
            apiClient.get(`/notifications/${studentId}`, {
                params: { unread_only: unreadOnly, limit }
            }),
        
        markAsRead: (notificationId) =>
            apiClient.put(`/notifications/${notificationId}/read`),
        
        markAllAsRead: (studentId) =>
            apiClient.put(`/notifications/student/${studentId}/read-all`),
        
        delete: (notificationId) =>
            apiClient.delete(`/notifications/${notificationId}`),
        
        create: (data) =>
            apiClient.post('/notifications/create', data)
    }
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Request made but no response received
            console.error('Network Error:', error.request);
            return Promise.reject({ error: 'Network error. Please check your connection.' });
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject({ error: error.message });
        }
    }
);

export default api;


