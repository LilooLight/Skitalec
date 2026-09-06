// --- ДАННЫЕ СИСТЕМЫ ---
const qualitiesData = ["Сила", "Проворство", "Точность", "Выносливость", "Харизма", "Хитрость", "Восприятие", "Ум", "Чутье"];
const skillsData = ["Атлетика", "Бдительность", "Выживание", "Красноречие", "Ловкость рук", "Ремесло", "Скрытность", "Стрельба", "Фехтование", "Анализ", "Животные"];
const bodyParts = ["Всего", "Торс", "Голова", "Л. Рука", "П. Рука", "Л. Нога", "П. Нога"];

// --- УПРАВЛЕНИЕ ПЕРСОНАЖАМИ ---
let characters = JSON.parse(localStorage.getItem('skitalets_chars')) || [];
let currentCharId = localStorage.getItem('skitalets_current') || null;

function saveAll() {
    localStorage.setItem('skitalets_chars', JSON.stringify(characters));
    localStorage.setItem('skitalets_current', currentCharId);
}

function addCharacter() {
    const newChar = {
        id: Date.now(),
        name: "Новый Скиталец",
        qualities: {},
        skills: {},
        virtues: { conscience: 2, coldBlood: 2, selfControl: 2, courage: 2 },
        wounds: {},
        stress: 0
    };
    qualitiesData.forEach(q => newChar.qualities[q] = 0);
    skillsData.forEach(s => newChar.skills[s] = 0);
    bodyParts.forEach(b => newChar.wounds[b] = { light: 0, heavy: 0 });

    characters.push(newChar);
    currentCharId = newChar.id;
    saveAll();
    renderSidebar();
    renderSheet();
}

function deleteCharacter(id) {
    characters = characters.filter(c => c.id !== id);
    
    // Исправление: если удалили текущего персонажа, переключаемся на первого оставшегося
    if(currentCharId === id) {
        currentCharId = characters.length > 0 ? characters[0].id : null;
    }
    
    saveAll();
    renderSidebar();
    renderSheet();
}

function selectCharacter(id) {
    currentCharId = id;
    saveAll();
    renderSidebar();
    renderSheet();
}

// --- РЕНДЕР СПИСКА ПЕРСОНАЖЕЙ ---
function renderSidebar() {
    const list = document.getElementById('characters-list');
    list.innerHTML = '';
    
    characters.forEach(char => {
        const div = document.createElement('div');
        div.innerHTML = `<button class="${char.id === currentCharId ? 'active' : ''}" onclick="selectCharacter(${char.id})">
            ${char.name} <span style="color:#a83a3a; font-size:0.8em; float:right;" onclick="event.stopPropagation(); deleteCharacter(${char.id})">Удалить</span>
        </button>`;
        list.appendChild(div);
    });
}

// --- РЕНДЕР ЛИСТА ---
function getCurrentChar() {
    return characters.find(c => c.id === currentCharId);
}

function renderSheet() {
    const char = getCurrentChar();
    
    // Если персонаж не найден, показываем заглушку
    if (!char) {
        document.getElementById('sheet').innerHTML = '<p style="text-align:center; padding: 50px;">Создайте нового персонажа слева.</p>';
        return;
    }

    // Рендерим Качества
    const qContainer = document.getElementById('qualities-list');
    qContainer.innerHTML = '';
    qualitiesData.forEach(q => {
        qContainer.innerHTML += `
            <div class="item-row">
                <label>${q}</label>
                <input type="number" min="-2" max="10" value="${char.qualities[q]}" onchange="updateCharData('qualities', '${q}', this.value)">
            </div>`;
    });

    // Рендерим Навыки
    const sContainer = document.getElementById('skills-list');
    sContainer.innerHTML = '';
    skillsData.forEach(s => {
        sContainer.innerHTML += `
            <div class="item-row">
                <label>${s}</label>
                <input type="number" min="0" max="5" value="${char.skills[s]}" onchange="updateCharData('skills', '${s}', this.value)">
            </div>`;
    });

    // Добродетели
    document.getElementById('virtue-conscience').value = char.virtues.conscience;
    document.getElementById('virtue-cold-blood').value = char.virtues.coldBlood;
    document.getElementById('virtue-self-control').value = char.virtues.selfControl;
    document.getElementById('virtue-courage').value = char.virtues.courage;
    
    // Стресс
    document.getElementById('stress').value = char.stress;
    document.getElementById('stress-val').innerText = char.stress;

    // Таблица ран
    const tbody = document.getElementById('wounds-body');
    tbody.innerHTML = '';
    bodyParts.forEach(part => {
        const wounds = char.wounds[part];
        tbody.innerHTML += `
            <tr>
                <td>${part}</td>
                <td><input type="text" value="0 / 0" style="width: 50px;"></td>
                <td><input type="number" class="wound-light" value="${wounds.light}" style="width: 40px;" onchange="updateWounds('${part}', 'light', this.value)"></td>
                <td><input type="number" class="wound-heavy" value="${wounds.heavy}" style="width: 40px;" onchange="updateWounds('${part}', 'heavy', this.value)"></td>
                <td class="sum-cell">${wounds.light + wounds.heavy}</td>
            </tr>`;
    });

    calculateVirtues();
}

