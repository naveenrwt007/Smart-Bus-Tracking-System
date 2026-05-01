"""
MINIMAL FLASK BACKEND WITH SESSIONS - COPY THIS TO YOUR APP.PY

This is a working example showing EXACTLY what you need to add
to your Flask backend to make sessions work.
"""

from flask import Flask, session, jsonify, request
from flask_cors import CORS
from flask_session import Session
from datetime import timedelta

app = Flask(__name__)

# ========== REQUIRED SESSION CONFIGURATION ==========
# Copy these lines to your app.py

app.config['SECRET_KEY'] = 'your-super-secret-key-change-this-in-production'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# CRITICAL: CORS must support credentials
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:*', 'http://127.0.0.1:*'],
     allow_headers=['Content-Type'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Initialize session
Session(app)

# ========== EXAMPLE LOGIN ENDPOINT ==========

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # YOUR ACTUAL AUTH LOGIC HERE
    # This is just a demo - replace with your database check
    
    # Example: Check if it's a driver
    if username == 'driver' and password == 'password123':
        # STORE IN SESSION
        session['user_id'] = 1
        session['username'] = username
        session['user_type'] = 'driver'
        session['email'] = 'driver@example.com'
        session.permanent = True  # IMPORTANT!
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': 1,
                'username': username,
                'user_type': 'driver',
                'email': 'driver@example.com',
                'license_number': 'DL12345',
                'experience_years': 5
            }
        })
    
    # Example: Check if it's a student
    elif username == 'student' and password == 'password123':
        session['user_id'] = 2
        session['username'] = username
        session['user_type'] = 'student'
        session['email'] = 'student@example.com'
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': 2,
                'username': username,
                'user_type': 'student',
                'email': 'student@example.com'
            }
        })
    
    # Invalid credentials
    return jsonify({
        'success': False,
        'error': 'Invalid username or password'
    }), 401


# ========== AUTH STATUS ENDPOINT (CRITICAL!) ==========

@app.route('/auth/status')
def auth_status():
    """
    This endpoint checks if user is logged in.
    Frontend calls this on every page load.
    """
    if 'user_id' in session:
        # User is logged in - return their data
        return jsonify({
            'success': True,
            'logged_in': True,
            'user': {
                'id': session.get('user_id'),
                'username': session.get('username'),
                'user_type': session.get('user_type'),
                'email': session.get('email'),
                'license_number': session.get('license_number'),
                'experience_years': session.get('experience_years')
            }
        })
    else:
        # User is NOT logged in
        return jsonify({
            'success': True,
            'logged_in': False
        })


# ========== LOGOUT ENDPOINT ==========

@app.route('/auth/logout', methods=['POST'])
def logout():
    """Clear the session"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })


# ========== EXAMPLE PROTECTED ROUTE ==========

@app.route('/update-location', methods=['POST'])
def update_location():
    """Example protected route - requires login"""
    
    # Check if logged in
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Authentication required'
        }), 401
    
    # Check if user is a driver
    if session.get('user_type') != 'driver':
        return jsonify({
            'success': False,
            'error': 'Driver access required'
        }), 403
    
    # Get location data
    data = request.json
    bus_id = data.get('bus_id')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    # YOUR CODE: Save to database here
    print(f"Location update from user {session['user_id']}: {latitude}, {longitude}")
    
    return jsonify({
        'success': True,
        'message': 'Location updated'
    })


# ========== TEST ENDPOINTS ==========

@app.route('/test-session')
def test_session():
    """Test if session is working"""
    session['test'] = 'Session is working!'
    return jsonify({
        'message': 'Session set successfully',
        'session_data': dict(session)
    })

@app.route('/test-session-read')
def test_session_read():
    """Test if session persists"""
    test_value = session.get('test', 'No session found')
    return jsonify({
        'message': test_value,
        'session_data': dict(session)
    })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("FLASK SESSION DEMO SERVER")
    print("="*50)
    print("\nTest credentials:")
    print("  Driver:  username='driver',  password='password123'")
    print("  Student: username='student', password='password123'")
    print("\nTest URLs:")
    print("  POST http://127.0.0.1:5000/auth/login")
    print("  GET  http://127.0.0.1:5000/auth/status")
    print("  POST http://127.0.0.1:5000/auth/logout")
    print("\nSession test:")
    print("  GET http://127.0.0.1:5000/test-session")
    print("  GET http://127.0.0.1:5000/test-session-read")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)


"""
WHAT TO DO:

1. Install required packages:
   pip install Flask-Session Flask-CORS

2. In YOUR app.py, add these lines at the top:
   
   from flask_session import Session
   from datetime import timedelta
   
3. Add this configuration (after creating app):
   
   app.config['SECRET_KEY'] = 'your-secret-key'
   app.config['SESSION_TYPE'] = 'filesystem'
   app.config['SESSION_PERMANENT'] = True
   app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
   
   CORS(app, supports_credentials=True, origins=['http://127.0.0.1:*'])
   Session(app)

4. In your login endpoint, add:
   
   session['user_id'] = user['id']
   session['username'] = user['username']
   session['user_type'] = user['user_type']
   session.permanent = True

5. Create /auth/status endpoint (copy from above)

6. In logout, add:
   
   session.clear()

That's it! Session will persist on refresh.
"""
