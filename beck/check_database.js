const mysql = require('mysql2/promise');

async function checkDatabase() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'your_username',
        password: 'your_password',
        database: 'dnd_lore',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('🔍 Проверка структуры базы данных...');

        // Проверяем существование таблиц
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('📊 Таблицы в базе данных:');
        tables.forEach(table => {
            console.log(`   - ${table.Tables_in_dnd_lore}`);
        });

        // Проверяем пользователей
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Пользователей в системе: ${users[0].count}`);

        // Проверяем кампании
        const [campaigns] = await pool.execute('SELECT COUNT(*) as count FROM campaigns');
        console.log(`🏰 Кампаний в системе: ${campaigns[0].count}`);

        console.log('✅ База данных готова к работе!');

    } catch (error) {
        console.error('❌ Ошибка при проверке базы данных:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
