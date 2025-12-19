const { createApp } = Vue;

createApp({
    data() {
        return {
            currentStep: 1,
            character: {
                name: '',
                race: '',
                class: '',
                background: '',
                abilities: {
                    strength: 8,
                    dexterity: 8,
                    constitution: 8,
                    intelligence: 8,
                    wisdom: 8,
                    charisma: 8
                },
                skills: []
            },
            message: {
                text: '',
                success: false
            },
            // Данные для выбора
            races: [
                { value: 'human', name: 'Человек', description: 'Адаптивные и амбициозные, люди быстро осваиваются в любых условиях.', abilityBonuses: [{ ability: 'strength', bonus: 1 }, { ability: 'dexterity', bonus: 1 }, { ability: 'constitution', bonus: 1 }, { ability: 'intelligence', bonus: 1 }, { ability: 'wisdom', bonus: 1 }, { ability: 'charisma', bonus: 1 }] },
                { value: 'elf', name: 'Эльф', description: 'Грациозные и долгоживущие, эльфы обладают острой интуицией и связью с природой.', abilityBonuses: [{ ability: 'dexterity', bonus: 2 }] },
                { value: 'dwarf', name: 'Дварф', description: 'Выносливые и упрямые, дварфы известны своим мастерством в ремеслах и боевыми навыками.', abilityBonuses: [{ ability: 'constitution', bonus: 2 }] },
                { value: 'halfling', name: 'Халфлинг', description: 'Ловкие и удачливые, халфлинги умеют оставаться незамеченными и выходить сухими из воды.', abilityBonuses: [{ ability: 'dexterity', bonus: 2 }] },
                { value: 'gnome', name: 'Гном', description: 'Любознательные и изобретательные, гномы обладают живым умом и чувством юмора.', abilityBonuses: [{ ability: 'intelligence', bonus: 2 }] },
                { value: 'half-elf', name: 'Полуэльф', description: 'Сочетающие в себе черты людей и эльфов, полуэльфы харизматичны и адаптивны.', abilityBonuses: [{ ability: 'charisma', bonus: 2 }, { ability: 'any', bonus: 1 }, { ability: 'any', bonus: 1 }] },
                { value: 'half-orc', name: 'Полуорк', description: 'Сильные и выносливые, полуорки обладают свирепостью в бою.', abilityBonuses: [{ ability: 'strength', bonus: 2 }, { ability: 'constitution', bonus: 1 }] },
                { value: 'tiefling', name: 'Тифлинг', name: 'Тифлинг', description: 'Потомки демонов, тифлинги харизматичны и обладают врожденной магией.', abilityBonuses: [{ ability: 'intelligence', bonus: 1 }, { ability: 'charisma', bonus: 2 }] }
            ],
            classes: [
                { value: 'barbarian', name: 'Варвар' },
                { value: 'bard', name: 'Бард' },
                { value: 'cleric', name: 'Жрец' },
                { value: 'druid', name: 'Друид' },
                { value: 'fighter', name: 'Воин' },
                { value: 'monk', name: 'Монах' },
                { value: 'paladin', name: 'Паладин' },
                { value: 'ranger', name: 'Следопыт' },
                { value: 'rogue', name: 'Плут' },
                { value: 'sorcerer', name: 'Чародей' },
                { value: 'warlock', name: 'Колдун' },
                { value: 'wizard', name: 'Волшебник' }
            ],
            backgrounds: [
                { value: 'acolyte', name: 'Служитель культа' },
                { value: 'criminal', name: 'Преступник' },
                { value: 'folk-hero', name: 'Народный герой' },
                { value: 'noble', name: 'Благородный' },
                { value: 'sage', name: 'Мудрец' },
                { value: 'soldier', name: 'Солдат' }
            ],
            abilities: [
                { value: 'strength', name: 'Сила', abbr: 'СИЛ' },
                { value: 'dexterity', name: 'Ловкость', abbr: 'ЛОВ' },
                { value: 'constitution', name: 'Телосложение', abbr: 'ТЕЛ' },
                { value: 'intelligence', name: 'Интеллект', abbr: 'ИНТ' },
                { value: 'wisdom', name: 'Мудрость', abbr: 'МДР' },
                { value: 'charisma', name: 'Харизма', abbr: 'ХАР' }
            ],
            skills: [
                { value: 'acrobatics', name: 'Акробатика', ability: 'dexterity' },
                { value: 'animal-handling', name: 'Уход за животными', ability: 'wisdom' },
                { value: 'arcana', name: 'Магия', ability: 'intelligence' },
                { value: 'athletics', name: 'Атлетика', ability: 'strength' },
                { value: 'deception', name: 'Обман', ability: 'charisma' },
                { value: 'history', name: 'История', ability: 'intelligence' },
                { value: 'insight', name: 'Проницательность', ability: 'wisdom' },
                { value: 'intimidation', name: 'Запугивание', ability: 'charisma' },
                { value: 'investigation', name: 'Расследование', ability: 'intelligence' },
                { value: 'medicine', name: 'Медицина', ability: 'wisdom' },
                { value: 'nature', name: 'Природа', ability: 'intelligence' },
                { value: 'perception', name: 'Восприятие', ability: 'wisdom' },
                { value: 'performance', name: 'Выступление', ability: 'charisma' },
                { value: 'persuasion', name: 'Убеждение', ability: 'charisma' },
                { value: 'religion', name: 'Религия', ability: 'intelligence' },
                { value: 'sleight-of-hand', name: 'Ловкость рук', ability: 'dexterity' },
                { value: 'stealth', name: 'Скрытность', ability: 'dexterity' },
                { value: 'survival', name: 'Выживание', ability: 'wisdom' }
            ],
            pointCosts: {
                8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
            },
            totalPoints: 27
        };
    },
    computed: {
        pointsLeft() {
            let usedPoints = 0;
            for (const ability in this.character.abilities) {
                usedPoints += this.pointCosts[this.character.abilities[ability]];
            }
            return this.totalPoints - usedPoints;
        },
        selectedRaceInfo() {
            return this.races.find(race => race.value === this.character.race);
        },
        maxSkills() {
            // Базовое количество навыков + бонус за интеллект
            const baseSkills = this.character.class === 'rogue' || this.character.class === 'bard' ? 4 : 2;
            const intBonus = Math.max(this.getModifier(this.character.abilities.intelligence), 0);
            return baseSkills + intBonus;
        },
        canSelectMoreSkills() {
            return this.character.skills.length < this.maxSkills;
        }
    },
    methods: {
        nextStep() {
            if (this.validateCurrentStep()) {
                this.currentStep++;
            }
        },

        previousStep() {
            this.currentStep--;
        },

        validateCurrentStep() {
            switch (this.currentStep) {
                case 1:
                    if (!this.character.name.trim()) {
                        this.showMessage('Введите имя персонажа', false);
                        return false;
                    }
                    if (!this.character.race) {
                        this.showMessage('Выберите расу персонажа', false);
                        return false;
                    }
                    if (!this.character.class) {
                        this.showMessage('Выберите класс персонажа', false);
                        return false;
                    }
                    break;
                case 2:
                    if (this.pointsLeft !== 0) {
                        this.showMessage(`Используйте все очки характеристик! Осталось: ${this.pointsLeft}`, false);
                        return false;
                    }
                    break;
                case 3:
                    if (this.character.skills.length === 0) {
                        this.showMessage('Выберите хотя бы один навык', false);
                        return false;
                    }
                    break;
            }
            return true;
        },

        increaseAbility(ability) {
            if (this.character.abilities[ability] < 15 && this.pointsLeft > 0) {
                this.character.abilities[ability]++;
            }
        },

        decreaseAbility(ability) {
            if (this.character.abilities[ability] > 8) {
                this.character.abilities[ability]--;
            }
        },

        getPointCost(score) {
            return this.pointCosts[score] || 0;
        },

        getModifier(score) {
            return Math.floor((score - 10) / 2);
        },

        formatModifier(modifier) {
            return modifier >= 0 ? `+${modifier}` : `${modifier}`;
        },

        getFinalAbilityScore(ability) {
            let score = this.character.abilities[ability];

            // Применяем расовые бонусы
            if (this.selectedRaceInfo) {
                this.selectedRaceInfo.abilityBonuses.forEach(bonus => {
                    if (bonus.ability === ability || bonus.ability === 'any') {
                        score += bonus.bonus;
                    }
                });
            }

            return score;
        },

        getFinalModifier(ability) {
            return this.getModifier(this.getFinalAbilityScore(ability));
        },

        getRaceName(raceValue) {
            const race = this.races.find(r => r.value === raceValue);
            return race ? race.name : '';
        },

        getClassName(classValue) {
            const classObj = this.classes.find(c => c.value === classValue);
            return classObj ? classObj.name : '';
        },

        getBackgroundName(bgValue) {
            const bg = this.backgrounds.find(b => b.value === bgValue);
            return bg ? bg.name : '';
        },

        getAbilityName(abilityValue) {
            const ability = this.abilities.find(a => a.value === abilityValue);
            return ability ? ability.name : '';
        },

        getAbilityAbbr(abilityValue) {
            const ability = this.abilities.find(a => a.value === abilityValue);
            return ability ? ability.abbr : '';
        },

        getSkillName(skillValue) {
            const skill = this.skills.find(s => s.value === skillValue);
            return skill ? skill.name : '';
        },

        createCharacter() {
            // Проверяем финальную валидацию
            if (!this.validateCurrentStep()) {
                return;
            }

            // Создаем объект персонажа для отправки
            const finalCharacter = {
                ...this.character,
                finalAbilities: {},
                modifiers: {}
            };

            // Рассчитываем финальные характеристики с бонусами
            this.abilities.forEach(ability => {
                finalCharacter.finalAbilities[ability.value] = this.getFinalAbilityScore(ability.value);
                finalCharacter.modifiers[ability.value] = this.getFinalModifier(ability.value);
            });

            // Имитация сохранения персонажа
            setTimeout(() => {
                this.showMessage(`Персонаж "${this.character.name}" успешно создан!`, true);

                // В реальном приложении здесь будет редирект
                // window.location.href = 'game-lobby.html';
            }, 1000);
        },

        showMessage(text, success) {
            this.message.text = text;
            this.message.success = success;

            setTimeout(() => {
                this.message.text = '';
            }, 4000);
        }
    }
}).mount('#app');
