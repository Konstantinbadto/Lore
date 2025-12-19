const { createApp } = Vue;

createApp({
    data() {
        return {
            currentPage: 'reg',
            user: null,
            isLoading: false,
            message: { text: '', success: false },

            // Данные форм
            registerForm: { name: '', email: '', password: '' },
            loginForm: { email: '', password: '' },
            characterForm: {
                name: '', race: '', class: '', background: '',
                abilities: { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 },
                skills: []
            },
            campaignForm: {
                name: '', setting: '', plot: '', maxPlayers: 4,
                startingLevel: 1, difficulty: 'medium'
            },

            // Данные для компонентов
            players: [],
            messages: [],
            rollHistory: []
        };
    },

    computed: {
        isAuthenticated() {
            return api.isAuthenticated();
        },
        pointsLeft() {
            const pointCosts = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
            let used = 0;
            for (const ability in this.characterForm.abilities) {
                used += pointCosts[this.characterForm.abilities[ability]];
            }
            return 27 - used;
        }
    },

    methods: {
        // Навигация
        navigateTo(page) {
            this.currentPage = page;
        },

        // Показать сообщение
        showMessage(text, success = false) {
            this.message.text = text;
            this.message.success = success;
            setTimeout(() => { this.message.text = ''; }, 4000);
        },

        // Регистрация
        async registerUser() {
            if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password) {
                this.showMessage('Заполните все поля', false);
                return;
            }

            this.isLoading = true;
            try {
                await api.register({
                    username: this.registerForm.name,
                    email: this.registerForm.email,
                    password: this.registerForm.password
                });
                this.showMessage('Регистрация успешна! Войдите в систему.', true);
                this.registerForm = { name: '', email: '', password: '' };
                setTimeout(() => this.navigateTo('login'), 2000);
            } catch (error) {
                this.showMessage('Ошибка регистрации: ' + error.message, false);
            } finally {
                this.isLoading = false;
            }
        },

        // Вход
        async loginUser() {
            if (!this.loginForm.email || !this.loginForm.password) {
                this.showMessage('Заполните все поля', false);
                return;
            }

            this.isLoading = true;
            try {
                const result = await api.login({
                    email: this.loginForm.email,
                    password: this.loginForm.password
                });
                this.user = result.user;
                this.showMessage('Вход успешен!', true);
                setTimeout(() => this.navigateTo('dashboard'), 1000);
            } catch (error) {
                this.showMessage('Ошибка входа: ' + error.message, false);
            } finally {
                this.isLoading = false;
            }
        },

        // Выбор роли
        selectRole(role) {
            this.user.role = role;
            if (role === 'player') {
                this.navigateTo('character-creation');
            } else {
                this.navigateTo('campaign-creation');
            }
        },

        // Создание персонажа
        async createCharacter() {
            if (!this.characterForm.name || !this.characterForm.race || !this.characterForm.class) {
                this.showMessage('Заполните обязательные поля', false);
                return;
            }

            if (this.pointsLeft !== 0) {
                this.showMessage(`Используйте все очки характеристик! Осталось: ${this.pointsLeft}`, false);
                return;
            }

            this.isLoading = true;
            try {
                await api.saveCharacter(this.characterForm);
                this.showMessage('Персонаж создан!', true);
                setTimeout(() => this.navigateTo('game-hub'), 1000);
            } catch (error) {
                this.showMessage('Ошибка создания персонажа: ' + error.message, false);
            } finally {
                this.isLoading = false;
            }
        },

        // Создание кампании
        async createCampaign() {
            if (!this.campaignForm.name || !this.campaignForm.setting || !this.campaignForm.plot) {
                this.showMessage('Заполните обязательные поля', false);
                return;
            }

            this.isLoading = true;
            try {
                await api.createCampaign(this.campaignForm);
                this.showMessage('Кампания создана!', true);
                setTimeout(() => this.navigateTo('game-hub'), 1000);
            } catch (error) {
                this.showMessage('Ошибка создания кампании: ' + error.message, false);
            } finally {
                this.isLoading = false;
            }
        },

        // Выход
        logout() {
            api.logout();
            this.user = null;
            this.navigateTo('reg');
        },

        // Инициализация приложения
        initApp() {
            if (this.isAuthenticated) {
                this.user = api.getCurrentUser();
                // Проверяем, куда перенаправить пользователя
                if (!this.user.role) {
                    this.navigateTo('dashboard');
                } else if (this.user.role === 'player' && !this.user.character_id) {
                    this.navigateTo('character-creation');
                } else if (this.user.role === 'master' && !this.user.campaign_id) {
                    this.navigateTo('campaign-creation');
                } else {
                    this.navigateTo('game-hub');
                }
            } else {
                this.navigateTo('reg');
            }
        }
    },

    mounted() {
        this.initApp();
    }
}).mount('#app');
