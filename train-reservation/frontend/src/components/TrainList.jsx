import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

const TrainList = () => {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/trains', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrains(response.data);
      } catch (error) {
        setError('Failed to fetch trains');
        console.error('Error:', error);
      }
    };

    fetchTrains();
  }, []);

  const handleBooking = (trainId) => {
    navigate(`/reserve/${trainId}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Trains
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {trains.length === 0 ? (
        <Typography>No trains available.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Train Name</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Available Seats</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trains.map((train) => (
                <TableRow key={train.id}>
                  <TableCell>{train.name}</TableCell>
                  <TableCell>{train.from_station}</TableCell>
                  <TableCell>{train.to_station}</TableCell>
                  <TableCell>{train.departure_time}</TableCell>
                  <TableCell>{train.available_seats}</TableCell>
                  <TableCell>₹{train.price}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={train.available_seats === 0}
                      onClick={() => handleBooking(train.id)}
                    >
                      Book Now
                    </Button>
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

export default TrainList; 