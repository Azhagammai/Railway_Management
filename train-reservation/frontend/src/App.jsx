import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import TrainList from './components/TrainList';
import ReservationForm from './components/ReservationForm';
import TokenVerifier from './components/TokenVerifier';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const isAuthenticated = localStorage.getItem('token');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Train Reservation System
            </Typography>
            {!isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/trains">Trains</Button>
                <Button color="inherit" component={Link} to="/verify-token">Verify Token</Button>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/trains" element={
              <ProtectedRoute>
                <TrainList />
              </ProtectedRoute>
            } />
            <Route path="/reserve/:trainId" element={
              <ProtectedRoute>
                <ReservationForm />
              </ProtectedRoute>
            } />
            <Route path="/verify-token" element={
              <ProtectedRoute>
                <TokenVerifier />
              </ProtectedRoute>
            } />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App; 