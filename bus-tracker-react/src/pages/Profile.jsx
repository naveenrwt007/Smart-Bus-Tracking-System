// Profile Page Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DriverDashboard from '../components/DriverDashboard';
import api from '../services/api';
import showToast from '../utils/toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.user_type === 'student') {
            loadStudentDetails();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadStudentDetails = async () => {
        try {
            const response = await api.students.getDetails(user.email);
            if (response.data.success) {
                setStudentDetails(response.data.data);
            } else {
                setStudentDetails(null);
            }
        } catch (error) {
            console.error('Failed to load student details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) {
        return (
            <section id="profile" className="page-section">
                <div className="page-header">
                    <h1><i className="fas fa-user-circle"></i> My Profile</h1>
                    <p>Please login to view your profile</p>
                </div>
            </section>
        );
    }

    // Show Driver Dashboard if user is a driver
    if (user.user_type === 'driver') {
        return <DriverDashboard />;
    }

    // Show Profile for students
    return (
        <section id="profile" className="page-section">
            <div className="page-header">
                <h1><i className="fas fa-user-circle"></i> My Profile</h1>
                <p>View and manage your account information</p>
            </div>
            
            {loading ? (
                <div className="content-card">
                    <div style={{textAlign: 'center', padding: '40px'}}>
                        <i className="fas fa-spinner fa-spin" style={{fontSize: '2rem', color: '#667eea'}}></i>
                        <p style={{marginTop: '16px', color: '#6b7280'}}>Loading profile...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Account Information Card */}
                    <div className="content-card">
                        <h3 style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i className="fas fa-user-circle" style={{color: '#667eea'}}></i>
                            Account Information
                        </h3>
                        <div className="profile-info">
                            <div className="profile-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div className="profile-details">
                                <div className="profile-field">
                                    <label><i className="fas fa-user"></i> Username:</label>
                                    <span>{user.username}</span>
                                </div>
                                <div className="profile-field">
                                    <label><i className="fas fa-envelope"></i> Email:</label>
                                    <span>{user.email}</span>
                                </div>
                                <div className="profile-field">
                                    <label><i className="fas fa-id-badge"></i> Account Type:</label>
                                    <span className="badge badge-primary">{user.user_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bus Service Registration Info */}
                    {studentDetails ? (
                        <>
                            <div className="content-card">
                                <h3 style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i className="fas fa-bus" style={{color: '#667eea'}}></i>
                                    Bus Service Details
                                </h3>
                                <div className="profile-details">
                                    <div className="profile-field">
                                        <label><i className="fas fa-id-card"></i> Full Name:</label>
                                        <span>{studentDetails.S_NAME}</span>
                                    </div>
                                    {studentDetails.S_PHONE && (
                                        <div className="profile-field">
                                            <label><i className="fas fa-phone"></i> Phone:</label>
                                            <span>{studentDetails.S_PHONE}</span>
                                        </div>
                                    )}
                                    {studentDetails.REGISTRATION_DATE && (
                                        <div className="profile-field">
                                            <label><i className="fas fa-calendar-check"></i> Registered On:</label>
                                            <span>{new Date(studentDetails.REGISTRATION_DATE).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {studentDetails.R_ID && (
                                <div className="content-card">
                                    <h3 style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <i className="fas fa-route" style={{color: '#667eea'}}></i>
                                        Route & Stop Information
                                    </h3>
                                    <div className="profile-details">
                                        <div className="profile-field">
                                            <label><i className="fas fa-route"></i> Route Name:</label>
                                            <span>{studentDetails.R_NAME}</span>
                                        </div>
                                        <div className="profile-field">
                                            <label><i className="fas fa-play-circle"></i> Start Point:</label>
                                            <span>{studentDetails.START_POINT}</span>
                                        </div>
                                        <div className="profile-field">
                                            <label><i className="fas fa-stop-circle"></i> End Point:</label>
                                            <span>{studentDetails.END_POINT}</span>
                                        </div>
                                        {studentDetails.DISTANCE && (
                                            <div className="profile-field">
                                                <label><i className="fas fa-road"></i> Route Distance:</label>
                                                <span>{studentDetails.DISTANCE} km</span>
                                            </div>
                                        )}
                                        {studentDetails.STOP_NAME && (
                                            <>
                                                <div className="profile-field">
                                                    <label><i className="fas fa-map-marker-alt"></i> My Stop:</label>
                                                    <span style={{fontWeight: '600', color: '#667eea'}}>{studentDetails.STOP_NAME}</span>
                                                </div>
                                                {studentDetails.LOCATION && (
                                                    <div className="profile-field">
                                                        <label><i className="fas fa-location-dot"></i> Stop Location:</label>
                                                        <span>{studentDetails.LOCATION}</span>
                                                    </div>
                                                )}
                                                {studentDetails.STOP_ORDER && (
                                                    <div className="profile-field">
                                                        <label><i className="fas fa-list-ol"></i> Stop Order:</label>
                                                        <span>#{studentDetails.STOP_ORDER}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="content-card" style={{textAlign: 'center', padding: '40px'}}>
                            <i className="fas fa-info-circle" style={{fontSize: '3rem', color: '#f59e0b', marginBottom: '16px'}}></i>
                            <h3 style={{marginBottom: '12px', color: '#1f2937'}}>Bus Service Not Registered</h3>
                            <p style={{color: '#6b7280', marginBottom: '24px'}}>
                                You haven't registered for bus tracking service yet.
                            </p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/register')}
                            >
                                <i className="fas fa-user-plus"></i> Register for Bus Service
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="profile-actions" style={{marginTop: '24px'}}>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default Profile;



