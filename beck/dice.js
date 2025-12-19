// Объект для хранения разрешенных кубиков
const allowedDice = {
    d4: false,
    d6: false,
    d8: false,
    d10: false,
    d12: false,
    d20: false,
    d100: false
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updatePlayerButtons();
    addToResults('Система кубиков готова к использованию', 'master');

    // Добавляем обработчик для иконки кубика
    document.getElementById('diceIconBtn').addEventListener('click', toggleDiceMenu);

    // Закрываем меню при клике вне его
    document.addEventListener('click', function(event) {
        const diceMenu = document.getElementById('diceMenu');
        const diceIconBtn = document.getElementById('diceIconBtn');

        if (diceMenu.style.display === 'block' &&
            !diceMenu.contains(event.target) &&
            !diceIconBtn.contains(event.target)) {
            closeDiceMenu();
        }
    });
});

// Функция для показа/скрытия меню кубиков
function toggleDiceMenu() {
    const diceMenu = document.getElementById('diceMenu');
    const anyAllowed = Object.values(allowedDice).some(value => value);

    if (!anyAllowed) {
        addToResults('❌ Нет разрешенных кубиков для броска!', 'error');
        return;
    }

    // Обновляем состояние кнопок в меню
    updateDiceMenuButtons();

    diceMenu.style.display = diceMenu.style.display === 'block' ? 'none' : 'block';
}

// Функция для обновления состояния кнопок в меню
function updateDiceMenuButtons() {
    const menuButtons = document.querySelectorAll('.dice-menu-btn');

    menuButtons.forEach(button => {
        const diceType = button.textContent.toLowerCase();
        if (allowedDice[diceType]) {
            button.disabled = false;
            button.style.opacity = '1';
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
        }
    });
}

// Функция для закрытия меню кубиков
function closeDiceMenu() {
    document.getElementById('diceMenu').style.display = 'none';
}

// Функция для инициализации броска с анимацией
function initiateRoll(diceType) {
    if (!allowedDice[diceType]) {
        addToResults(`❌ Бросок ${diceType.toUpperCase()} не разрешен мастером!`, 'error');
        closeDiceMenu();
        return;
    }

    closeDiceMenu();
    showAnimation(diceType);
}

// Функция для показа анимации
function showAnimation(diceType) {
    const overlay = document.getElementById('animationOverlay');
    const diceElement = document.getElementById('rollingDice');
    const textElement = document.getElementById('rollingText');

    // Устанавливаем текст
    textElement.textContent = `Бросок ${diceType.toUpperCase()}...`;

    // Показываем оверлей
    overlay.style.display = 'flex';

    // Запускаем анимацию на 2 секунды, затем показываем результат
    setTimeout(() => {
        const result = performDiceRoll(diceType);

        // Обновляем текст и добавляем финальную анимацию
        textElement.textContent = `Результат: ${result}!`;
        diceElement.style.animation = 'none';
        void diceElement.offsetWidth; // Перезапуск анимации
        diceElement.style.animation = 'bounce 0.5s ease-in-out 3';

        // Скрываем оверлей через 1.5 секунды
        setTimeout(() => {
            overlay.style.display = 'none';
            // Сбрасываем анимацию
            diceElement.style.animation = 'roll 1s ease-in-out infinite';
        }, 1500);

    }, 2000);
}

// Функция для определения типа результата
function getResultType(result, maxValue) {
    if (result === 1) {
        return { type: 'critical_failure', text: '💀 Критическая неудача' };
    } else if (result === maxValue) {
        return { type: 'critical_success', text: '🔥 Критическая удача' };
    } else if (result < maxValue / 2) {
        return { type: 'failure', text: '❌ Неудача' };
    } else {
        return { type: 'success', text: '✅ Удача' };
    }
}

// Функция для получения цвета в зависимости от типа результата
function getResultColor(resultType) {
    switch (resultType) {
        case 'critical_success':
            return '#4CAF50'; // Зеленый
        case 'success':
            return '#8BC34A'; // Светло-зеленый
        case 'failure':
            return '#FF9800'; // Оранжевый
        case 'critical_failure':
            return '#f44336'; // Красный
        default:
            return '#2196F3'; // Синий
    }
}

// Функция для выполнения броска кубика (возвращает результат)
function performDiceRoll(diceType) {
    // Получаем максимальное значение кубика из его названия
    const maxValue = parseInt(diceType.substring(1));

    // Генерируем случайное число
    const result = Math.floor(Math.random() * maxValue) + 1;

    // Определяем тип результата
    const resultInfo = getResultType(result, maxValue);

    // Добавляем результат в историю с соответствующим оформлением
    addToResults(
        `🎲 Бросок ${diceType.toUpperCase()}: <strong>${result}</strong><br>
        <span style="color: ${getResultColor(resultInfo.type)}; font-weight: bold;">
            ${resultInfo.text}
        </span>`,
        'player'
    );

    return result;
}

// Функция для разрешения броска конкретного кубика
function allowDice(diceType) {
    allowedDice[diceType] = true;
    updatePlayerButtons();
    addToResults(`🎮 Мастер разрешил бросок ${diceType.toUpperCase()}`, 'master');
}

// Функция для разрешения всех кубиков
function allowAllDice() {
    Object.keys(allowedDice).forEach(dice => {
        allowedDice[dice] = true;
    });
    updatePlayerButtons();
    addToResults('🎮 Мастер разрешил броски всех кубиков', 'master');
}

// Функция для запрета всех кубиков
function disallowAllDice() {
    Object.keys(allowedDice).forEach(dice => {
        allowedDice[dice] = false;
    });
    updatePlayerButtons();
    addToResults('🎮 Мастер запретил все броски кубиков', 'master');
}

// Функция для обновления состояния кнопок игрока
function updatePlayerButtons() {
    const statusElement = document.getElementById('status');

    let anyAllowed = Object.values(allowedDice).some(value => value);

    if (anyAllowed) {
        statusElement.textContent = '✅ Броски кубиков разрешены мастером';
        statusElement.className = 'status status-allowed';
    } else {
        statusElement.textContent = '❌ Ожидание разрешения мастера...';
        statusElement.className = 'status status-disabled';
    }
}

// Функция для добавления результата в историю
function addToResults(message, type) {
    const resultsContainer = document.getElementById('results-container');
    const resultElement = document.createElement('div');
    resultElement.className = 'result-item';

    // Добавляем цветовое кодирование в зависимости от типа сообщения
    if (type === 'master') {
        resultElement.style.borderLeftColor = '#2196F3';
    } else if (type === 'player') {
        resultElement.style.borderLeftColor = '#4CAF50';
    } else if (type === 'error') {
        resultElement.style.borderLeftColor = '#f44336';
    }

    resultElement.innerHTML = message;
    resultsContainer.appendChild(resultElement);

    // Прокручиваем к последнему результату
    resultsContainer.scrollTop = resultsContainer.scrollHeight;
}
