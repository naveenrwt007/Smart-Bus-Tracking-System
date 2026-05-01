#!/usr/bin/env python3
"""
GPS Simulator for Smart Bus Tracking System
This script simulates real-time GPS updates for buses
"""

import requests
import time
import random
import json
from datetime import datetime

class GPSSimulator:
    def __init__(self, api_base="http://127.0.0.1:5000"):
        self.api_base = api_base
        self.buses = [1, 2]  # Bus IDs to simulate
        self.running = False
        
        # Define route paths (simplified coordinates around Delhi area)
        self.route_paths = {
            1: {  # Route A: Hostel Block to Main Campus
                "stops": [
                    {"lat": 28.6129, "lon": 77.2295, "name": "Hostel Gate"},
                    {"lat": 28.6135, "lon": 77.2305, "name": "Library Stop"},
                    {"lat": 28.6140, "lon": 77.2315, "name": "Main Gate"}
                ]
            },
            2: {  # Route B: City Center to University Gate
                "stops": [
                    {"lat": 28.6110, "lon": 77.2270, "name": "City Bus Stand"},
                    {"lat": 28.6120, "lon": 77.2280, "name": "Market Road"},
                    {"lat": 28.6140, "lon": 77.2315, "name": "University Gate"}
                ]
            }
        }
        
        # Current positions for each bus
        self.current_positions = {
            1: {"stop_index": 0, "progress": 0.0},
            2: {"stop_index": 0, "progress": 0.0}
        }
    
    def get_interpolated_position(self, bus_id):
        """Calculate current position between stops"""
        route = self.route_paths.get(bus_id, self.route_paths[1])
        current = self.current_positions[bus_id]
        
        current_stop = current["stop_index"]
        next_stop = (current_stop + 1) % len(route["stops"])
        progress = current["progress"]
        
        # Get current and next stop coordinates
        current_stop_coords = route["stops"][current_stop]
        next_stop_coords = route["stops"][next_stop]
        
        # Interpolate between stops
        lat = current_stop_coords["lat"] + (next_stop_coords["lat"] - current_stop_coords["lat"]) * progress
        lon = current_stop_coords["lon"] + (next_stop_coords["lon"] - current_stop_coords["lon"]) * progress
        
        # Add some random variation to simulate real GPS
        lat += random.uniform(-0.0001, 0.0001)
        lon += random.uniform(-0.0001, 0.0001)
        
        return lat, lon
    
    def update_bus_position(self, bus_id):
        """Update bus position along the route"""
        current = self.current_positions[bus_id]
        
        # Move bus forward
        current["progress"] += random.uniform(0.05, 0.15)  # 5-15% progress per update
        
        # If bus reached next stop, move to next stop
        if current["progress"] >= 1.0:
            current["progress"] = 0.0
            current["stop_index"] = (current["stop_index"] + 1) % len(self.route_paths[bus_id]["stops"])
            
            # Log when bus reaches a stop
            route = self.route_paths[bus_id]
            stop_name = route["stops"][current["stop_index"]]["name"]
            print(f"🚌 Bus {bus_id} arrived at: {stop_name}")
    
    def send_gps_update(self, bus_id):
        """Send GPS update to the API"""
        try:
            lat, lon = self.get_interpolated_position(bus_id)
            
            response = requests.post(f"{self.api_base}/track/{bus_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print(f"📍 Bus {bus_id}: Lat={lat:.6f}, Lon={lon:.6f} - {datetime.now().strftime('%H:%M:%S')}")
                    return True
                else:
                    print(f"❌ Bus {bus_id}: API Error - {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ Bus {bus_id}: HTTP Error {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Bus {bus_id}: Cannot connect to API server. Make sure Flask app is running.")
        except Exception as e:
            print(f"❌ Bus {bus_id}: Error - {str(e)}")
        
        return False
    
    def simulate_bus_movement(self):
        """Simulate realistic bus movement"""
        print("🚌 Starting GPS Simulation...")
        print("Press Ctrl+C to stop")
        
        self.running = True
        update_count = 0
        
        try:
            while self.running:
                for bus_id in self.buses:
                    # Update position
                    self.update_bus_position(bus_id)
                    
                    # Send GPS update
                    self.send_gps_update(bus_id)
                    
                    # Small delay between buses
                    time.sleep(0.5)
                
                update_count += 1
                
                # Wait before next update cycle
                time.sleep(5)  # Update every 5 seconds
                
                # Show summary every 10 updates
                if update_count % 10 == 0:
                    print(f"\n📊 Simulation Summary (Update #{update_count}):")
                    for bus_id in self.buses:
                        route = self.route_paths[bus_id]
                        current = self.current_positions[bus_id]
                        current_stop = route["stops"][current["stop_index"]]["name"]
                        print(f"   Bus {bus_id}: {current_stop} ({current['progress']:.1%} to next stop)")
                    print()
                    
        except KeyboardInterrupt:
            print("\n🛑 GPS Simulation stopped by user")
        except Exception as e:
            print(f"\n❌ Simulation error: {str(e)}")
        finally:
            self.running = False
    
    def test_api_connection(self):
        """Test if API is accessible"""
        try:
            response = requests.get(f"{self.api_base}/")
            if response.status_code == 200:
                print("✅ API connection successful")
                return True
            else:
                print(f"❌ API connection failed - HTTP {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to API. Make sure Flask app is running on http://127.0.0.1:5000")
            return False

def main():
    simulator = GPSSimulator()
    
    print("🚌 Smart Bus GPS Simulator")
    print("=" * 40)
    
    # Test API connection first
    if not simulator.test_api_connection():
        print("\n💡 Make sure to:")
        print("   1. Start the Flask app: python app.py")
        print("   2. Set up the database with the schema.sql")
        print("   3. Update database credentials in app.py")
        return
    
    print("\n🎯 Simulation will:")
    print("   • Simulate 2 buses moving along predefined routes")
    print("   • Send GPS updates every 5 seconds")
    print("   • Show realistic bus movement between stops")
    print("   • Display arrival notifications at stops")
    
    input("\nPress Enter to start simulation...")
    
    # Start simulation
    simulator.simulate_bus_movement()

if __name__ == "__main__":
    main()
