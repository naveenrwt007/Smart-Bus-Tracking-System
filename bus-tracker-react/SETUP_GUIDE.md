# 🚀 Setup Guide - Smart Bus Tracker React App

## ✅ Migration Complete!

Your vanilla JavaScript frontend has been successfully converted to React.js! 

## 📁 What Was Created

```
bus-tracker-react/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              ✅ Navigation with routing
│   │   ├── AuthModal.jsx           ✅ Login/Register modal
│   │   ├── GoogleMap.jsx           ✅ Google Maps wrapper
│   │   └── DriverDashboard.jsx     ✅ GPS tracking dashboard
│   ├── pages/
│   │   ├── Home.jsx                ✅ Hero/landing page
│   │   ├── Tracking.jsx            ✅ Live bus tracking
│   │   ├── Routes.jsx              ✅ Routes & stops
│   │   ├── Schedule.jsx            ✅ Bus schedules
│   │   ├── Register.jsx            ✅ Student registration
│   │   └── Profile.jsx             ✅ User profile
│   ├── contexts/
│   │   └── AuthContext.jsx         ✅ Auth state management
│   ├── services/
│   │   └── api.js                  ✅ Backend API calls
│   ├── hooks/
│   │   └── useGoogleMaps.js        ✅ Maps loader hook
│   ├── utils/
│   │   └── toast.js                ✅ Notifications
│   ├── config/
│   │   └── config.js               ✅ App configuration
│   ├── App.jsx                     ✅ Main app + routing
│   ├── App.css                     ✅ All styles
│   └── main.jsx                    ✅ Entry point
└── README.md                       ✅ Documentation
```

## 🎯 Quick Start

### 1. Navigate to React App

```bash
cd bus-tracker-react
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Configure Google Maps API

Edit `src/config/config.js` and add your Google Maps API key:

```javascript
export const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:5000',
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',  // ⚠️ ADD YOUR KEY
    MAP_DEFAULT_CENTER: {
        lat: 30.273378372192383,
        lng: 77.99981689453125
    },
    // ... rest of config
};
```

### 4. Start Backend API

In a separate terminal:

```bash
cd ../backend
python app.py
```

Backend should be running at `http://127.0.0.1:5000`

### 5. Start React Development Server

```bash
npm run dev
```

The React app will open at `http://localhost:5173` 🎉

## 🔧 Configuration Files

### Backend Configuration (`backend/.env`)

Already configured with:
- Database credentials
- API settings
- Session configuration

### Frontend Configuration (`src/config/config.js`)

Update these settings:

```javascript
export const CONFIG = {
    // ⚠️ REQUIRED: Add your Google Maps API key
    GOOGLE_MAPS_API_KEY: 'YOUR_KEY_HERE',
    
    // Backend API URL (default should work)
    API_BASE_URL: 'http://127.0.0.1:5000',
    
    // Your location (already set)
    MAP_DEFAULT_CENTER: {
        lat: 30.273378372192383,
        lng: 77.99981689453125
    },
    
    // Timing settings (already optimal)
    MAP_DEFAULT_ZOOM: 12,
    AUTO_REFRESH_INTERVAL: 10000,  // 10 seconds
    GPS_UPDATE_INTERVAL: 5000,     // 5 seconds
    TOAST_DURATION: 3000           // 3 seconds
};
```

## 🌐 Available URLs

Once both servers are running:

- **React Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:5000

## 📱 Features & Routes

### Public Routes (No Login Required)
- `/` - Home page with features
- `/tracking` - Track buses in real-time
- `/routes` - View all routes and stops
- `/schedule` - Check bus schedules
- `/register` - Register for bus service

### Protected Routes (Login Required)
- `/profile` - User profile
  - **Students:** View profile info
  - **Drivers:** GPS tracking dashboard

## 🔐 Test Accounts

Use existing accounts from your database or create new ones via the Register modal.

### Test as Student:
1. Click "Login" in navbar
2. Switch to "Register" tab
3. Select "Student" type
4. Fill in details and register
5. Login with credentials

### Test as Driver:
1. Register as "Bus Driver"
2. Add license number and experience
3. Login
4. Access GPS tracking dashboard

## 🗺️ Google Maps Setup

### Get API Key (Free)

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "Maps JavaScript API"
4. Go to "Credentials"
5. Create "API Key"
6. Copy key to `src/config/config.js`

