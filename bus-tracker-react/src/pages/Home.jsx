// Home Page Component
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // Check if redirected from registration with showLogin flag
        if (location.state?.showLogin) {
            setShowAuthModal(true);
            // Clear the state to prevent modal from showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <>
        <section id="home" className="page-section active">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <i className="fas fa-bus hero-icon"></i>
                        Welcome to Smart Bus Tracker
                    </h1>
                    <p className="hero-subtitle">
                        Track your bus in real-time, plan your journey, and never miss your ride
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-hero" onClick={() => navigate('/tracking')}>
                            <i className="fas fa-satellite-dish"></i> Track Bus Now
                        </button>
                        <button className="btn btn-hero-outline" onClick={() => navigate('/routes')}>
                            <i className="fas fa-route"></i> View Routes
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Quick Features Grid */}
            <div className="features-grid">
                <div className="feature-card" onClick={() => navigate('/tracking')}>
                    <div className="feature-icon">
                        <i className="fas fa-location-arrow"></i>
                    </div>
                    <h3>Real-Time Tracking</h3>
                    <p>Track your bus location live and get accurate arrival times</p>
                </div>
                
                <div className="feature-card" onClick={() => navigate('/routes')}>
                    <div className="feature-icon">
                        <i className="fas fa-map-marked-alt"></i>
                    </div>
                    <h3>Route Information</h3>
                    <p>Browse all available routes and find the best path</p>
                </div>
                
                <div className="feature-card" onClick={() => navigate('/schedule')}>
                    <div className="feature-icon">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <h3>Bus Schedule</h3>
                    <p>Check departure and arrival times for all routes</p>
                </div>
                
                <div className="feature-card" onClick={() => navigate('/register')}>
                    <div className="feature-icon">
                        <i className="fas fa-user-graduate"></i>
                    </div>
                    <h3>Student Registration</h3>
                    <p>Register for bus service and choose your preferred stop</p>
                </div>
            </div>
            </section>
            
            {/* Auth Modal */}
            <AuthModal 
                show={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
            />
        </>
    );
};

export default Home;



