"""
Notification Service for Smart Bus Tracking System
Monitors bus positions and sends notifications to students
when their bus is 2 stops away from their pickup/dropoff point
"""

import mysql.connector
from mysql.connector import Error
from datetime import datetime
import math
import time

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'smartbus'
}

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates using Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2) * math.sin(delta_lat/2) + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(delta_lon/2) * math.sin(delta_lon/2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance

def get_stop_coordinates(cursor, stop_id):
    """
    Get coordinates for a stop
    Note: Currently STOP table doesn't have coordinates
    This is a simplified version that returns None
    In production, stops should have LAT/LON columns
    """
    # TODO: Add LATITUDE and LONGITUDE columns to STOP table
    return None

def find_closest_stop(cursor, bus_lat, bus_lon, route_id):
    """
    Find the closest stop to the current bus position on its route
    Returns stop_id and stop_order
    """
    try:
        # Get all stops for this route
        cursor.execute("""
            SELECT STOP_ID, STOP_NAME, STOP_ORDER, LOCATION
            FROM STOP 
            WHERE R_ID = %s 
            ORDER BY STOP_ORDER
        """, (route_id,))
        
        stops = cursor.fetchall()
        
        # In a real implementation, calculate distance to each stop
        # For now, we'll use a simple simulation
        # Assume bus progresses through stops in order
        
        if stops:
            # Return middle stop as current (simulation)
            middle_index = len(stops) // 2
            stop_info = stops[middle_index]
            return stop_info[0], stop_info[2]  # STOP_ID, STOP_ORDER
        
        return None, None
        
    except Error as e:
        print(f"Error finding closest stop: {e}")
        return None, None

def get_students_on_route(cursor, route_id):
    """Get all students registered for a specific route"""
    try:
        cursor.execute("""
            SELECT S_ID, S_NAME, S_EMAIL, STOP_ID, NOTIFY_PUSH, NOTIFY_EMAIL
            FROM STUDENT 
            WHERE R_ID = %s
        """, (route_id,))
        
        students = cursor.fetchall()
        return [
            {
                'S_ID': s[0],
                'S_NAME': s[1],
                'S_EMAIL': s[2],
                'STOP_ID': s[3],
                'NOTIFY_PUSH': s[4],
                'NOTIFY_EMAIL': s[5]
            }
            for s in students
        ]
    except Error as e:
        print(f"Error getting students: {e}")
        return []

def get_stop_order(cursor, stop_id):
    """Get the order number of a stop"""
    try:
        cursor.execute("SELECT STOP_ORDER, STOP_NAME FROM STOP WHERE STOP_ID = %s", (stop_id,))
        result = cursor.fetchone()
        return result if result else (None, None)
    except Error as e:
        print(f"Error getting stop order: {e}")
        return None, None

def create_notification(cursor, student_id, bus_id, message, notification_type='pickup'):
    """Create a notification for a student"""
    try:
        # Check if similar notification was recently sent (avoid duplicates)
        cursor.execute("""
            SELECT N_ID FROM NOTIFICATION 
            WHERE S_ID = %s 
            AND B_ID = %s 
            AND TYPE = %s 
            AND CREATED_AT > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
            LIMIT 1
        """, (student_id, bus_id, notification_type))
        
        if cursor.fetchone():
            return False  # Notification already sent recently
        
        # Create new notification
        cursor.execute("""
            INSERT INTO NOTIFICATION (S_ID, B_ID, MESSAGE, TYPE, IS_READ)
            VALUES (%s, %s, %s, %s, FALSE)
        """, (student_id, bus_id, message, notification_type))
        
        return True
    except Error as e:
        print(f"Error creating notification: {e}")
        return False

def check_and_notify_students():
    """
    Main notification logic:
    1. Get all active buses with recent tracking data
    2. For each bus, determine current stop position
    3. Find students whose stops are 2 stops ahead
    4. Send notifications to those students
    """
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get latest tracking data for all buses
        cursor.execute("""
            SELECT 
                T.B_ID,
                T.LATITUDE,
                T.LONGITUDE,
                T.CURRENT_STOP_ID,
                B.B_NO,
                B.D_NAME,
                B.R_ID
            FROM TRACKING T
            INNER JOIN BUS B ON T.B_ID = B.B_ID
            WHERE T.TIMESTAMP > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            AND B.R_ID IS NOT NULL
            GROUP BY T.B_ID
            ORDER BY T.TIMESTAMP DESC
        """)
        
        active_buses = cursor.fetchall()
        notifications_sent = 0
        
        for bus in active_buses:
            bus_id = bus['B_ID']
            bus_no = bus['B_NO']
            route_id = bus['R_ID']
            current_stop_id = bus['CURRENT_STOP_ID']
            
            if not route_id:
                continue
            
            # If current stop not set, try to determine it
            if not current_stop_id:
                current_stop_id, current_stop_order = find_closest_stop(
                    cursor, 
                    float(bus['LATITUDE']), 
                    float(bus['LONGITUDE']), 
                    route_id
                )
                
                # Update tracking with current stop
                if current_stop_id:
                    cursor.execute("""
                        UPDATE TRACKING 
                        SET CURRENT_STOP_ID = %s 
                        WHERE B_ID = %s 
                        ORDER BY TIMESTAMP DESC 
                        LIMIT 1
                    """, (current_stop_id, bus_id))
            else:
                current_stop_order, _ = get_stop_order(cursor, current_stop_id)
            
            if not current_stop_order:
                continue
            
            # Calculate target stop (2 stops ahead)
            target_stop_order = current_stop_order + 2
            
            # Get all students on this route
            students = get_students_on_route(cursor, route_id)
            
            for student in students:
                student_stop_order, student_stop_name = get_stop_order(cursor, student['STOP_ID'])
                
                if not student_stop_order:
                    continue
                
                # Check if bus is 2 stops away from student's stop
                if student_stop_order == target_stop_order:
                    message = f"🚌 Your bus {bus_no} is approaching! It will reach {student_stop_name} in 2 stops. Get ready!"
                    
                    if student.get('NOTIFY_PUSH', True):
                        if create_notification(cursor, student['S_ID'], bus_id, message, 'pickup'):
                            notifications_sent += 1
                            print(f"✓ Notification sent to {student['S_NAME']} for bus {bus_no}")
        
        connection.commit()
        
        if notifications_sent > 0:
            print(f"\n📬 Sent {notifications_sent} notifications")
        
    except Error as e:
        print(f"Error in notification service: {e}")
        connection.rollback()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def run_notification_service(interval=10):
    """
    Run notification service continuously
    Checks every 'interval' seconds for buses approaching student stops
    """
    print("="*60)
    print("🚌 SMART BUS NOTIFICATION SERVICE")
    print("="*60)
    print(f"Checking for notifications every {interval} seconds...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] Checking for notifications...")
            
            check_and_notify_students()
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n\n✓ Notification service stopped")
    except Exception as e:
        print(f"\n✗ Error: {e}")

def get_student_notifications(student_id, limit=20, unread_only=False):
    """Get notifications for a specific student"""
    connection = get_db_connection()
    if not connection:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                N.N_ID,
                N.MESSAGE,
                N.TYPE,
                N.IS_READ,
                N.CREATED_AT,
                B.B_NO,
                B.D_NAME as DRIVER_NAME
            FROM NOTIFICATION N
            JOIN BUS B ON N.B_ID = B.B_ID
            WHERE N.S_ID = %s
        """
        
        if unread_only:
            query += " AND N.IS_READ = FALSE"
        
        query += " ORDER BY N.CREATED_AT DESC LIMIT %s"
        
        cursor.execute(query, (student_id, limit))
        notifications = cursor.fetchall()
        
        return notifications
        
    except Error as e:
        print(f"Error getting notifications: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def mark_notification_read(notification_id):
    """Mark a notification as read"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE NOTIFICATION SET IS_READ = TRUE WHERE N_ID = %s", (notification_id,))
        connection.commit()
        return True
    except Error as e:
        print(f"Error marking notification as read: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def mark_all_read(student_id):
    """Mark all notifications as read for a student"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE NOTIFICATION SET IS_READ = TRUE WHERE S_ID = %s", (student_id,))
        connection.commit()
        return True
    except Error as e:
        print(f"Error marking all as read: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    # Run the notification service
    run_notification_service(interval=10)

