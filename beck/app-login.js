const { createApp } = Vue;

createApp({
    data() {
        return {
            form: {
                email: '',
                password: '',
                remember: false
            },
            errors: {
                email: '',
                password: ''
            },
            loading: false,
            message: {
                text: '',
                success: false
            }
        };
    },
    methods: {
        validateEmail() {
            if (!this.form.email.trim()) {
                this.errors.email = 'Магический адрес обязателен для заполнения';
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.form.email)) {
                this.errors.email = 'Введите корректный магический адрес';
                return false;
            }

            this.errors.email = '';
            return true;
        },

        validatePassword() {
            if (!this.form.password.trim()) {
                this.errors.password = 'Защитная руна обязательна для входа';
                return false;
            }

            if (this.form.password.length < 6) {
                this.errors.password = 'Руна должна содержать минимум 6 символов';
                return false;
            }

            this.errors.password = '';
            return true;
        },

        validateForm() {
            const isEmailValid = this.validateEmail();
            const isPasswordValid = this.validatePassword();

            return isEmailValid && isPasswordValid;
        },

        async submitForm() {
            if (!this.validateForm()) {
                this.showMessage('Пожалуйста, исправьте ошибки в форме', false);
                return;
            }

            this.loading = true;
            this.message.text = '';

            try {
                // Имитация аутентификации
                const response = await this.authenticateUser();

                if (response.success) {
                    this.showMessage('Врата мудрости открыты! Добро пожаловать в архивы.', true);
                    this.redirectToDashboard();
                } else {
                    this.showMessage(response.message || 'Неверные данные для входа', false);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                this.showMessage('Произошла ошибка при входе в систему', false);
            } finally {
                this.loading = false;
            }
        },

        async authenticateUser() {
            // Имитация запроса к серверу для аутентификации
            return new Promise((resolve) => {
                setTimeout(() => {
                    // В реальном приложении здесь будет:
                    // 1. Проверка в Cassandra
                    // 2. Создание сессии
                    // 3. Возврат JWT токена

                    // Пример успешной аутентификации
                    if (this.form.email === 'mage@elandria.com' && this.form.password === 'ancient123') {
                        resolve({
                            success: true,
                            message: 'Аутентификация успешна',
                            token: 'fantasy_jwt_token_here'
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Неверный магический адрес или защитная руна'
                        });
                    }
                }, 2000);
            });
        },

        redirectToDashboard() {
            // Перенаправление на страницу архива после успешного входа
            setTimeout(() => {
                // window.location.href = 'dashboard.html';
                this.showMessage('Перенаправление в архив...', true);
            }, 2000);
        },

        showMessage(text, success) {
            this.message.text = text;
            this.message.success = success;

            // Автоматически скрывать сообщение через 5 секунд
            setTimeout(() => {
                this.message.text = '';
            }, 5000);
        }
    }
}).mount('#app');
