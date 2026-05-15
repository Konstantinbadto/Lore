// front/js/config.js
const API_CONFIG = {
    // Автоматически определяет окружение
    getBaseUrl: function() {
        const hostname = window.location.hostname;

        // Локальная разработка
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return "http://localhost:3307";
        }

        // На Render.com и других хостингах
        return "";
    }
};

// Инициализация
API_CONFIG.API_BASE = API_CONFIG.getBaseUrl();

// Делаем доступным глобально
window.API_CONFIG = API_CONFIG;

console.log('✅ API_CONFIG загружен. Base:', API_CONFIG.API_BASE);
