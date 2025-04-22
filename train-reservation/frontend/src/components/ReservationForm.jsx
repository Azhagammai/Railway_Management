import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import axios from 'axios';

const ReservationForm = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    seats: 1,
    passengerName: '',
  });

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/trains`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const trainData = response.data.find(t => t.id === parseInt(trainId));
        if (!trainData) {
          throw new Error('Train not found');
        }
        setTrain(trainData);
      } catch (error) {
        setError('Failed to fetch train details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrain();
  }, [trainId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/reservations',
        {
          trainId: parseInt(trainId),
          seats: parseInt(formData.seats),
          passengerName: formData.passengerName,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to make reservation');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!train) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Train not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/trains')} sx={{ mt: 2 }}>
          Back to Trains
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book Tickets
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Train Details
            </Typography>
            <Typography>Name: {train.name}</Typography>
            <Typography>From: {train.from_station}</Typography>
            <Typography>To: {train.to_station}</Typography>
            <Typography>Departure: {train.departure_time}</Typography>
            <Typography>Available Seats: {train.available_seats}</Typography>
            <Typography>Price per Seat: ₹{train.price}</Typography>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Number of Seats"
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: train.available_seats } }}
                required
              />
              <TextField
                fullWidth
                label="Passenger Name"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formData.seats > train.available_seats}
                >
                  Book Now
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/trains')}
                  sx={{ ml: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReservationForm; 