const mysql = require('mysql2/promise');

async function checkAssignedMembers() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'gym_management'
        });
        console.log('Connected to database.');

        const trainerId = 1; // Trainer ID to check
        const [rows] = await connection.query('SELECT member_id, name, assigned_trainer FROM members WHERE assigned_trainer = ?', [trainerId]);
        
        console.log(`Members assigned to Trainer ID ${trainerId}:`);
        if (rows.length === 0) {
            console.log('No members assigned.');
        } else {
            rows.forEach(row => {
                console.log(`ID: ${row.member_id}, Name: ${row.name}`);
            });
        }

    } catch (error) {
        console.error('Error checking assigned members:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

checkAssignedMembers(); 