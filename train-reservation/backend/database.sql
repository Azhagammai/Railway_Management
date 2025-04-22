-- Create the database
CREATE DATABASE IF NOT EXISTS train_reservation;
USE train_reservation;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trains table
CREATE TABLE IF NOT EXISTS trains (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    from_station VARCHAR(100) NOT NULL,
    to_station VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    train_id INT NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    from_station VARCHAR(100) NOT NULL,
    to_station VARCHAR(100) NOT NULL,
    seats INT NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    pnr VARCHAR(10) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (train_id) REFERENCES trains(id)
);

-- Insert sample train data
INSERT INTO trains (name, from_station, to_station, departure_time, total_seats, available_seats, price) VALUES
('Express 101', 'Mumbai', 'Delhi', '10:00:00', 100, 100, 1500.00),
('Superfast 202', 'Bangalore', 'Chennai', '14:30:00', 80, 80, 800.00),
('Rajdhani Express', 'Delhi', 'Kolkata', '16:00:00', 120, 120, 2000.00),
('Shatabdi Express', 'Chennai', 'Hyderabad', '08:30:00', 90, 90, 1200.00); 