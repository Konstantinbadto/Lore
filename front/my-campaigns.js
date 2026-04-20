// my-campaigns.js
// Отдельный файл для страницы "Мои кампании"

const { createApp } = Vue;

createApp({
    data() {
        return {
            masterName: 'Мастер',
            loading: false,
            myCampaigns: [],
            message: { text: '', success: true }
        };
    },

    methods: {
        // Получение данных пользователя
        async getUserData() {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.masterName = data.user?.username || 'Мастер';
                } else {
                    localStorage.removeItem('auth_token');
                    window.location.href = 'login.html';
                }
            } catch (e) {
                console.error(e);
                this.showMessage('Ошибка подключения', false);
            }
        },

        // Загрузка всех кампаний текущего мастера
        async loadMyCampaigns() {
            this.loading = true;
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE}/api/campaigns/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.myCampaigns = data.campaigns || [];
                } else {
                    this.showMessage('Не удалось загрузить кампании', false);
                }
            } catch (e) {
                console.error('Ошибка загрузки кампаний:', e);
                this.showMessage('Ошибка сервера при загрузке кампаний', false);
            } finally {
                this.loading = false;
            }
        },

        // Переход на страницу редактирования выбранной кампании
        openCampaign(campaignId) {
            if (!campaignId) return;
            window.location.href = `campaign.html?id=${campaignId}`;
            // Или если используешь hash: window.location.href = `campaign.html#${campaignId}`;
        },

        // Создать новую кампанию
        createNewCampaign() {
            window.location.href = 'campaign.html';   // или campaign-create.html
        },

        showMessage(text, success = true) {
            this.message.text = text;
            this.message.success = success;
            setTimeout(() => {
                this.message.text = '';
            }, 4000);
        },

        logout() {
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        }
    },

    mounted() {
        this.getUserData();
        this.loadMyCampaigns();
    }
}).mount('#app');
