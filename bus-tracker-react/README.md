# 🚌 Smart Bus Tracker - React Frontend

React.js frontend for the Smart Bus Tracking System.

## 🚀 Features

- ✅ **Real-time Bus Tracking** - Track buses live on Google Maps
- ✅ **Route Management** - View all available routes and stops
- ✅ **Schedule System** - Check bus schedules by route and day
- ✅ **Student Registration** - Register for bus service
- ✅ **Driver Dashboard** - GPS tracking for bus drivers
- ✅ **Authentication** - Secure login/registration system
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 📁 Project Structure

```
bus-tracker-react/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── AuthModal.jsx    # Login/Register modal
│   │   ├── GoogleMap.jsx    # Google Maps wrapper
│   │   └── DriverDashboard.jsx  # Driver GPS tracking
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home/Hero page
│   │   ├── Tracking.jsx     # Bus tracking page
│   │   ├── Routes.jsx       # Routes listing
│   │   ├── Schedule.jsx     # Schedule viewer
│   │   ├── Register.jsx     # Student registration
│   │   └── Profile.jsx      # User profile
│   ├── contexts/            # React Context
│   │   └── AuthContext.jsx  # Authentication state
│   ├── services/            # API services
│   │   └── api.js           # Backend API calls
│   ├── hooks/               # Custom hooks
│   │   └── useGoogleMaps.js # Google Maps loader
│   ├── utils/               # Utility functions
│   │   └── toast.js         # Toast notifications
│   ├── config/              # Configuration
│   │   └── config.js        # App configuration
│   ├── App.jsx              # Main App component
│   ├── App.css              # Styles
│   └── main.jsx             # Entry point
├── public/                  # Public assets
├── index.html               # HTML template
└── package.json             # Dependencies
```

## 🛠️ Technologies Used

- **React 18** - UI library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Google Maps API** - Maps and location
- **Font Awesome** - Icons
- **Vite** - Build tool

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend/README.md)
- Google Maps API key

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Settings

Edit `src/config/config.js`:

```javascript
export const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:5000',  // Backend URL
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE', // Your Google Maps key
    MAP_DEFAULT_CENTER: {
        lat: 30.273378372192383,  // Your location
        lng: 77.99981689453125
    },
    // ... other settings
};
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 API Configuration

The frontend connects to the backend API. Make sure:

1. Backend is running at `http://127.0.0.1:5000`
2. CORS is enabled in backend
3. Backend `.env` file is configured

## 🗺️ Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API"
3. Create API credentials
4. Add key to `src/config/config.js`
5. (Optional) Restrict API key by HTTP referrer

## 🔐 Authentication

The app uses session-based authentication:

- **Students** - Can track buses, view routes, register for service
- **Drivers** - Access GPS tracking dashboard to update bus location

## 📱 Features by User Type

### Student Features
- View all buses and routes
- Track buses in real-time
- View bus schedules
- Register for bus service
- View profile

### Driver Features
- Select assigned bus
- Start/stop GPS tracking
- View live location on map
- Track GPS accuracy and speed
- Automatic location updates to backend

## 🎨 Styling

Styles are imported from the original vanilla JS version:
- `src/App.css` contains all component styles
- Uses CSS variables for theming
- Fully responsive design
- Modern gradient backgrounds

## 🔌 API Endpoints Used

All endpoints are defined in `src/services/api.js`:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/status` - Check auth status

### Buses
- `GET /buses` - Get all buses
- `GET /bus-location/:id` - Get bus location
- `GET /all-bus-locations` - Get all bus locations
- `POST /track/:id` - Simulate tracking

### Routes
- `GET /routes` - Get all routes
- `GET /stops/:routeId` - Get route stops
- `GET /schedule/:routeId` - Get route schedule

### Driver
- `POST /update-location` - Update bus location (GPS)

### Students
- `POST /student-register` - Register student

## 🧩 Key Components

### Navbar
- Responsive navigation
- Auth state aware
- Mobile menu support

### AuthModal
- Login/Register tabs
- Student/Driver registration
- Form validation

### GoogleMap
- Wrapper for Google Maps
- Marker management
- Info windows

### DriverDashboard
- GPS tracking
- Live map updates
- Path visualization
- Location stats

## 🐛 Troubleshooting

### Maps not loading
- Check Google Maps API key in config.js
- Ensure Maps JavaScript API is enabled
- Check browser console for errors

### API connection errors
- Verify backend is running
- Check API_BASE_URL in config.js
- Ensure CORS is enabled in backend

### GPS not working
- Enable location permissions in browser
- Use HTTPS in production (required for GPS)
- Check browser compatibility

### Build errors
- Run `npm install` to ensure dependencies
- Clear node_modules and reinstall
- Check Node.js version (16+)

## 🚢 Deployment

### Frontend Deployment Options

1. **Vercel** (Recommended)
```bash
npm install -g vercel
vercel
```

2. **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

3. **GitHub Pages**
```bash
npm run build
# Deploy dist/ folder
```

### Environment Variables for Production

Update `src/config/config.js` for production:
- Set production API URL
- Enable HTTPS
- Secure API keys
- Update map center to your location

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## 🔄 Migration from Vanilla JS

This React app is a complete conversion of the original vanilla JS frontend:

### What Changed
- ✅ HTML → React Components
- ✅ Inline JS → Component logic
- ✅ Global state → Context API
- ✅ Direct DOM manipulation → React state
- ✅ Callback-based → Hooks-based
- ✅ No routing → React Router

### What Stayed Same
- ✅ All CSS styles
- ✅ Backend API structure
- ✅ Feature functionality
- ✅ UI/UX design

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

This project is part of the Smart Bus Tracker system.

## 🆘 Support

For issues or questions:
1. Check this README
2. Review component documentation
3. Check browser console
4. Verify backend is running
5. Check API responses

---

**Built with** ⚛️ React | 🗺️ Google Maps | 🎨 Modern CSS

**Version:** 1.0.0  
**Last Updated:** November 2025



