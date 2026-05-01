// Authentication Modal Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import showToast from '../utils/toast';

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const CheckItem = ({ met, text }) => (
        <small style={{
            color: met ? '#10b981' : '#6b7280',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }}>
            <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'}`}></i>
            {text}
        </small>
    );

    return (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px'}}>
            <CheckItem met={checks.length} text="8+ characters" />
            <CheckItem met={checks.uppercase} text="Uppercase (A-Z)" />
            <CheckItem met={checks.lowercase} text="Lowercase (a-z)" />
            <CheckItem met={checks.number} text="Number (0-9)" />
            <CheckItem met={checks.symbol} text="Symbol (!@#$)" />
        </div>
    );
};

const AuthModal = ({ show, onClose }) => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [userType, setUserType] = useState('student');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        license_number: '',
        experience_years: ''
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username) => {
        // Alphanumeric and underscore only, 3-20 characters
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    };

    const validateFullName = (name) => {
        // Name: letters and spaces only, 2-50 characters
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    };

    const validatePassword = (password) => {
        // At least 8 characters, one uppercase, one lowercase, one number, one symbol
        if (password.length < 8) return false;
        
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasUppercase && hasLowercase && hasNumber && hasSymbol;
    };
    
    const getPasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        return checks;
    };

    const validateLicenseNumber = (license) => {
        // Alphanumeric, at least 6 characters
        const licenseRegex = /^[A-Z0-9]{6,}$/;
        return licenseRegex.test(license.toUpperCase());
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for experience_years - only allow numbers
        if (name === 'experience_years') {
            if (value && !/^\d+$/.test(value)) {
                return; // Don't update if not a number
            }
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        const result = await login(formData.username, formData.password);
        if (result.success) {
            onClose();
            setFormData({
                username: '',
                full_name: '',
                email: '',
                password: '',
                confirmPassword: '',
                license_number: '',
                experience_years: ''
            });
            setErrors({});
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        // Comprehensive Validation
        const newErrors = {};
        
        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!validateUsername(formData.username)) {
            newErrors.username = 'Username must be 3-20 characters, letters, numbers, and underscore only';
        }
        
        // Full Name validation (for students only)
        if (userType === 'student') {
            if (!formData.full_name.trim()) {
                newErrors.full_name = 'Full name is required';
            } else if (!validateFullName(formData.full_name)) {
                newErrors.full_name = 'Full name must be 2-50 characters, letters and spaces only';
            }
        }
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            const checks = getPasswordStrength(formData.password);
            const missing = [];
            if (!checks.length) missing.push('8 characters');
            if (!checks.uppercase) missing.push('uppercase letter');
            if (!checks.lowercase) missing.push('lowercase letter');
            if (!checks.number) missing.push('number');
            if (!checks.symbol) missing.push('symbol (!@#$%^&*)');
            newErrors.password = `Password must include: ${missing.join(', ')}`;
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Driver-specific validations
        if (userType === 'driver') {
            if (formData.license_number && !validateLicenseNumber(formData.license_number)) {
                newErrors.license_number = 'License number must be at least 6 alphanumeric characters';
            }
            
            if (formData.experience_years && parseInt(formData.experience_years) < 0) {
                newErrors.experience_years = 'Experience cannot be negative';
            }
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        const registerData = {
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            user_type: userType
        };

        if (userType === 'driver') {
            registerData.license_number = formData.license_number.trim().toUpperCase();
            registerData.experience_years = parseInt(formData.experience_years) || 0;
        }

        const result = await register(registerData);
        if (result.success) {
            // For students, redirect to bus service registration page
            if (userType === 'student') {
                onClose();
                showToast('Account created! Now complete your bus service registration.', 'success');
                navigate('/register', { 
                    state: { 
                        username: formData.username.trim(),
                        name: formData.full_name.trim(), 
                        email: formData.email.trim().toLowerCase() 
                    } 
                });
            } else {
                // For drivers, just switch to login tab
                setActiveTab('login');
                showToast('Registration successful! Please login.', 'success');
            }
            
            setFormData({
                username: '',
                full_name: '',
                email: '',
                password: '',
                confirmPassword: '',
                license_number: '',
                experience_years: ''
            });
            setErrors({});
        }
    };

    if (!show) return null;

    return (
        <div className="auth-container" style={{ display: 'flex' }}>
            <div className="auth-form">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2><i className="fas fa-bus"></i> Smart Bus Tracker</h2>
                
                {/* Auth Tabs */}
                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        <i className="fas fa-sign-in-alt"></i> Login
                    </button>
                    <button 
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        <i className="fas fa-user-plus"></i> Register
                    </button>
                </div>
                
                {/* Login Form */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label htmlFor="loginUsername"><i className="fas fa-user"></i> Username:</label>
                            <input 
                                type="text" 
                                id="loginUsername" 
                                name="username" 
                                value={formData.username}
                                onChange={handleChange}
                                className={errors.username ? 'error' : ''}
                                required 
                            />
                            {errors.username && <span className="error-message">{errors.username}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="loginPassword"><i className="fas fa-lock"></i> Password:</label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                minLength="8" 
                                required 
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        <button type="submit" className="btn">
                            <i className="fas fa-sign-in-alt"></i> Login
                        </button>
                    </form>
                )}
                
                {/* Register Form */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="form-group">
                            <label><i className="fas fa-users"></i> Account Type:</label>
                            <div className="user-type-toggle">
                                <button 
                                    type="button" 
                                    className={`user-type-btn ${userType === 'student' ? 'active' : ''}`}
                                    onClick={() => setUserType('student')}
                                >
                                    <i className="fas fa-graduation-cap"></i> Student
                                </button>
                                <button 
                                    type="button" 
                                    className={`user-type-btn ${userType === 'driver' ? 'active' : ''}`}
                                    onClick={() => setUserType('driver')}
                                >
                                    <i className="fas fa-id-card"></i> Bus Driver
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="regUsername"><i className="fas fa-user"></i> Username:</label>
                            <input 
                                type="text" 
                                id="regUsername" 
                                name="username" 
                                value={formData.username}
                                onChange={handleChange}
                                className={errors.username ? 'error' : ''}
                                placeholder="john_doe123"
                                required 
                            />
                            {errors.username && <span className="error-message">{errors.username}</span>}
                            <small className="help-text">3-20 characters, letters, numbers, underscore only</small>
                        </div>
                        
                        {/* Show Full Name field for students only */}
                        {userType === 'student' && (
                            <div className="form-group">
                                <label htmlFor="regFullName"><i className="fas fa-id-card"></i> Full Name:</label>
                                <input 
                                    type="text" 
                                    id="regFullName" 
                                    name="full_name" 
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className={errors.full_name ? 'error' : ''}
                                    placeholder="John Doe Smith"
                                    required 
                                />
                                {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                                <small className="help-text">Your real full name (letters and spaces only)</small>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label htmlFor="regEmail"><i className="fas fa-envelope"></i> Email:</label>
                            <input 
                                type="email" 
                                id="regEmail" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="john@example.com"
                                required 
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="regPassword"><i className="fas fa-lock"></i> Password:</label>
                            <input 
                                type="password" 
                                id="regPassword" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                minLength="8" 
                                placeholder="••••••••"
                                required 
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                            <small className="help-text">
                                Must include: 8+ characters, uppercase, lowercase, number, symbol (!@#$%^&*)
                            </small>
                            {formData.password && (
                                <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                    <PasswordStrengthIndicator password={formData.password} />
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword"><i className="fas fa-lock"></i> Confirm Password:</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                minLength="8" 
                                placeholder="••••••••"
                                required 
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                        
                        {/* Driver-specific fields */}
                        {userType === 'driver' && (
                            <div id="driverFields">
                                <div className="form-group">
                                    <label htmlFor="licenseNumber"><i className="fas fa-id-card-alt"></i> License Number:</label>
                                    <input 
                                        type="text" 
                                        id="licenseNumber" 
                                        name="license_number" 
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        className={errors.license_number ? 'error' : ''}
                                        placeholder="DL1234567890"
                                        maxLength="20"
                                    />
                                    {errors.license_number && <span className="error-message">{errors.license_number}</span>}
                                    <small className="help-text">At least 6 alphanumeric characters</small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="experienceYears"><i className="fas fa-clock"></i> Experience (Years):</label>
                                    <input 
                                        type="text" 
                                        id="experienceYears" 
                                        name="experience_years" 
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        className={errors.experience_years ? 'error' : ''}
                                        placeholder="5"
                                        maxLength="2"
                                    />
                                    {errors.experience_years && <span className="error-message">{errors.experience_years}</span>}
                                    <small className="help-text">Enter number of years only</small>
                                </div>
                            </div>
                        )}
                        
                        <button type="submit" className="btn btn-success">
                            <i className="fas fa-user-plus"></i> Register
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;


