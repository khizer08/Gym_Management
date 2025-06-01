const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/members'));
app.use('/api/trainers', require('./routes/trainers'));
// app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/trainer-attendance', require('./routes/trainer-attendance'));
app.use('/api/workout-attendance', require('./routes/workout-attendance'));
app.use('/api/workouts', require('./routes/workouts'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 