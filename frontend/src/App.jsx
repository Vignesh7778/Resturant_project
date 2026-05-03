import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 1,
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableTables, setAvailableTables] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Reset availability when inputs change
    setAvailableTables(null);
    setMessage({ type: '', text: '' });
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.time || !formData.guests) {
      setMessage({ type: 'error', text: 'Please fill date, time and guests count.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/availability`, {
        params: {
          booking_date: formData.date,
          booking_time: formData.time,
          guest_count: formData.guests,
        },
      });

      if (response.data.length > 0) {
        setAvailableTables(response.data);
        setMessage({ type: 'success', text: `Found ${response.data.length} available tables!` });
      } else {
        setAvailableTables([]);
        setMessage({ type: 'error', text: 'No tables available for this time/count.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error checking availability' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        user: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        booking_date: formData.date,
        booking_time: formData.time,
        guest_count: parseInt(formData.guests),
      };

      const response = await axios.post(`${API_BASE_URL}/bookings`, payload);
      setMessage({ 
        type: 'success', 
        text: `Booking Confirmed! Your Booking ID is ${response.data.id.substring(0, 8)}` 
      });
      // Clear sensitive form fields but keep date/time if they want to book another? 
      // Actually clear all for fresh state
      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: 1 });
      setAvailableTables(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <h1>Reserve a Table</h1>
      <p className="subtitle">Restaurant Table Booking Copilot</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="123-456-7890" />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Number of Guests</label>
          <input type="number" name="guests" min="1" value={formData.guests} onChange={handleChange} required />
        </div>

        <button type="button" className="secondary" onClick={checkAvailability} disabled={loading}>
          {loading ? 'Checking...' : 'Check Availability'}
        </button>

        {availableTables && availableTables.length > 0 && (
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
