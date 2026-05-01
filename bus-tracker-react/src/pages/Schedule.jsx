// Schedule Page Component
import { useState, useEffect } from 'react';
import api from '../services/api';
import showToast from '../utils/toast';

const Schedule = () => {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            const response = await api.routes.getAll();
            if (response.data.success) {
                setRoutes(response.data.data);
            }
        } catch (error) {
            showToast('Failed to load routes', 'error');
        }
    };

    const getSchedule = async () => {
        if (!selectedRoute) {
            showToast('Please select a route', 'warning');
            return;
        }

        try {
            const response = await api.routes.getSchedule(selectedRoute);
            if (response.data.success) {
                setSchedules(response.data.data);
                if (response.data.data.length === 0) {
                    showToast('No schedules found for this route', 'info');
                }
            }
        } catch (error) {
            showToast('Failed to load schedule', 'error');
        }
    };

    const groupByDay = (schedules) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.reduce((acc, day) => {
            acc[day] = schedules.filter(s => s.DAY === day);
            return acc;
        }, {});
    };

    const groupedSchedules = groupByDay(schedules);

    return (
        <section id="schedule" className="page-section">
            <div className="page-header">
                <h1><i className="fas fa-clock"></i> Bus Schedule</h1>
                <p>View departure and arrival times for all routes</p>
            </div>
            
            <div className="content-card">
                <div className="form-group">
                    <label htmlFor="scheduleRoute"><i className="fas fa-route"></i> Select Route:</label>
                    <select 
                        id="scheduleRoute" 
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                        <option value="">Choose a route...</option>
                        {routes.map(route => (
                            <option key={route.R_ID} value={route.R_ID}>
                                {route.R_NAME}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={getSchedule}>
                    <i className="fas fa-calendar-alt"></i> Get Schedule
                </button>
                
                <div id="scheduleInfo" className="schedule-info">
                    {schedules.length > 0 && (
                        <div className="schedule-container">
                            {Object.entries(groupedSchedules).map(([day, daySchedules]) => {
                                if (daySchedules.length === 0) return null;
                                
                                return (
                                    <div key={day} className="schedule-day">
                                        <h3><i className="fas fa-calendar-day"></i> {day}</h3>
                                        <div className="schedule-table">
                                            <div className="schedule-row schedule-header">
                                                <div>Bus</div>
                                                <div>Driver</div>
                                                <div>Departure</div>
                                                <div>Arrival</div>
                                            </div>
                                            {daySchedules.map(schedule => (
                                                <div key={schedule.SCH_ID} className="schedule-row">
                                                    <div><i className="fas fa-bus"></i> {schedule.B_NO}</div>
                                                    <div><i className="fas fa-user"></i> {schedule.D_NAME}</div>
                                                    <div><i className="fas fa-clock"></i> {schedule.D_TIME}</div>
                                                    <div><i className="fas fa-clock"></i> {schedule.A_TIME}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Schedule;



