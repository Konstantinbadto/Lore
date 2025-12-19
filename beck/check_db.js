// check_db.js
const mysql = require('mysql2/promise');

async function checkDatabase() {
    console.log('🔍 Проверяем подключение к базе данных...');

    // Используйте ТЕ ЖЕ настройки что в server.js
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root', // ← ИЗМЕНИТЕ НА ВАШЕГО ПОЛЬЗОВАТЕЛЯ MYSQL
        password: '', // ← ИЗМЕНИТЕ НА ВАШ ПАРОЛЬ MYSQL
        database: 'dnd_lore',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        // Проверяем подключение
        const connection = await pool.getConnection();
        console.log('✅ Подключение к MySQL успешно');
        connection.release();

        // Проверяем таблицы
        const [tables] = await pool.execute('SHOW TABLES');
        console.log(`📊 Найдено таблиц: ${tables.length}`);

        tables.forEach(table => {
            console.log(`   - ${table.Tables_in_dnd_lore}`);
        });

        // Проверяем пользователей
        const [users] = await pool.execute('SELECT * FROM users');
        console.log(`👥 Пользователей в системе: ${users.length}`);

        if (users.length > 0) {
            console.log('\n📋 Список пользователей:');
            users.forEach(user => {
                console.log(`   ID: ${user.user_id}, Email: ${user.email}, Username: ${user.username}`);
            });
        } else {
            console.log('   (нет пользователей)');
        }

    } catch (error) {
        console.error('❌ Ошибка подключения к базе:', error.message);
        console.log('\n💡 Возможные решения:');
        console.log('1. Проверьте запущен ли MySQL сервер');
        console.log('2. Убедитесь что база данных "dnd_lore" существует');
        console.log('3. Проверьте username/password в настройках подключения');
        console.log('4. Для XAMPP/WAMP обычно: user="root", password=""');
    } finally {
        await pool.end();
    }
}

checkDatabase();
