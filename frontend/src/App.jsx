import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    date: '', time: '', guests: 1,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableTables, setAvailableTables] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAvailableTables(null);
    setMessage({ type: '', text: '' });
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.time || !formData.guests) {
      setMessage({ type: 'error', text: 'Please fill in date, time, and guest count.' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      setMessage({ type: 'error', text: 'Cannot book a table in the past.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axios.get(`${API_BASE_URL}/availability`, {
        params: { booking_date: formData.date, booking_time: formData.time, guest_count: formData.guests },
      });
      if (data.length > 0) {
        setAvailableTables(data);
        setMessage({ type: 'success', text: `${data.length} table(s) available for your booking.` });
      } else {
        setAvailableTables([]);
        setMessage({ type: 'error', text: 'No tables available for this date, time, and guest count.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Error checking availability. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availableTables || availableTables.length === 0) {
      setMessage({ type: 'error', text: 'Please check availability first.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axios.post(`${API_BASE_URL}/bookings`, {
        user: { name: formData.name, email: formData.email, phone: formData.phone },
        booking_date: formData.date,
        booking_time: formData.time,
        guest_count: parseInt(formData.guests),
      });
      setMessage({
        type: 'success',
        text: `🎉 Reservation confirmed! Booking ID: ${String(data.id).substring(0, 8).toUpperCase()}`,
      });
      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: 1 });
      setAvailableTables(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create booking.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-wrapper">
      {/* Header */}
      <div className="page-header">
        <span className="brand-icon">🍽️</span>
        <h1>Reserve a Table</h1>
        <p>Restaurant Table Booking Copilot</p>
        <div className="gold-line" />
      </div>

      {/* Card */}
      <div className="booking-card">
        <form onSubmit={handleSubmit}>

          {/* Guest Info */}
          <div className="section-label">Guest Information</div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Vignesh Kumar" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
            </div>
          </div>

          {/* Booking Details */}
          <div className="section-label section-spacer">Reservation Details</div>
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
            <input type="number" name="guests" min="1" max="10" value={formData.guests} onChange={handleChange} required />
          </div>

          {/* Check Availability Button */}
          <button type="button" className="btn-check" onClick={checkAvailability} disabled={loading}>
            {loading ? '⏳ Checking...' : '🔍 Check Availability'}
          </button>

          {/* Available Tables Display */}
          {availableTables && availableTables.length > 0 && (
            <div className="availability-result">
              <p>Available Tables</p>
              {availableTables.map((t) => (
                <span key={t.id} className="table-badge">
                  🪑 {t.table_name} &bull; {t.capacity} seats
                </span>
              ))}
            </div>
          )}

          {/* Confirm Button — only show when available */}
          {availableTables && availableTables.length > 0 && (
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Confirming...' : '✅ Confirm Reservation'}
            </button>
          )}

          {/* Success / Error Messages */}
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>

        <div className="footer-note">
          Powered by FastAPI + Supabase
        </div>
      </div>
    </div>
  );
}

export default App;
