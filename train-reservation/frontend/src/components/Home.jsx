import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const Home = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch bookings');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No bookings found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PNR</TableCell>
                <TableCell>Train</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Seats</TableCell>
                <TableCell>Passenger</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booking Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.pnr}</TableCell>
                  <TableCell>{booking.train_name}</TableCell>
                  <TableCell>{booking.from_station}</TableCell>
                  <TableCell>{booking.to_station}</TableCell>
                  <TableCell>{booking.seats}</TableCell>
                  <TableCell>{booking.passenger_name}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: booking.status === 'Confirmed' ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {booking.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Home; 