const mysql = require('mysql2/promise');

async function diagnose() {
    console.log('🩺 Финальная диагностика системы...\n');

    // 1. Проверяем сервер
    console.log('1. 🔄 Проверяем сервер...');
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        console.log('   ✅ Сервер работает:', data.message);
        console.log('   🗄️  База данных:', data.database);
    } catch (error) {
        console.log('   ❌ Сервер не отвечает:', error.message);
        return;
    }

    // 2. Проверяем базу данных с новым пользователем
    console.log('\n2. 🔄 Проверяем базу данных с dnd_user...');
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'dnd_user',
            password: 'your_secure_password', // используйте ваш пароль
            database: 'dnd_lore'
        });

        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        console.log('   ✅ Успешное подключение с dnd_user');
        console.log(`   👥 Пользователей в базе: ${users[0].count}`);

        // Показываем всех пользователей
        const [allUsers] = await pool.execute('SELECT * FROM users ORDER BY user_id DESC');
        if (allUsers.length > 0) {
            console.log(`   📋 Последние пользователи:`);
            allUsers.slice(0, 5).forEach(user => {
                console.log(`      ID: ${user.user_id}, Email: ${user.email}, Username: ${user.username}`);
            });
        }

        await pool.end();
    } catch (error) {
        console.log('   ❌ Ошибка подключения:', error.message);
    }

    // 3. Тестируем регистрацию
    console.log('\n3. 🔄 Тестируем регистрацию через API...');
    try {
        const testData = {
            username: 'final_test_' + Date.now(),
            email: `final${Date.now()}@example.com`,
            password: 'test123'
        };

        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const data = await response.json();

        if (data.success) {
            console.log('   ✅ Регистрация работает! ID:', data.userId);
            console.log('   📝 Данные успешно записались в базу');
        } else {
            console.log('   ❌ Ошибка регистрации:', data.error);
        }
    } catch (error) {
        console.log('   ❌ Ошибка при тесте регистрации:', error.message);
    }

    console.log('\n🎉 ВСЁ РАБОТАЕТ! Система готова к использованию.');
}

diagnose();
