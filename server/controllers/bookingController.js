const pool = require('../config/db');

// GET /api/bookings/available-tables
const getAvailableTables = async (req, res, next) => {
  try {
    const { restaurant_id, booking_date, booking_time, guests } = req.query;
    if (!restaurant_id || !booking_date || !booking_time || !guests) {
      return res.status(400).json({ success: false, message: 'restaurant_id, booking_date, booking_time, and guests are required.' });
    }

    const result = await pool.query(
      `SELECT rt.* FROM restaurant_tables rt
       WHERE rt.restaurant_id = $1
         AND rt.capacity >= $2
         AND rt.status = 'available'
         AND rt.id NOT IN (
           SELECT b.table_id FROM bookings b
           WHERE b.booking_date = $3
             AND b.booking_time = $4
             AND b.booking_status IN ('pending', 'approved')
         )
       ORDER BY rt.capacity ASC`,
      [restaurant_id, parseInt(guests), booking_date, booking_time]
    );

    res.json({ success: true, tables: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { table_id, booking_date, booking_time, guests } = req.body;
    const user_id = req.user.id;

    if (!table_id || !booking_date || !booking_time || !guests) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    // Validate not past date
    if (new Date(booking_date) < new Date(new Date().toDateString())) {
      return res.status(400).json({ success: false, message: 'Cannot book in the past.' });
    }

    // Check table exists and has enough capacity
    const table = await pool.query('SELECT * FROM restaurant_tables WHERE id = $1', [table_id]);
    if (table.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }
    if (table.rows[0].capacity < guests) {
      return res.status(400).json({ success: false, message: 'Table capacity insufficient.' });
    }

    // Check for conflict
    const conflict = await pool.query(
      `SELECT id FROM bookings
       WHERE table_id = $1 AND booking_date = $2 AND booking_time = $3
       AND booking_status IN ('pending', 'approved')`,
      [table_id, booking_date, booking_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Table already booked for this slot.' });
    }

    const result = await pool.query(
      'INSERT INTO bookings (user_id, table_id, booking_date, booking_time, guests) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, table_id, booking_date, booking_time, guests]
    );

    res.status(201).json({ success: true, message: 'Booking created!', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, rt.table_number, rt.capacity, r.name as restaurant_name, r.location
       FROM bookings b
       JOIN restaurant_tables rt ON b.table_id = rt.id
       JOIN restaurants r ON rt.restaurant_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1 AND user_id = $2 AND booking_status IN ('pending', 'approved') RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });
    }

    res.json({ success: true, message: 'Booking cancelled.', booking: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailableTables, createBooking, getMyBookings, cancelBooking };
