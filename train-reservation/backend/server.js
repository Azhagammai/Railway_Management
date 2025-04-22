require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-url.onrender.com'],
  credentials: true
}));
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    console.error('Database connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      errorCode: err.code,
      errorMessage: err.message
    });
    // Don't exit the process, just log the error
    // The application will continue to run and try to reconnect
  });

// Add a health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      const userId = result.insertId;

      // Generate token
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
        expiresIn: '24h'
      });

      res.status(201).json({
        token,
        user: { id: userId, name, email }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();

    try {
      // Find user
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const user = users[0];
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Train Routes
app.get('/api/trains', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [trains] = await connection.query('SELECT * FROM trains');
      res.json(trains);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ message: 'Error fetching trains' });
  }
});

app.post('/api/reservations', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { trainId, seats, passengerName } = req.body;
    
    // Get train details
    const [trains] = await connection.query(
      'SELECT * FROM trains WHERE id = ? FOR UPDATE',
      [trainId]
    );
    
    const train = trains[0];
    if (!train) {
      await connection.rollback();
      return res.status(404).json({ message: "Train not found" });
    }
    
    if (train.available_seats < seats) {
      await connection.rollback();
      return res.status(400).json({ message: "Not enough seats available" });
    }
    
    // Create booking
    const [result] = await connection.query(
      `INSERT INTO bookings (user_id, train_id, train_name, from_station, 
        to_station, seats, passenger_name, booking_date, status, pnr)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        req.user.id,
        trainId,
        train.name,
        train.from_station,
        train.to_station,
        seats,
        passengerName,
        'Confirmed',
        Math.random().toString(36).substring(2, 10).toUpperCase()
      ]
    );

    // Update available seats
    await connection.query(
      'UPDATE trains SET available_seats = available_seats - ? WHERE id = ?',
      [seats, trainId]
    );

    await connection.commit();

    // Get the created booking
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ?',
      [result.insertId]
    );
    
    res.json({
      message: "Reservation successful",
      booking: bookings[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Reservation error:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  } finally {
    connection.release();
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [bookings] = await connection.query(
        'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC',
        [req.user.id]
      );
      res.json(bookings);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Test endpoint to verify token
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 