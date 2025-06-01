const mysql = require('mysql2/promise');

async function listTables() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Surjo@14',
            database: 'gym_management'
        });
        console.log('Connected to database.');

        const [rows] = await connection.query('SHOW TABLES;');
        console.log('Tables in gym_management database:');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });

    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

listTables(); 