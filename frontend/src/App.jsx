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
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAvailableTables(null);
    setSelectedTableId(null);
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
    setSelectedTableId(null);
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
    if (!selectedTableId) {
      setMessage({ type: 'error', text: 'Please select a table to book.' });
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
        table_id: selectedTableId,
      });
      setMessage({
        type: 'success',
        text: `🎉 Confirmed! ID: ${String(data.booking_id).substring(0, 8).toUpperCase()} | Table: ${data.table_name} | Guests: ${data.guest_count}`,
      });
      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: 1 });
      setAvailableTables(null);
      setSelectedTableId(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create booking.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <div className="page-center">

        {/* Page Header */}
        <div className="header">
          <div className="header-icon">🍽️</div>
          <h1 className="header-title">Reserve Your Table</h1>
          <p className="header-sub">Book your perfect dining experience in seconds</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>

            {/* — Guest Information — */}
            <div className="section-heading">
              <span className="section-dot" />
              Guest Information
            </div>

            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                className="field-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="field">
                <label className="field-label">Phone Number</label>
                <input
                  className="field-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* — Reservation Details — */}
            <div className="section-heading section-heading--spaced">
              <span className="section-dot" />
              Reservation Details
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Date</label>
                <input
                  className="field-input"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Time</label>
                <input
                  className="field-input"
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Number of Guests</label>
              <input
                className="field-input"
                type="number"
                name="guests"
                min="1"
                max="10"
                value={formData.guests}
                onChange={handleChange}
                required
              />
            </div>

            {/* Check Availability */}
            <button
              type="button"
              className="btn btn--secondary"
              onClick={checkAvailability}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Checking…</>
              ) : (
                '🔍  Check Availability'
              )}
            </button>

            {/* Available Tables */}
            {availableTables && availableTables.length > 0 && (
              <div className="availability-box">
                <p className="availability-title">Available Tables</p>
                <div className="badge-row">
                  {availableTables.map((t) => (
                    <span 
                      key={t.id} 
                      className={`badge ${selectedTableId === t.id ? 'badge--selected' : ''}`}
                      onClick={() => setSelectedTableId(t.id)}
                    >
                      🪑 {t.table_name} &bull; {t.capacity} seats
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Reservation */}
            {availableTables && availableTables.length > 0 && (
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading || !selectedTableId}
              >
                {loading ? 'Confirming…' : '✅  Confirm Reservation'}
              </button>
            )}

            {/* Feedback Message */}
            {message.text && (
              <div className={`feedback feedback--${message.type}`}>
                {message.text}
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <p className="footer-note">Powered by FastAPI + Supabase</p>
      </div>
    </div>
  );
}

export default App;
