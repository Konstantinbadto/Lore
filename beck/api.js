class DnDAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    // Регистрация пользователя
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }

            return data;
        } catch (error) {
            console.error('API Register Error:', error);
            throw error;
        }
    }

    // Вход пользователя
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }

            // Сохраняем токен и данные пользователя
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            return data;
        } catch (error) {
            console.error('API Login Error:', error);
            throw error;
        }
    }

    // Получение данных текущего пользователя
    async getCurrentUserData() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch(`${this.baseURL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка получения данных');
            }

            // Обновляем данные пользователя
            this.updateUserData(data.user);
            return data;
        } catch (error) {
            console.error('API Get User Error:', error);
            throw error;
        }
    }

    // Создание персонажа
    async createCharacter(characterData) {
        try {
            const token = this.getToken();
            const response = await fetch(`${this.baseURL}/characters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(characterData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка создания персонажа');
            }

            return data;
        } catch (error) {
            console.error('API Create Character Error:', error);
            throw error;
        }
    }

    // Создание кампании
    async createCampaign(campaignData) {
        try {
            const token = this.getToken();
            const response = await fetch(`${this.baseURL}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(campaignData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка создания кампании');
            }

            return data;
        } catch (error) {
            console.error('API Create Campaign Error:', error);
            throw error;
        }
    }

    // Получение списка кампаний
    async getCampaigns() {
        try {
            const response = await fetch(`${this.baseURL}/campaigns`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка получения кампаний');
            }

            return data;
        } catch (error) {
            console.error('API Get Campaigns Error:', error);
            throw error;
        }
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.getToken() !== null;
    }

    // Получение данных текущего пользователя из localStorage
    getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    // Получение токена
    getToken() {
        return localStorage.getItem('auth_token');
    }

    // Обновление данных пользователя
    updateUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    // Выход
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
}

// Создаем глобальный экземпляр API
const api = new DnDAPI();
