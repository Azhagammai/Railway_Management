import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import axios from 'axios';

const TokenVerifier = () => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const verifyToken = async () => {
    setStatus('loading');
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login first.');
        setStatus('error');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Token is valid! User ID: ${response.data.user.id}`);
      setStatus('success');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Token is invalid or expired. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Token is invalid. Please login again.');
      } else {
        setError('Error verifying token. Please try again.');
      }
      setStatus('error');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
          API Token Verification
        </Typography>

        <Button
          variant="contained"
          onClick={verifyToken}
          disabled={status === 'loading'}
          sx={{ mb: 2 }}
        >
          Verify Token
        </Button>

        {status === 'loading' && (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Verifying token...</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Current Token: {localStorage.getItem('token') ? 'Present' : 'Not Found'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TokenVerifier; 