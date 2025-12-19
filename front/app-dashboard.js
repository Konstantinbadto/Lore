const { createApp } = Vue;

createApp({
    data() {
        return {
            userName: 'Арагорн',
            showUserMenu: false,
            selectedRole: null,
            message: {
                text: '',
                success: false
            }
        };
    },
    computed: {
        selectedRoleText() {
            if (this.selectedRole === 'player') {
                return 'Путь Воина';
            } else if (this.selectedRole === 'master') {
                return 'Путь Мастера';
            }
            return '';
        }
    },
    methods: {
        toggleUserMenu() {
            this.showUserMenu = !this.showUserMenu;
        },

        selectRole(role) {
            this.selectedRole = role;
            this.showMessage(`Выбран путь: ${this.selectedRoleText}`, true);
        },

        confirmRole() {
            if (!this.selectedRole) {
                this.showMessage('Сначала выбери свою судьбу, путник!', false);
                return;
            }

            // Имитация сохранения выбора
            setTimeout(() => {
                this.showMessage(
                    `Ты встал на ${this.selectedRoleText}! Да начнётся твоё приключение!`,
                    true
                );

                // В реальном приложении здесь будет редирект
                // if (this.selectedRole === 'player') {
                //     window.location.href = 'player-dashboard.html';
                // } else {
                //     window.location.href = 'master-dashboard.html';
                // }
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
        // Закрывать меню пользователя при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.showUserMenu = false;
            }
        });
    }
}).mount('#app');
