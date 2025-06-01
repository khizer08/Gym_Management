const mysql = require('mysql2/promise');

async function createDatabaseUser() {
    let connection;
    try {
        // Connect as root
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Surjo@14'
        });

        console.log('Connected to MySQL as root');

        // Create new user
        const username = 'gym_user';
        const password = 'Gym@123';
        
        // Create user
        await connection.query(`CREATE USER IF NOT EXISTS '${username}'@'localhost' IDENTIFIED BY '${password}'`);
        console.log(`Created user '${username}'`);

        // Grant privileges
        await connection.query(`GRANT ALL PRIVILEGES ON gym_management.* TO '${username}'@'localhost'`);
        console.log(`Granted privileges to '${username}' on gym_management database`);

        // Apply changes
        await connection.query('FLUSH PRIVILEGES');
        console.log('Privileges flushed');

        console.log('\nUser created successfully!');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('\nConnection details for your application:');
        console.log('Host: localhost');
        console.log('Database: gym_management');
        console.log('User:', username);
        console.log('Password:', password);

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

createDatabaseUser(); 