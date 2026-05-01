// Notification Center Component
import { useState, useEffect } from 'react';
import api from '../services/api';
import showToast from '../utils/toast';
import './NotificationCenter.css';

const NotificationCenter = ({ studentId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    useEffect(() => {
        if (studentId && isOpen) {
            loadNotifications();
        }
    }, [studentId, isOpen, filter]);

    // Poll for new notifications every 30 seconds when open
    useEffect(() => {
        if (isOpen && studentId) {
            const interval = setInterval(() => {
                loadNotifications(true); // Silent refresh
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isOpen, studentId]);

    const loadNotifications = async (silent = false) => {
        if (!silent) setLoading(true);
        
        try {
            const unreadOnly = filter === 'unread';
            const response = await api.notifications.getAll(studentId, unreadOnly);
            
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            if (!silent) {
                showToast('Failed to load notifications', 'error');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.notifications.markAsRead(notificationId);
            setNotifications(notifications.map(n => 
                n.N_ID === notificationId ? { ...n, IS_READ: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            showToast('Failed to mark as read', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.notifications.markAllAsRead(studentId);
            setNotifications(notifications.map(n => ({ ...n, IS_READ: true })));
            setUnreadCount(0);
            showToast('All notifications marked as read', 'success');
        } catch (error) {
            showToast('Failed to mark all as read', 'error');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await api.notifications.delete(notificationId);
            setNotifications(notifications.filter(n => n.N_ID !== notificationId));
            showToast('Notification deleted', 'success');
        } catch (error) {
            showToast('Failed to delete notification', 'error');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'pickup':
                return 'fa-bus';
            case 'dropoff':
                return 'fa-location-dot';
            case 'delay':
                return 'fa-clock';
            default:
                return 'fa-bell';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'pickup':
                return '#10b981';
            case 'dropoff':
                return '#3b82f6';
            case 'delay':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="notification-overlay" onClick={onClose}></div>
            <div className="notification-center">
                <div className="notification-header">
                    <div>
                        <h3>
                            <i className="fas fa-bell"></i> Notifications
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="notification-filters">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={filter === 'unread' ? 'active' : ''}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    {unreadCount > 0 && (
                        <button 
                            className="mark-all-read-btn"
                            onClick={handleMarkAllAsRead}
                        >
                            <i className="fas fa-check-double"></i> Mark all read
                        </button>
                    )}
                </div>

                <div className="notification-list">
                    {loading ? (
                        <div className="notification-loading">
                            <i className="fas fa-spinner fa-spin"></i> Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <i className="fas fa-bell-slash"></i>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div 
                                key={notification.N_ID} 
                                className={`notification-item ${!notification.IS_READ ? 'unread' : ''}`}
                            >
                                <div 
                                    className="notification-icon"
                                    style={{ backgroundColor: getNotificationColor(notification.TYPE) }}
                                >
                                    <i className={`fas ${getNotificationIcon(notification.TYPE)}`}></i>
                                </div>
                                
                                <div className="notification-content">
                                    <div className="notification-message">
                                        {notification.MESSAGE}
                                    </div>
                                    <div className="notification-meta">
                                        <span>
                                            <i className="fas fa-bus"></i> {notification.B_NO}
                                        </span>
                                        <span>
                                            <i className="fas fa-clock"></i> {formatTime(notification.CREATED_AT)}
                                        </span>
                                    </div>
                                </div>

                                <div className="notification-actions">
                                    {!notification.IS_READ && (
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleMarkAsRead(notification.N_ID)}
                                            title="Mark as read"
                                        >
                                            <i className="fas fa-check"></i>
                                        </button>
                                    )}
                                    <button 
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteNotification(notification.N_ID)}
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationCenter;

