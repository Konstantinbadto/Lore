class VoiceChat {
    constructor() {
        this.localStream = null;
        this.remoteStreams = new Map();
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        this.participants = new Map();
        this.isCallActive = false;
        this.isMuted = false;
        this.isSharingScreen = false;
        this.localParticipantId = this.generateId();

        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.initializeElements();
        this.setupEventListeners();
        this.addLocalParticipant();
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    initializeElements() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideosContainer = document.getElementById('remoteVideosContainer');
        this.startCallBtn = document.getElementById('startCall');
        this.endCallBtn = document.getElementById('endCall');
        this.muteBtn = document.getElementById('muteBtn');
        this.shareScreenBtn = document.getElementById('shareScreen');
        this.status = document.getElementById('status');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessage');
        this.messages = document.getElementById('messages');
        this.participantsList = document.getElementById('participantsList');
        this.participantsCount = document.getElementById('participantsCount');
        this.clearChatBtn = document.getElementById('clearChat');
    }

    setupEventListeners() {
        this.startCallBtn.addEventListener('click', () => this.startCall());
        this.endCallBtn.addEventListener('click', () => this.endCall());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    addLocalParticipant() {
        this.participants.set(this.localParticipantId, {
            id: this.localParticipantId,
            name: 'Вы',
            isLocal: true,
            isAudioMuted: false,
            isSpeaking: false
        });
        this.updateParticipantsList();
    }

    async startCall() {
        try {
            this.updateStatus('Получение медиапотока...');

            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.localVideo.srcObject = this.localStream;
            this.updateStatus('Чат активен - имитация многопользовательского режима');

            // Имитируем подключение удаленных участников
            this.simulateRemoteParticipants();

            this.isCallActive = true;
            this.updateUI();
            this.addSystemMessage('Чат начат. Подключены участники.');

        } catch (error) {
            console.error('Ошибка при начале звонка:', error);
            this.updateStatus('Ошибка: ' + error.message);
        }
    }

    simulateRemoteParticipants() {
        // Имитируем 3 удаленных участника для демонстрации
        const remoteParticipants = [
            { id: 'remote1', name: 'Алексей' },
            { id: 'remote2', name: 'Мария' },
            { id: 'remote3', name: 'Дмитрий' }
        ];

        remoteParticipants.forEach((participant, index) => {
            setTimeout(() => {
                this.addRemoteParticipant(participant.id, participant.name);
                this.addSystemMessage(`${participant.name} присоединился к чату`);
            }, 1000 * (index + 1));
        });
    }

    addRemoteParticipant(participantId, name) {
        this.participants.set(participantId, {
            id: participantId,
            name: name,
            isLocal: false,
            isAudioMuted: Math.random() > 0.5, // Случайно mute/unmute
            isSpeaking: false
        });

        // Создаем элемент видео для удаленного участника
        const videoElement = document.createElement('video');
        videoElement.id = `remoteVideo-${participantId}`;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'remote-video-item';
        videoWrapper.innerHTML = `
            <div class="video-info">
                <span class="status-indicator remote">●</span>
                ${name}
            </div>
        `;
        videoWrapper.appendChild(videoElement);

        this.remoteVideosContainer.appendChild(videoWrapper);

        // Имитируем видео поток (в реальном приложении здесь был бы реальный WebRTC поток)
        this.simulateRemoteVideo(participantId, videoElement);

        // Имитируем активность речи
        this.simulateSpeakingActivity(participantId);

        this.updateParticipantsList();
    }

    simulateRemoteVideo(participantId, videoElement) {
        // Создаем цветной canvas как placeholder для видео
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Добавляем текст с именем
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.participants.get(participantId).name, canvas.width/2, canvas.height/2);

        // Конвертируем в video stream
        const stream = canvas.captureStream(15);
        videoElement.srcObject = stream;
    }

    simulateSpeakingActivity(participantId) {
        setInterval(() => {
            const participant = this.participants.get(participantId);
            if (participant && !participant.isAudioMuted) {
                const shouldSpeak = Math.random() > 0.7;
                participant.isSpeaking = shouldSpeak;

                // Имитируем случайные сообщения в чат
                if (shouldSpeak && Math.random() > 0.8) {
                    const messages = [
                        'Привет всем!',
                        'Как слышно?',
                        'Отлично работает!',
                        'Кто недавно присоединился?',
                        'Поделитесь своим мнением',
                        'Интересная дискуссия!'
                    ];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

                    setTimeout(() => {
                        this.addMessage(participant.name, randomMessage, 'remote', participantId);
                    }, 1000);
                }

                this.updateParticipantsList();

                // Сбрасываем состояние speaking через случайное время
                setTimeout(() => {
                    if (this.participants.has(participantId)) {
                        this.participants.get(participantId).isSpeaking = false;
                        this.updateParticipantsList();
                    }
                }, 2000 + Math.random() * 3000);
            }
        }, 5000);
    }

    updateParticipantsList() {
        this.participantsCount.textContent = this.participants.size;

        this.participantsList.innerHTML = '';

        this.participants.forEach(participant => {
            const participantElement = document.createElement('div');
            participantElement.className = `participant ${participant.isLocal ? 'you' : ''}`;

            let statusIndicator = '●';
            let statusClass = '';

            if (participant.isLocal) {
                statusClass = this.isMuted ? 'muted' : '';
            } else {
                statusClass = participant.isAudioMuted ? 'muted' :
                             participant.isSpeaking ? 'speaking' : '';
            }

            participantElement.innerHTML = `
                <span class="status-indicator ${statusClass}">●</span>
                <span class="participant-name">${participant.name}</span>
                ${participant.isLocal ? '<span style="margin-left: auto; font-size: 12px; opacity: 0.7;">(Вы)</span>' : ''}
            `;

            this.participantsList.appendChild(participantElement);
        });

        if (this.participants.size === 0) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'participant empty';
            emptyElement.textContent = 'Нет участников';
            this.participantsList.appendChild(emptyElement);
        }
    }

    addMessage(sender, text, type, participantId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="sender">${sender}</div>
            ${text}
            <span class="timestamp">${timestamp}</span>
        `;

        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;

        // Добавляем визуальную индикацию для говорящего участника
        if (type === 'remote' && participantId) {
            const participant = this.participants.get(participantId);
            if (participant) {
                participant.isSpeaking = true;
                this.updateParticipantsList();

                setTimeout(() => {
                    if (this.participants.has(participantId)) {
                        this.participants.get(participantId).isSpeaking = false;
                        this.updateParticipantsList();
                    }
                }, 2000);
            }
        }
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = text;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.addMessage('Вы', message, 'own');
            this.messageInput.value = '';

            // Имитируем ответы от других участников
            this.simulateResponses(message);
        }
    }

    simulateResponses(message) {
        const remoteParticipants = Array.from(this.participants.values())
            .filter(p => !p.isLocal && !p.isAudioMuted);

        if (remoteParticipants.length > 0 && Math.random() > 0.5) {
            const randomParticipant = remoteParticipants[Math.floor(Math.random() * remoteParticipants.length)];
            const responses = [
                'Понятно, спасибо!',
                'Интересная мысль',
                'Согласен с тобой',
                'Можно подробнее?',
                'Хорошо звучит!',
                'Давайте обсудим это'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setTimeout(() => {
                this.addMessage(randomParticipant.name, randomResponse, 'remote', randomParticipant.id);
            }, 1000 + Math.random() * 2000);
        }
    }

    clearChat() {
        this.messages.innerHTML = '';
        this.addSystemMessage('Чат очищен');
    }

    toggleMute() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });

            this.isMuted = !track.enabled;
            this.muteBtn.textContent = this.isMuted ? '🔊 Включить микрофон' : '🔇 Выключить микрофон';

            const localParticipant = this.participants.get(this.localParticipantId);
            if (localParticipant) {
                localParticipant.isAudioMuted = this.isMuted;
                this.updateParticipantsList();
            }

            this.addSystemMessage(`Вы ${this.isMuted ? 'выключили' : 'включили'} микрофон`);
        }
    }

    async toggleScreenShare() {
        try {
            if (!this.isSharingScreen) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                // Здесь бы заменяли видеотрек в peer connection
                this.isSharingScreen = true;
                this.shareScreenBtn.textContent = '🛑 Прекратить демонстрацию';
                this.addSystemMessage('Вы начали демонстрацию экрана');

                // Обработка прекращения демонстрации
                screenStream.getTracks().forEach(track => {
                    track.onended = () => {
                        this.stopScreenShare();
                    };
                });
            } else {
                this.stopScreenShare();
            }
        } catch (error) {
            console.error('Ошибка демонстрации экрана:', error);
        }
    }

    stopScreenShare() {
        this.isSharingScreen = false;
        this.shareScreenBtn.textContent = '📺 Поделиться экраном';
        this.addSystemMessage('Вы прекратили демонстрацию экрана');
    }

    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        this.localVideo.srcObject = null;
        this.remoteVideosContainer.innerHTML = '';

        // Удаляем всех участников кроме локального
        this.participants.forEach((participant, id) => {
            if (!participant.isLocal) {
                this.participants.delete(id);
            }
        });

        this.isCallActive = false;
        this.updateUI();
        this.updateStatus('Звонок завершен');
        this.addSystemMessage('Чат завершен');
    }

    updateStatus(message) {
        this.status.textContent = `Статус: ${message}`;
    }

    updateUI() {
        this.startCallBtn.disabled = this.isCallActive;
        this.endCallBtn.disabled = !this.isCallActive;
        this.muteBtn.disabled = !this.isCallActive;
        this.shareScreenBtn.disabled = !this.isCallActive;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new VoiceChat();
});
