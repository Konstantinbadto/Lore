const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Инициализация данных
async function initData() {
    try {
        await fs.access(DATA_FILE);
        console.log('✅ Файл данных найден');
    } catch (error) {
        // Создаем начальные данные
        const initialData = {
            users: [],
            characters: [],
            campaigns: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Файл данных создан');
    }
}

// Чтение данных
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [], characters: [], campaigns: [] };
    }
}

// Запись данных
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('📝 Регистрация:', { username, email });

        const data = await readData();

        // Проверяем существование пользователя
        const existingUser = data.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Пользователь с таким email уже существует'
            });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const newUser = {
            user_id: Date.now(),
            username,
            email,
            password_hash: hashedPassword,
            role: 'player',
            is_active: true,
            created_at: new Date().toISOString(),
            last_login: null
        };

        data.users.push(newUser);
        await writeData(data);

        console.log('✅ Пользователь создан, ID:', newUser.user_id);

        res.json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            userId: newUser.user_id
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при регистрации'
        });
    }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Попытка входа:', { email });

        const data = await readData();

        // Ищем пользователя
        const user = data.users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                error: 'Неверный пароль'
            });
        }

        // Обновляем время входа
        user.last_login = new Date().toISOString();
        await writeData(data);

        // Создаем JWT токен
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Успешный вход:', user.username);

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при входе'
        });
    }
});

// Получение данных пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const data = await readData();
        const user = data.users.find(u => u.user_id === req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        // Находим персонажей пользователя
        const characters = data.characters.filter(c => c.user_id === user.user_id);
        const character = characters.length > 0 ? characters[0] : null;

        let campaign = null;
        if (character && character.campaign_id) {
            campaign = data.campaigns.find(c => c.campaign_id === character.campaign_id);
        }

        res.json({
            success: true,
            user: {
                ...user,
                character,
                campaign
            }
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера'
        });
    }
});

// Создание персонажа
app.post('/api/characters', authenticateToken, async (req, res) => {
    try {
        const characterData = req.body;
        const userId = req.user.userId;

        console.log('🎭 Создание персонажа для пользователя:', userId);

        const data = await readData();

        const newCharacter = {
            character_id: Date.now(),
            user_id: userId,
            name: characterData.name,
            race: characterData.race,
            class: characterData.class,
            level: characterData.level || 1,
            background: characterData.background || '',
            is_active: true,
            created_at: new Date().toISOString(),
            abilities: characterData.abilities || {},
            skills: characterData.skills || []
        };

        data.characters.push(newCharacter);
        await writeData(data);

        console.log('✅ Персонаж создан, ID:', newCharacter.character_id);

        res.json({
            success: true,
            message: 'Персонаж создан',
            characterId: newCharacter.character_id
        });

    } catch (error) {
        console.error('❌ Create character error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка создания персонажа'
        });
    }
});

// Создание кампании
app.post('/api/campaigns', authenticateToken, async (req, res) => {
    try {
        const campaignData = req.body;
        const userId = req.user.userId;

        console.log('🏰 Создание кампании пользователем:', userId);

        const data = await readData();

        const newCampaign = {
            campaign_id: Date.now(),
            master_id: userId,
            name: campaignData.name,
            setting: campaignData.setting,
            description: campaignData.description || '',
            plot_summary: campaignData.plot || '',
            max_players: campaignData.maxPlayers || 4,
            starting_level: campaignData.startingLevel || 1,
            difficulty: campaignData.difficulty || 'medium',
            session_frequency: campaignData.sessionFrequency || 'weekly',
            allow_homebrew: campaignData.allowHomebrew || false,
            allow_multiclass: campaignData.allowMulticlass || true,
            status: 'recruiting',
            created_at: new Date().toISOString()
        };

        data.campaigns.push(newCampaign);
        await writeData(data);

        console.log('✅ Кампания создана, ID:', newCampaign.campaign_id);

        res.json({
            success: true,
            message: 'Кампания создана',
            campaignId: newCampaign.campaign_id
        });

    } catch (error) {
        console.error('❌ Create campaign error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка создания кампании'
        });
    }
});

// Получение списка кампаний
app.get('/api/campaigns', async (req, res) => {
    try {
        const data = await readData();

        const campaigns = data.campaigns
            .filter(c => c.status === 'recruiting')
            .map(campaign => {
                const master = data.users.find(u => u.user_id === campaign.master_id);
                return {
                    ...campaign,
                    master_name: master ? master.username : 'Unknown'
                };
            });

        res.json({
            success: true,
            campaigns
        });

    } catch (error) {
        console.error('❌ Get campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения кампаний'
        });
    }
});

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Токен отсутствует'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Неверный токен'
            });
        }
        req.user = user;
        next();
    });
}

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await readData(); // Просто проверяем что файл читается
        res.json({
            success: true,
            message: 'API работает нормально',
            storage: 'local_file',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка работы с данными'
        });
    }
});

// Инициализация и запуск
async function startServer() {
    await initData();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log('💾 Хранилище: локальный файл (data.json)');
        console.log('📋 API endpoints готовы к работе!');
    });
}

startServer();
