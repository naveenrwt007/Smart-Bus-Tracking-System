// Authentication Context - Manages user authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import showToast from '../utils/toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await api.auth.checkStatus();
            if (response.data.logged_in) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.auth.login(username, password);
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                showToast(response.data.message, 'success');
                return { success: true };
            }
        } catch (error) {
            const errorMsg = error.error || 'Login failed';
            showToast(errorMsg, 'error');
            return { success: false, error: errorMsg };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.auth.register(userData);
            if (response.data.success) {
                showToast(response.data.message, 'success');
                return { success: true };
            }
        } catch (error) {
            const errorMsg = error.error || 'Registration failed';
            showToast(errorMsg, 'error');
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            await api.auth.logout();
            setUser(null);
            setIsAuthenticated(false);
            showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;



