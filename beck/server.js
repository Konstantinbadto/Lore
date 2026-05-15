const path = require('path');
const dotenv = require('dotenv');

// === ЗАГРУЗКА .env ===
const result = dotenv.config({
  path: path.resolve(__dirname, '.env'),
  override: true
});

if (result.error) {
  console.error('❌ DOTENV ERROR:', result.error.message);
} else {
  console.log('✅ .env успешно загружен');
}

// ====================== IMPORTS ======================
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3307;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-2026-change-me-please!';

// ====================== MIDDLEWARE ======================
app.use(cors({
    origin: '*',                    // Для разработки. Потом заменишь на домен фронтенда
    credentials: true
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});
// ====================== РАЗДАЧА ФРОНТЕНДА ======================
const path = require('path');

// Раздаём все файлы из папки front
app.use(express.static(path.join(__dirname, '../front')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front', 'login.html'));
});

// Ловим все остальные GET-запросы (чтобы при обновлении страницы не было Cannot GET)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front', 'login.html'));
});
// ====================== MySQL POOL ======================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dnd_lore',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    timezone: '+00:00'
});

// ====================== AUTH MIDDLEWARE ======================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Токен отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: 'Неверный или истёкший токен' });
        req.user = user;
        next();
    });
}

// ====================== ROUTES ======================

// 1. Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, login } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Не все обязательные поля заполнены'
            });
        }

        const [existing] = await pool.execute(
            'SELECT id FROM User WHERE email = ? OR login = ?',
            [email, login || username.toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Пользователь с таким email или логином уже существует'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            `INSERT INTO User (username, login, email, password_hash, role)
             VALUES (?, ?, ?, ?, 'player')`,
            [username, login || username.toLowerCase(), email, hashedPassword]
        );

        console.log(`✅ Новый пользователь зарегистрирован: ${username} (${email})`);

        res.status(201).json({
            success: true,
            message: 'Регистрация прошла успешно',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при регистрации'
        });
    }
});

// 2. Вход (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
        }

        const [rows] = await pool.execute(
            'SELECT id, username, login, email, role, password_hash FROM User WHERE email = ? OR login = ?',
            [email, email]
        );

        const user = rows[0];
        if (!user) {
            return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                user_id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'player'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// 3. Получение текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, login, email, role FROM User WHERE id = ?',
            [req.user.userId]
        );

        const user = users[0];
        if (!user) return res.status(404).json({ success: false, error: 'Пользователь не найден' });

        res.json({
            success: true,
            user: {
                ...user,
                user_id: user.id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});
app.post('/api/auth/select-role', authenticateToken, async (req, res) => {
    try {
        const { role } = req.body;

        // Валидация роли
        if (!role || !['player', 'master'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Неверная роль. Допустимо: player или master'
            });
        }

        // Обновляем роль пользователя
        const [result] = await pool.execute(
            'UPDATE User SET role = ? WHERE id = ?',
            [role, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        // Получаем обновлённые данные пользователя
        const [users] = await pool.execute(
            'SELECT id, username, login, email, role FROM User WHERE id = ?',
            [req.user.userId]
        );

        const updatedUser = users[0];

        // Создаём новый токен с актуальной ролью
        const newToken = jwt.sign(
            {
                userId: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`✅ Пользователь ${updatedUser.username} выбрал роль: ${role}`);

        res.json({
            success: true,
            message: `Роль "${role === 'player' ? 'Игрок' : 'Мастер'}" успешно выбрана`,
            role: updatedUser.role,
            token: newToken,
            user: {
                user_id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error('Select role error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при выборе роли'
        });
    }
});
// 4. Создание персонажа
app.post('/api/characters', authenticateToken, async (req, res) => {
    try {
        const {
            name, race, class: charClass, background,
            strength = 8, dexterity = 8, constitution = 8,
            intelligence = 8, wisdom = 8, charisma = 8,
            level = 1
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO \`character\`
             (user_id, name, race, class, background, level,
              strength, dexterity, constitution, intelligence, wisdom, charisma)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, name, race, charClass, background || null, level,
             strength, dexterity, constitution, intelligence, wisdom, charisma]
        );

        res.json({
            success: true,
            message: 'Персонаж успешно создан',
            characterId: result.insertId
        });
    } catch (error) {
        console.error('Create character error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Ошибка при создании персонажа'
        });
    }
});
app.get('/api/characters', authenticateToken, async (req, res) => {
    try {
        const [characters] = await pool.execute(
            `SELECT id, name, race, class, background, level, experience,
                    strength, dexterity, constitution, intelligence,
                    wisdom, charisma, created_at
             FROM \`character\`
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            characters: characters
        });
    } catch (error) {
        console.error('Get characters error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при загрузке списка персонажей'
        });
    }
});
// ====================== КАМПАНИИ ======================
app.get('/api/campaign/:id/header', authenticateToken, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);

        if (isNaN(campaignId)) {
            return res.status(400).json({ success: false, error: 'Неверный ID кампании' });
        }

        const [rows] = await pool.execute(`
            SELECT
                c.id,
                c.name AS campaignName,
                c.setting AS campaignSetting,
                c.tone,
                c.difficulty,
                c.status,
                u.username AS gameMaster,
                u.id AS master_id
            FROM Campaign c
            JOIN User u ON c.master_id = u.id
            WHERE c.id = ?
              AND (
                  c.master_id = ?                                      -- Мастер имеет полный доступ
                  OR EXISTS (                                          -- Игрок состоит в кампании
                      SELECT 1
                      FROM Campaign_Player cp
                      WHERE cp.campaign_id = c.id
                        AND cp.player_id = ?
                  )
              )
        `, [campaignId, req.user.userId, req.user.userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Кампания не найдена или у вас нет доступа'
            });
        }

        const campaign = rows[0];

        res.json({
            success: true,
            data: {
                campaignName: campaign.campaignName,
                gameMaster: campaign.gameMaster,
                campaignSetting: campaign.campaignSetting || 'Неизвестно',
                tone: campaign.tone || 'Эпический',
                difficulty: campaign.difficulty || 'medium',
                status: campaign.status,
                isMaster: campaign.master_id === req.user.userId   // удобно для фронта
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки header кампании:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при загрузке данных кампании'
        });
    }
});
// 1. Получить ВСЕ кампании текущего мастера
app.get('/api/campaigns/my', authenticateToken, async (req, res) => {
    try {
        const [campaigns] = await pool.execute(`
            SELECT id, name, setting, custom_setting, plot, tone,
                   max_players, starting_level, allow_homebrew,
                   allow_multiclass, session_frequency, difficulty,
                   status, created_at, updated_at
            FROM Campaign
            WHERE master_id = ?
            ORDER BY created_at DESC
        `, [req.user.userId]);

        res.json({
            success: true,
            campaigns
        });
    } catch (error) {
        console.error('Ошибка получения моих кампаний:', error);
        res.status(500).json({ success: false, error: 'Ошибка получения кампаний' });
    }
});

// 2. Получить одну кампанию по ID (только свою)
app.get('/api/campaigns/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM Campaign
            WHERE id = ? AND master_id = ?
        `, [req.params.id, req.user.userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Кампания не найдена или доступ запрещён'
            });
        }

        res.json({
            success: true,
            campaign: rows[0]   // лучше явно указать ключ, чем спредить
        });
    } catch (error) {
        console.error('Ошибка загрузки кампании:', error);
        res.status(500).json({ success: false, error: 'Ошибка загрузки кампании' });
    }
});

