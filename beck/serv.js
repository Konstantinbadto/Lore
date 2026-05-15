
const express = require('express');
const cassandra = require('cassandra-driver');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к Cassandra
const client = new cassandra.Client({
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'registration_db'
});


app.post('/api/register', async (req, res) => {
    try {
        const { name, email } = req.body;

        // Проверка существующего email
        const checkQuery = 'SELECT email FROM users WHERE email = ?';
        const checkResult = await client.execute(checkQuery, [email], { prepare: true });

        if (checkResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Вставка нового пользователя
        const insertQuery = `
            INSERT INTO users (id, name, email, created_at)
            VALUES (uuid(), ?, ?, toTimestamp(now()))
        `;

        await client.execute(insertQuery, [name, email], { prepare: true });

        res.json({
            success: true,
            message: 'Пользователь успешно зарегистрирован'
        });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