// --- ОБНОВЛЕНИЕ ДАННЫХ ПЕРСОНАЖА ---
function updateCharData(type, key, value) {
    const char = getCurrentChar();
    if (char) {
        char[type][key] = parseInt(value) || 0;
        saveAll();
        renderSheet(); // Перерисовка для обновления расчетов
    }
}

function updateWounds(part, type, value) {
    const char = getCurrentChar();
    if (char) {
        char.wounds[part][type] = parseInt(value) || 0;
        saveAll();
        renderSheet(); 
    }
}

function calculateVirtues() {
    const char = getCurrentChar();
    if (!char) return;

    char.virtues.conscience = parseInt(document.getElementById('virtue-conscience').value) || 0;
    char.virtues.coldBlood = parseInt(document.getElementById('virtue-cold-blood').value) || 0;
    char.virtues.selfControl = parseInt(document.getElementById('virtue-self-control').value) || 0;
    char.virtues.courage = parseInt(document.getElementById('virtue-courage').value) || 0;

    const righteousness = (char.virtues.conscience + char.virtues.selfControl) + 2;
    const stressResist = (char.virtues.coldBlood + char.virtues.courage) + 2;

    document.getElementById('righteousness').innerText = righteousness;
    document.getElementById('stress-resist').innerText = stressResist;

    saveAll();
}

// --- ЭКСПОРТ / ИМПОРТ JSON ---
function exportCharacter() {
    const char = getCurrentChar();
    if (!char) return alert("Сначала создайте персонажа!");
    
    const dataStr = JSON.stringify(char, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${char.name}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function importCharacter(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedChar = JSON.parse(e.target.result);
            if (!importedChar.id || !importedChar.qualities) {
                throw new Error("Неверный формат файла");
            }
            importedChar.id = Date.now(); 
            characters.push(importedChar);
            currentCharId = importedChar.id;
            saveAll();
            renderSidebar();
            renderSheet();
            alert("Персонаж загружен!");
        } catch (err) {
            alert("Ошибка загрузки: " + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Сброс input
}

// --- БРОСОК КУБИКОВ ---
function populateDiceSelects() {
    const qSel = document.getElementById('dice-quality');
    const sSel = document.getElementById('dice-skill');
    
    qSel.innerHTML = '<option value="0">— Не выбрано —</option>';
    sSel.innerHTML = '<option value="0">— Не выбрано —</option>';

    qualitiesData.forEach(q => {
        qSel.innerHTML += `<option value="${q}">${q}</option>`;
    });
    
    skillsData.forEach(s => {
        sSel.innerHTML += `<option value="${s}">${s}</option>`;
    });
}

function rollDice() {
    const char = getCurrentChar();
    if (!char) return alert("Создайте персонажа!");

    const qKey = document.getElementById('dice-quality').value;
    const sKey = document.getElementById('dice-skill').value;
    const extraDice = parseInt(document.getElementById('dice-extra').value) || 0;
    const difficulty = parseInt(document.getElementById('dice-diff').value) || 6;

    let poolSize = extraDice;

    if (qKey !== "0") poolSize += char.qualities[qKey];
    if (sKey !== "0") poolSize += char.skills[sKey];

    if (poolSize <= 0) {
        document.getElementById('dice-results').innerHTML = '<p style="color:red;">Выберите качество/навык или добавьте кубы вручную.</p>';
        return;
    }

    let results = [];
    let successes = 0;
    let tensCount = 0;
    let onesCount = 0;

    for (let i = 0; i < poolSize; i++) {
        let roll = Math.floor(Math.random() * 10) + 1;
        results.push(roll);
        
        if (roll === 10) {
            successes += 2;
            tensCount++;
        } else if (roll >= difficulty) {
            successes += 1;
        } else if (roll === 1) {
            onesCount++;
        }
    }

    const output = document.getElementById('dice-results');
    output.innerHTML = `
        <div class="pool-info">Пул кубиков: <b>${poolSize}d10</b> | Сложность: <b>${difficulty}</b></div>
        <div class="results">[ ${results.join(', ')} ]</div>
        <div style="color: ${onesCount > 0 && successes == 0 ? '#a83a3a' : '#d4af37'}; font-size: 1.2rem; font-weight:bold;">
            Успехов: ${successes}
        </div>
        ${onesCount > 0 && successes == 0 ? '<div style="color: #a83a3a;">Критический провал! (Единицы отменяют всё)</div>' : ''}
        ${tensCount > 0 ? '<div style="color: #888; font-size: 0.9rem;">Критические успехи (10): ' + tensCount + '</div>' : ''}
    `;
}

// --- ВКЛАДКИ ---
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// --- ЗАПУСК ---
window.onload = () => {
    // Исправление: проверяем, существует ли текущий ID, если нет - берем первого
    if (characters.length > 0) {
        const exists = characters.find(c => c.id === currentCharId);
        if (!exists) {
            currentCharId = characters[0].id;
        }
        saveAll();
    } else {
        // Если список пуст, создаем первого
        addCharacter();
    }

    renderSidebar();
    renderSheet();
    populateDiceSelects();
};
