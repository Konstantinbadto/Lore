const { createApp } = Vue;

createApp({
    data() {
        return {
            masterName: 'Гэндальф',
            showUserMenu: false,
            campaign: {
                name: '',
                setting: '',
                customSetting: '',
                plot: '',
                tone: 'heroic',
                maxPlayers: 4,
                startingLevel: 1,
                allowHomebrew: false,
                allowMulticlass: true,
                sessionFrequency: 'weekly',
                difficulty: 'medium'
            },
            message: {
                text: '',
                success: false
            },
            tones: [
                {
                    value: 'heroic',
                    name: 'Героический',
                    description: 'Эпические подвиги и спасение мира',
                    icon: 'fas fa-shield-alt'
                },
                {
                    value: 'dark',
                    name: 'Мрачный',
                    description: 'Ужасы и моральные дилеммы',
                    icon: 'fas fa-moon'
                },
                {
                    value: 'humorous',
                    name: 'Юмористический',
                    description: 'Весёлые приключения и комедия',
                    icon: 'fas fa-laugh'
                },
                {
                    value: 'mystery',
                    name: 'Загадочный',
                    description: 'Тайны и расследования',
                    icon: 'fas fa-search'
                },
                {
                    value: 'sandbox',
                    name: 'Песочница',
                    description: 'Свободные исследования',
                    icon: 'fas fa-map-marked-alt'
                }
            ]
        };
    },
    computed: {
        completionPercentage() {
            let filled = 0;
            const total = 5; // name, setting, plot, maxPlayers, startingLevel

            if (this.campaign.name.trim()) filled++;
            if (this.campaign.setting) filled++;
            if (this.campaign.plot.trim()) filled++;
            if (this.campaign.maxPlayers) filled++;
            if (this.campaign.startingLevel) filled++;

            return Math.round((filled / total) * 100);
        },
        canCreate() {
            return this.campaign.name.trim() &&
                   this.campaign.setting &&
                   this.campaign.plot.trim() &&
                   this.campaign.maxPlayers >= 3 &&
                   this.campaign.maxPlayers <= 6;
        }
    },
    methods: {
        toggleUserMenu() {
            this.showUserMenu = !this.showUserMenu;
        },

        increasePlayers() {
            if (this.campaign.maxPlayers < 6) {
                this.campaign.maxPlayers++;
            }
        },

        decreasePlayers() {
            if (this.campaign.maxPlayers > 3) {
                this.campaign.maxPlayers--;
            }
        },

        getSettingName(setting) {
            const settings = {
                'forgotten-realms': 'Забытые Королевства',
                'eberron': 'Эберрон',
                'ravenloft': 'Равенлофт',
                'dark-sun': 'Тёмное Солнце',
                'planescape': 'Планарные странствия',
                'spelljammer': 'Заклинательный Летун',
                'custom': this.campaign.customSetting || 'Свой сеттинг'
            };
            return settings[setting] || setting;
        },

        getToneName(tone) {
            const toneObj = this.tones.find(t => t.value === tone);
            return toneObj ? toneObj.name : tone;
        },

        getFrequencyName(frequency) {
            const frequencies = {
                'weekly': 'Еженедельно',
                'biweekly': 'Раз в две недели',
                'monthly': 'Ежемесячно',
                'flexible': 'Гибкий график'
            };
            return frequencies[frequency] || frequency;
        },

        getDifficultyName(difficulty) {
            const difficulties = {
                'easy': 'Лёгкая',
                'medium': 'Средняя',
                'hard': 'Сложная',
                'deadly': 'Смертельная'
            };
            return difficulties[difficulty] || difficulty;
        },

        getDifficultyClass(difficulty) {
            return difficulty;
        },

        saveDraft() {
            // Имитация сохранения черновика
            localStorage.setItem('campaignDraft', JSON.stringify(this.campaign));
            this.showMessage('Черновик кампании сохранён!', true);
        },

        createCampaign() {
            if (!this.canCreate) {
                this.showMessage('Заполните все обязательные поля правильно', false);
                return;
            }

            // Создаем финальный объект кампании
            const finalCampaign = {
                ...this.campaign,
                id: Date.now().toString(),
                master: this.masterName,
                created: new Date().toISOString(),
                status: 'recruiting',
                players: [],
                sessions: []
            };

            // Имитация сохранения кампании
            setTimeout(() => {
                this.showMessage(`Кампания "${this.campaign.name}" успешно создана!`, true);

                // Очищаем форму
                this.campaign = {
                    name: '',
                    setting: '',
                    customSetting: '',
                    plot: '',
                    tone: 'heroic',
                    maxPlayers: 4,
                    startingLevel: 1,
                    allowHomebrew: false,
                    allowMulticlass: true,
                    sessionFrequency: 'weekly',
                    difficulty: 'medium'
                };

                // В реальном приложении здесь будет редирект
                // window.location.href = 'campaign-management.html';
            }, 1000);
        },

        showMessage(text, success) {
            this.message.text = text;
            this.message.success = success;

            setTimeout(() => {
                this.message.text = '';
            }, 4000);
        }
    },

    mounted() {
        // Загружаем черновик если есть
        const draft = localStorage.getItem('campaignDraft');
        if (draft) {
            this.campaign = { ...this.campaign, ...JSON.parse(draft) };
        }

        // Закрывать меню пользователя при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.showUserMenu = false;
            }
        });
    }
}).mount('#app');