### Secure Your API Key (Recommended)

1. In Google Cloud Console
2. Click on your API key
3. Set "Application restrictions"
4. Add: `http://localhost:5173/*`
5. Save

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy Options

1. **Vercel** (Easiest)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Upload `dist/` folder
   - Or connect GitHub repo

3. **Traditional Hosting**
   - Upload `dist/` contents
   - Configure server for SPA routing

## 🔄 Key Differences from Vanilla JS

### Before (Vanilla JS)
```javascript
// Direct DOM manipulation
document.getElementById('map').innerHTML = '...';

// Global variables
let currentUser = null;

// Callback-based
function handleLogin() { ... }
```

### After (React)
```javascript
// Component state
const [user, setUser] = useState(null);

// Context for global state
const { user, login } = useAuth();

// Hooks-based
useEffect(() => { ... }, []);
```

## 🎨 Styling

All original CSS was preserved in `src/App.css`:
- ✅ Same visual design
- ✅ Same animations
- ✅ Same responsive breakpoints
- ✅ Same color scheme

## 📊 API Connection

Backend connection is handled by `src/services/api.js`:

```javascript
import api from '../services/api';

// Usage in components
const response = await api.buses.getAll();
const response = await api.auth.login(username, password);
const response = await api.routes.getStops(routeId);
```

All endpoints return Promises and handle errors automatically.

## 🐛 Troubleshooting

### "Maps not loading"
- ✅ Add Google Maps API key to `config.js`
- ✅ Enable Maps JavaScript API in Google Cloud
- ✅ Check browser console for errors

### "API connection failed"
- ✅ Ensure backend is running (`python app.py`)
- ✅ Check `API_BASE_URL` in `config.js`
- ✅ Verify CORS is enabled in backend

### "GPS not working"
- ✅ Allow location permissions in browser
- ✅ Use HTTPS in production (GPS requires secure context)
- ✅ Test in a modern browser (Chrome, Firefox, Edge)

### "Build errors"
- ✅ Delete `node_modules` and run `npm install`
- ✅ Ensure Node.js version 16+
- ✅ Check for missing dependencies

## 📦 npm Scripts

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔌 Backend Requirements

Ensure backend is configured:

1. ✅ `backend/.env` file exists
2. ✅ `python-dotenv` installed
3. ✅ MySQL database running
4. ✅ CORS enabled
5. ✅ Session configured

## ✨ New Features in React Version

1. **Better State Management** - Context API for global state
2. **Routing** - Clean URLs with React Router
3. **Code Organization** - Components, pages, services separated
4. **Reusability** - Components can be reused easily
5. **Performance** - Virtual DOM for efficient updates
6. **Developer Experience** - Hot reload, better debugging
7. **Scalability** - Easy to add new features
8. **Type Safety** - Can add TypeScript later if needed

## 📈 Next Steps

### Immediate
1. ✅ Add Google Maps API key
2. ✅ Test all features
3. ✅ Customize map center for your location

### Optional Enhancements
- Add loading spinners
- Implement error boundaries
- Add unit tests
- Add TypeScript
- Implement caching
- Add offline support (PWA)
- Add push notifications

## 🆘 Getting Help

1. Check `README.md` for detailed docs
2. Review component files (well commented)
3. Check browser console for errors
4. Verify backend logs
5. Test API endpoints directly

## 🎉 Success Checklist

- [x] React app created
- [x] All components converted
- [x] Routing configured
- [x] API service created
- [x] Auth context set up
- [x] Google Maps integrated
- [x] GPS tracking implemented
- [x] Styles migrated
- [x] Build successful
- [ ] Google Maps API key added
- [ ] Backend running
- [ ] Frontend running
- [ ] All features tested

## 📞 Support

If you encounter issues:
1. Read the error messages carefully
2. Check browser developer console
3. Verify backend is running
4. Check network tab for API calls
5. Review this guide

---

**Congratulations! Your frontend is now React-powered! 🎉**

**Technology Stack:**
- ⚛️ React 18
- 🛣️ React Router v6
- 🔌 Axios
- 🗺️ Google Maps API
- 🎨 Original CSS
- ⚡ Vite

**Start Development:**
```bash
npm run dev
```

**Build Production:**
```bash
npm run build
```

Enjoy your modern React application! 🚀



