const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all trainer attendance records
router.get('/', async (req, res) => {
    try {
        const [attendance] = await pool.query(`
            SELECT ta.*, t.name as trainer_name 
            FROM trainer_attendance ta
            JOIN trainers t ON ta.trainer_id = t.trainer_id
            ORDER BY ta.check_in DESC
        `);
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching trainer attendance:', error);
        res.status(500).json({ success: false, message: 'Error fetching trainer attendance' });
    }
});

// Get attendance by trainer ID
router.get('/trainer/:trainerId', async (req, res) => {
    try {
        const [attendance] = await pool.query(
            'SELECT * FROM trainer_attendance WHERE trainer_id = ? ORDER BY check_in DESC',
            [req.params.trainerId]
        );
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching trainer attendance:', error);
        res.status(500).json({ success: false, message: 'Error fetching trainer attendance' });
    }
});

// Check in trainer
router.post('/check-in', async (req, res) => {
    try {
        const { trainer_id } = req.body;
        const [result] = await pool.query(
            'INSERT INTO trainer_attendance (trainer_id) VALUES (?)',
            [trainer_id]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Check-in recorded successfully',
            attendanceId: result.insertId 
        });
    } catch (error) {
        console.error('Error recording trainer check-in:', error);
        res.status(500).json({ success: false, message: 'Error recording trainer check-in' });
    }
});

// Check out trainer
router.put('/check-out/:attendanceId', async (req, res) => {
    try {
        await pool.query(
            'UPDATE trainer_attendance SET check_out = CURRENT_TIMESTAMP WHERE attendance_id = ? AND check_out IS NULL',
            [req.params.attendanceId]
        );
        res.json({ success: true, message: 'Check-out recorded successfully' });
    } catch (error) {
        console.error('Error recording trainer check-out:', error);
        res.status(500).json({ success: false, message: 'Error recording trainer check-out' });
    }
});

module.exports = router; 