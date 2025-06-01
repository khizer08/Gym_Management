const mysql = require('mysql2/promise');

async function checkData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Surjo@14',
            database: 'gym_management'
        });
        console.log('Connected to database.');

        // Check trainers
        console.log('\nChecking Trainers:');
        const [trainers] = await connection.query('SELECT * FROM trainers');
        if (trainers.length === 0) {
            console.log('No trainers found.');
        } else {
            trainers.forEach(trainer => {
                console.log(`ID: ${trainer.trainer_id}, Name: ${trainer.name}, Email: ${trainer.email}`);
            });
        }

        // Check members
        console.log('\nChecking Members:');
        const [members] = await connection.query('SELECT * FROM members');
        if (members.length === 0) {
            console.log('No members found.');
        } else {
            members.forEach(member => {
                console.log(`ID: ${member.member_id}, Name: ${member.name}, Assigned Trainer: ${member.assigned_trainer || 'None'}`);
            });
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed.');
        }
    }
}

checkData(); 