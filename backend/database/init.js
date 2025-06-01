const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;
    try {
        // First connect without database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
        });

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS gym_management');
        console.log('Database created or already exists');

        // Use the database
        await connection.query('USE gym_management');

        // Drop existing tables in correct order (child tables first)
        await connection.query('DROP TABLE IF EXISTS workout_attendance');
        await connection.query('DROP TABLE IF EXISTS workout_sessions');
        await connection.query('DROP TABLE IF EXISTS payments');
        await connection.query('DROP TABLE IF EXISTS attendance');
        await connection.query('DROP TABLE IF EXISTS members');
        await connection.query('DROP TABLE IF EXISTS workouts');
        await connection.query('DROP TABLE IF EXISTS trainer_attendance');
        await connection.query('DROP TABLE IF EXISTS trainers');
        console.log('Dropped existing tables');

        // Create trainers table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS trainers (
                trainer_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                specialization VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Trainers table created');

        // Create workouts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS workouts (
                workout_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                trainer_id INT,
                duration INT,
                capacity INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
            )
        `);
        console.log('Workouts table created');

        // Create members table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS members (
                member_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                age INT NOT NULL CHECK (age >= 16),
                gender ENUM('Male', 'Female', 'Other') NOT NULL,
                phone VARCHAR(15) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                membership_plan ENUM('Monthly', 'Quarterly', 'Yearly') NOT NULL,
                assigned_trainer INT,
                assigned_workout_id INT,
                join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_trainer) REFERENCES trainers(trainer_id),
                FOREIGN KEY (assigned_workout_id) REFERENCES workouts(workout_id)
            )
        `);
        console.log('Members table created');

        // Create attendance table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INT PRIMARY KEY AUTO_INCREMENT,
                member_id INT NOT NULL,
                check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                check_out TIMESTAMP NULL,
                FOREIGN KEY (member_id) REFERENCES members(member_id)
            )
        `);
        console.log('Attendance table created');

        // Create payments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                payment_id INT PRIMARY KEY AUTO_INCREMENT,
                member_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_type ENUM('Membership', 'Personal Training', 'Other') NOT NULL,
                FOREIGN KEY (member_id) REFERENCES members(member_id)
            )
        `);
        console.log('Payments table created');

        // Create workout sessions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS workout_sessions (
                session_id INT PRIMARY KEY AUTO_INCREMENT,
                member_id INT NOT NULL,
                trainer_id INT NOT NULL,
                session_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                notes TEXT,
                FOREIGN KEY (member_id) REFERENCES members(member_id),
                FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
            )
        `);
        console.log('Workout sessions table created');

        // Create workout attendance table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS workout_attendance (
                record_id INT PRIMARY KEY AUTO_INCREMENT,
                member_id INT NOT NULL,
                workout_id INT NOT NULL,
                date DATE NOT NULL,
                FOREIGN KEY (member_id) REFERENCES members(member_id),
                FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
            )
        `);
        console.log('Workout attendance table created');

        // Create trainer attendance table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS trainer_attendance (
                attendance_id INT AUTO_INCREMENT PRIMARY KEY,
                trainer_id INT NOT NULL,
                check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                check_out TIMESTAMP NULL,
                FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
            )
        `);
        console.log('Trainer attendance table created');


        // Insert sample trainers
        const trainers = [
            ['Syed Khizer', 'syedironpulse@gmail.com', 'Weight Training', '9988776655'],
            ['David Warner', 'davidironpulse@gmail.com', 'Cardio', '9988776644'],
            ['Sam Sulek', 'samsulek@gmail.com', 'CrossFit', '9988776633']
        ];

        await connection.query('INSERT INTO trainers (name, email, specialization, phone) VALUES ?', [trainers]);
        console.log('Sample trainers inserted');

        // Insert sample workouts first
        const workouts = [
            ['Full Body Workout', 'Complete body workout focusing on all major muscle groups', 1, 60, 20],
            ['Cardio Blast', 'High-intensity cardio workout', 2, 45, 15],
            ['Beginner Strength', 'Basic strength training for beginners', 3, 45, 10]
        ];

        await connection.query('INSERT INTO workouts (name, description, trainer_id, duration, capacity) VALUES ?', [workouts]);
        console.log('Sample workouts inserted');

        // Insert sample members after workouts are created
        const members = [
            ['Alice Brown', 25, 'Female', '555-0001', 'alice@example.com', 'Monthly', 1, 1],
            ['Bob Davis', 30, 'Male', '555-0002', 'bob@example.com', 'Quarterly', 1, 2],
            ['Carol Evans', 28, 'Female', '555-0003', 'carol@example.com', 'Yearly', 2, 3],
            ['David Foster', 35, 'Male', '555-0004', 'david@example.com', 'Monthly', 3, 1]
        ];

        await connection.query('INSERT INTO members (name, age, gender, phone, email, membership_plan, assigned_trainer, assigned_workout_id) VALUES ?', [members]);
        console.log('Sample members inserted');

        // Insert sample attendance records
        const attendance = [
            [1, '2024-03-15 08:00:00', '2024-03-15 10:00:00'],
            [2, '2024-03-15 09:00:00', '2024-03-15 11:00:00'],
            [3, '2024-03-15 10:00:00', '2024-03-15 12:00:00']
        ];

        await connection.query('INSERT INTO attendance (member_id, check_in, check_out) VALUES ?', [attendance]);
        console.log('Sample attendance records inserted');

        // Insert sample payments
        const payments = [
            [1, 99.99, '2024-03-01 10:00:00', 'Membership'],
            [2, 249.99, '2024-03-01 11:00:00', 'Membership'],
            [3, 899.99, '2024-03-01 12:00:00', 'Membership']
        ];

        await connection.query('INSERT INTO payments (member_id, amount, payment_date, payment_type) VALUES ?', [payments]);
        console.log('Sample payments inserted');

        // Insert sample workout sessions
        const sessions = [
            [1, 1, '2024-03-15', '09:00:00', '10:00:00', 'Full body workout session'],
            [2, 2, '2024-03-15', '10:00:00', '11:00:00', 'Cardio session'],
            [3, 3, '2024-03-15', '11:00:00', '12:00:00', 'Strength training session']
        ];

        await connection.query('INSERT INTO workout_sessions (member_id, trainer_id, session_date, start_time, end_time, notes) VALUES ?', [sessions]);
        console.log('Sample workout sessions inserted');

        // Insert sample workout attendance
        const workoutAttendance = [
            [1, 1, '2024-03-15'],
            [2, 2, '2024-03-15'],
            [3, 3, '2024-03-15']
        ];

        await connection.query('INSERT INTO workout_attendance (member_id, workout_id, date) VALUES ?', [workoutAttendance]);
        console.log('Sample workout attendance inserted');

        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

initializeDatabase();