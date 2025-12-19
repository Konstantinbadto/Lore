const { createApp } = Vue;

createApp({
    data() {
        return {
            campaignName: 'Проклятие Древнего Леса',
            gameMaster: 'Гэндальф',
            userName: 'Арагорн',
            showUserMenu: false,
            isVoiceActive: false,
            isMusicPlaying: false,
            mapZoom: 1,
            newMessage: '',
            lastRoll: null,
            lastRollDescription: '',
            showDiceModal: false,
            customDiceCount: 1,
            customDiceSides: 6,
            sessionTime: 0,
            timerInterval: null,
            message: {
                text: '',
                success: false
            },
            // Данные игроков
            players: [
                { id: 1, name: 'Гэндальф', character: 'Маг', level: 5, status: 'online', icon: 'fas fa-crown', isMaster: true },
                { id: 2, name: 'Арагорн', character: 'Следопыт', level: 4, status: 'online', icon: 'fas fa-helmet-battle', isCurrentUser: true },
                { id: 3, name: 'Леголас', character: 'Лучник', level: 4, status: 'online', icon: 'fas fa-bow-arrow' },
                { id: 4, name: 'Гимли', character: 'Воин', level: 4, status: 'away', icon: 'fas fa-axe-battle' },
                { id: 5, name: 'Фродо', character: 'Плут', level: 3, status: 'dnd', icon: 'fas fa-ring' }
            ],
            maxPlayers: 6,
            // Сообщения чата
            messages: [
                { id: 1, type: 'system', content: 'Добро пожаловать в кампанию "Проклятие Древнего Леса"!', timestamp: new Date(Date.now() - 3600000) },
                { id: 2, type: 'master', sender: 'Гэндальф', content: 'Вы стоите на опушке древнего леса. Воздух наполнен магией...', timestamp: new Date(Date.now() - 1800000) },
                { id: 3, type: 'player', sender: 'Леголас', content: 'Я слышу шепот деревьев. Они говорят об опасности.', timestamp: new Date(Date.now() - 1200000) },
                { id: 4, type: 'player', sender: 'Гимли', content: 'Где мой топор? Пора рубить!', timestamp: new Date(Date.now() - 600000) },
                { id: 5, type: 'player', sender: 'Арагорн', content: 'Осторожно, друзья. Этот лес хранит древние тайны.', timestamp: new Date(Date.now() - 300000) }
            ],
            // История бросков
            rollHistory: [
                { id: 1, description: 'd20 - Атака', result: 17 },
                { id: 2, description: 'd8 - Урон', result: 6 },
                { id: 3, description: 'd20 - Спасбросок', result: 12 },
                { id: 4, description: '2d6 - Урон заклинания', result: 8 }
            ],
            // Опции кубиков
            diceOptions: [
                { value: 'd4', name: 'd4', icon: 'fas fa-dice-d4' },
                { value: 'd6', name: 'd6', icon: 'fas fa-dice-d6' },
                { value: 'd8', name: 'd8', icon: 'fas fa-dice-d8' },
                { value: 'd10', name: 'd10', icon: 'fas fa-dice-d10' },
                { value: 'd12', name: 'd12', icon: 'fas fa-dice-d12' },
                { value: 'd20', name: 'd20', icon: 'fas fa-dice-d20' },
                { value: 'd100', name: 'd100', icon: 'fas fa-dice-d20' }
            ],
            // Тестовая карта
            mapCells: Array.from({ length: 80 }, (_, i) => ({
                id: i,
                type: ['grass', 'forest', 'mountain', 'water'][Math.floor(Math.random() * 4)],
                token: Math.random() > 0.9 ? {
                    type: ['player', 'enemy', 'npc'][Math.floor(Math.random() * 3)],
                    icon: ['fas fa-helmet-battle', 'fas fa-skull', 'fas fa-user'][Math.floor(Math.random() * 3)]
                } : null
            }))
        };
    },
    computed: {
        onlinePlayers() {
            return this.players.filter(player => player.status === 'online').length;
        },
        musicIcon() {
            return this.isMusicPlaying ? 'fa-volume-up' : 'fa-volume-mute';
        },
        musicButtonText() {
            return this.isMusicPlaying ? 'Выкл. музыку' : 'Вкл. музыку';
        },
        voiceIcon() {
            return this.isVoiceActive ? 'fa-microphone' : 'fa-microphone-slash';
        }
    },
    methods: {
        toggleUserMenu() {
            this.showUserMenu = !this.showUserMenu;
        },

        toggleVoice() {
            this.isVoiceActive = !this.isVoiceActive;
            this.showMessage(this.isVoiceActive ? 'Голосовой чат активирован' : 'Голосовой чат деактивирован', true);
        },

        toggleMusic() {
            this.isMusicPlaying = !this.isMusicPlaying;
            this.showMessage(this.isMusicPlaying ? 'Фоновая музыка включена' : 'Фоновая музыка выключена', true);
        },

        zoomIn() {
            if (this.mapZoom < 2) {
                this.mapZoom += 0.1;
            }
        },

        zoomOut() {
            if (this.mapZoom > 0.5) {
                this.mapZoom -= 0.1;
            }
        },

        resetZoom() {
            this.mapZoom = 1;
        },

        sendMessage() {
            if (this.newMessage.trim()) {
                const message = {
                    id: Date.now(),
                    type: 'player',
                    sender: this.userName,
                    content: this.newMessage,
                    timestamp: new Date()
                };
                this.messages.push(message);
                this.newMessage = '';

                // Автоскролл к новому сообщению
                this.$nextTick(() => {
                    const chatMessages = this.$refs.chatMessages;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            }
        },

        quickRoll(diceType) {
            this.rollDice(diceType);
            this.sendMessage(`${this.userName} бросает ${diceType}: ${this.lastRoll}`);
        },

        rollDice(diceType) {
            let result;
            let description = `Бросок ${diceType}`;

            switch (diceType) {
                case 'd4':
                    result = Math.floor(Math.random() * 4) + 1;
                    break;
                case 'd6':
                    result = Math.floor(Math.random() * 6) + 1;
                    break;
                case 'd8':
                    result = Math.floor(Math.random() * 8) + 1;
                    break;
                case 'd10':
                    result = Math.floor(Math.random() * 10) + 1;
                    break;
                case 'd12':
                    result = Math.floor(Math.random() * 12) + 1;
                    break;
                case 'd20':
                    result = Math.floor(Math.random() * 20) + 1;
                    // Особые результаты для d20
                    if (result === 20) description = 'КРИТИЧЕСКИЙ УСПЕХ!';
                    else if (result === 1) description = 'КРИТИЧЕСКИЙ ПРОВАЛ!';
                    break;
                case 'd100':
                    result = Math.floor(Math.random() * 100) + 1;
                    break;
                default:
                    result = 0;
            }

            this.lastRoll = result;
            this.lastRollDescription = description;

            // Добавляем в историю
            this.rollHistory.push({
                id: Date.now(),
                description: diceType,
                result: result
            });

            // Ограничиваем историю
            if (this.rollHistory.length > 10) {
                this.rollHistory.shift();
            }
        },

        rollCustomDice() {
            if (this.customDiceCount < 1 || this.customDiceCount > 10 ||
                this.customDiceSides < 2 || this.customDiceSides > 100) {
                this.showMessage('Некорректные параметры кубиков', false);
                return;
            }

            let total = 0;
            let rolls = [];

            for (let i = 0; i < this.customDiceCount; i++) {
                const roll = Math.floor(Math.random() * this.customDiceSides) + 1;
                rolls.push(roll);
                total += roll;
            }

            this.lastRoll = total;
            this.lastRollDescription = `Бросок ${this.customDiceCount}d${this.customDiceSides}: [${rolls.join(', ')}]`;

            this.rollHistory.push({
                id: Date.now(),
                description: `${this.customDiceCount}d${this.customDiceSides}`,
                result: total
            });

            if (this.rollHistory.length > 10) {
                this.rollHistory.shift();
            }
        },

        openDiceModal() {
            this.showDiceModal = true;
        },

        shareScreen() {
            this.showMessage('Функция общего доступа к экрану активирована', true);
        },

        openNotes() {
            this.showMessage('Открытие заметок персонажа', true);
        },

        startTimer() {
            if (!this.timerInterval) {
                this.timerInterval = setInterval(() => {
                    this.sessionTime++;
                }, 1000);
            }
        },

        pauseTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },

        resetTimer() {
            this.pauseTimer();
            this.sessionTime = 0;
        },

        getStatusText(status) {
            const statuses = {
                'online': 'В сети',
                'away': 'Отошёл',
                'dnd': 'Не беспокоить'
            };
            return statuses[status] || status;
        },

        formatTime(timestamp) {
            if (typeof timestamp === 'number') {
                // Для таймера сессии
                const hours = Math.floor(timestamp / 3600);
                const minutes = Math.floor((timestamp % 3600) / 60);
                const seconds = timestamp % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                // Для времени сообщений
                const date = new Date(timestamp);
                return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            }
        },

        showMessage(text, success) {
            this.message.text = text;
            this.message.success = success;

            setTimeout(() => {
                this.message.text = '';
            }, 3000);
        }
    },

    mounted() {
        // Автоскролл чата к последнему сообщению
        this.$nextTick(() => {
            const chatMessages = this.$refs.chatMessages;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // Закрывать меню пользователя при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.showUserMenu = false;
            }
        });

        // Запускаем таймер сессии
        this.startTimer();
    },

    beforeUnmount() {
        this.pauseTimer();
    }
}).mount('#app');
