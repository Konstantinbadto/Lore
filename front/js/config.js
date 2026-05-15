// front/js/config.js
const API_CONFIG = {
    getBaseUrl: function() {
        const hostname = window.location.hostname;

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return "http://localhost:3307";
        }

        return "";
    }
};

// Инициализация
API_CONFIG.API_BASE = API_CONFIG.getBaseUrl();
window.API_CONFIG = API_CONFIG;

console.log('✅ API_CONFIG загружен →', API_CONFIG.API_BASE);
