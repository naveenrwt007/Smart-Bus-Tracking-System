// Main App Component
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import RoutesPage from './pages/Routes';
import Schedule from './pages/Schedule';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { initToastContainer } from './utils/toast';
import './App.css';

function App() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // Initialize toast container
        initToastContainer();
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    {/* Toast Container */}
                    <div id="toast-container" className="toast-container"></div>
                    
                    {/* Navbar */}
                    <Navbar onShowAuthModal={() => setShowAuthModal(true)} />
                    
                    {/* Main Content */}
                    <div className="container">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/tracking" element={<Tracking />} />
                            <Route path="/routes" element={<RoutesPage />} />
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </div>
                    
                    {/* Auth Modal */}
                    <AuthModal 
                        show={showAuthModal} 
                        onClose={() => setShowAuthModal(false)} 
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;



