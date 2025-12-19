const fetch = require('node-fetch');

async function testRegistration() {
    console.log('🧪 Тестируем регистрацию через API...');

    const testData = {
        username: 'testuser_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    try {
        console.log('📤 Отправляем данные:', testData);

        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Статус ответа:', response.status);

        const data = await response.json();
        console.log('📋 Данные ответа:', data);

        if (data.success) {
            console.log('✅ Регистрация через API успешна!');
            console.log('👤 ID пользователя:', data.userId);
        } else {
            console.log('❌ Ошибка регистрации:', data.error);
        }

    } catch (error) {
        console.error('🚨 Ошибка сети:', error.message);
        console.log('💡 Проверьте:');
        console.log('1. Запущен ли сервер на порту 3000');
        console.log('2. Правильность URL');
    }
}

testRegistration();
