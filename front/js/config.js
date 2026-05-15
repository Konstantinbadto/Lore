// front/js/config.js
const API_CONFIG = {
    // Автоматически определяет, где мы сейчас находимся
    getBaseUrl() {
        // Если запускаем локально (localhost)
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3307';
        }

        // Для Render и других хостингов
        return '';   // относительный путь
    },

    API_BASE: ''   // будет заполняться автоматически
};

// Инициализация
API_CONFIG.API_BASE = API_CONFIG.getBaseUrl();

export default API_CONFIG;
