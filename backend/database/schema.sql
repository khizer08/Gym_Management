-- Drop tables if they exist (to avoid FK issues)
DROP TABLE IF EXISTS workout_attendance;
DROP TABLE IF EXISTS workout_sessions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS trainer_attendance;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS trainers;

-- Create database
CREATE DATABASE IF NOT EXISTS gym_management;
USE gym_management;

-- Create tables

-- Trainers table (parent)
CREATE TABLE IF NOT EXISTS trainers (
    trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table (no dependencies)
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    condition_status VARCHAR(50),
    last_maintenance_date DATE
);

-- Workouts table (depends on trainers)
CREATE TABLE IF NOT EXISTS workouts (
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trainer_id INT,
    duration INT, -- duration in minutes
    capacity INT,
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

-- Members table (depends on trainers and workouts)
CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 16),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    membership_plan ENUM('Monthly', 'Quarterly', 'Yearly') NOT NULL,
    assigned_trainer INT,
    assigned_workout_id INT NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_trainer) REFERENCES trainers(trainer_id),
    FOREIGN KEY (assigned_workout_id) REFERENCES workouts(workout_id)
);

-- Attendance table (depends on members)
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- Payments table (depends on members)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_type ENUM('Membership', 'Personal Training', 'Other') NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- Workout sessions table (depends on members and trainers)
CREATE TABLE IF NOT EXISTS workout_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    trainer_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
);

-- Workout attendance table (depends on members and workouts)
CREATE TABLE IF NOT EXISTS workout_attendance (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    workout_id INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
);

-- Trainer attendance table (depends on trainers)
CREATE TABLE IF NOT EXISTS trainer_attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP NULL,
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
); 