// 3. Создание новой кампании (ОДИН обработчик!)
app.post('/api/campaigns', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            setting,
            custom_setting,
            plot,
            tone = null,
            max_players = 4,
            starting_level = 1,
            allow_homebrew = false,
            allow_multiclass = true,
            session_frequency = 'weekly',
            difficulty = 'medium'
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO Campaign
             (master_id, name, setting, custom_setting, plot, tone,
              max_players, starting_level, allow_homebrew, allow_multiclass,
              session_frequency, difficulty, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'recruiting')`,
            [
                req.user.userId,
                name,
                setting,
                custom_setting,
                plot,
                tone,
                max_players,
                starting_level,
                allow_homebrew ? 1 : 0,
                allow_multiclass ? 1 : 0,
                session_frequency,
                difficulty
            ]
        );

        res.json({
            success: true,
            message: 'Кампания успешно создана',
            campaignId: result.insertId
        });
    } catch (error) {
        console.error('Ошибка создания кампании:', error);
        res.status(500).json({ success: false, error: 'Ошибка создания кампании' });
    }
});

// 4. Обновление кампании (PUT)
app.put('/api/campaigns/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            setting,
            custom_setting,
            plot,
            tone,
            max_players,
            starting_level,
            allow_homebrew,
            allow_multiclass,
            session_frequency,
            difficulty
        } = req.body;

        const [result] = await pool.execute(`
            UPDATE Campaign
            SET name = ?,
                setting = ?,
                custom_setting = ?,
                plot = ?,
                tone = ?,
                max_players = ?,
                starting_level = ?,
                allow_homebrew = ?,
                allow_multiclass = ?,
                session_frequency = ?,
                difficulty = ?,
                updated_at = NOW()
            WHERE id = ? AND master_id = ?
        `, [
            name, setting, custom_setting, plot, tone,
            max_players, starting_level,
            allow_homebrew ? 1 : 0,
            allow_multiclass ? 1 : 0,
            session_frequency, difficulty,
            id, req.user.userId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Кампания не найдена или у вас нет прав на редактирование'
            });
        }

        res.json({ success: true, message: 'Кампания успешно обновлена' });
    } catch (error) {
        console.error('Ошибка обновления кампании:', error);
        res.status(500).json({ success: false, error: 'Ошибка обновления кампании' });
    }
});
// ====================== HEALTH CHECK ======================
app.get('/api/health', async (req, res) => {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        res.json({
            success: true,
            message: 'Сервер и база данных работают',
            tables: tables.map(t => Object.values(t)[0])
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Проблема с базой данных',
            details: error.message
        });
    }
});

// ====================== ЗАПУСК СЕРВЕРА ======================
app.listen(PORT, () => {
    console.log(`🚀 D&D Lore Server запущен на порту ${PORT}`);
    console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
