// Данные характеристик
const qualities = [
    "Сила", "Проворство", "Точность", "Выносливость", "Харизма",
    "Хитрость", "Восприятие", "Ум", "Чутье"
];

const skills = [
    "Атлетика", "Бдительность", "Выживание", "Красноречие", "Ловкость рук",
    "Ремесло", "Скрытность", "Стрельба", "Фехтование", "Анализ", "Животные"
];

const bodyParts = [
    "Всего", "Торс", "Голова", "Л. Рука", "П. Рука", "Л. Нога", "П. Нога"
];

// Функция создания списков
function renderLists() {
    const qContainer = document.getElementById('qualities-list');
    const sContainer = document.getElementById('skills-list');

    qualities.forEach(q => {
        qContainer.innerHTML += `
            <div class="item-row">
                <label>${q}</label>
                <input type="number" id="q-${q}" min="-2" max="10" value="0" oninput="calculateVirtues()">
            </div>
        `;
    });

    skills.forEach(s => {
        sContainer.innerHTML += `
            <div class="item-row">
                <label>${s}</label>
                <input type="number" id="s-${s}" min="0" max="5" value="0">
            </div>
        `;
    });
}

// Расчет добродетелей
function calculateVirtues() {
    // Получаем значения (это пример, в реальности нужно брать input-ы)
    // Допустим, значения по умолчанию 1
    const conscience = 2; // Совесть
    const selfControl = 2; // Самоконтроль
    const coldBlood = 2; // Хладнокровие
    const courage = 2; // Смелость

    const righteousness = (conscience + selfControl) + 2;
    const stressResist = (coldBlood + courage) + 2;

    document.getElementById('righteousness').innerText = righteousness;
    document.getElementById('stress-resist').innerText = stressResist;
}

// Рендер таблицы ран
function renderWoundsTable() {
    const tbody = document.getElementById('wounds-body');
    
    bodyParts.forEach(part => {
        tbody.innerHTML += `
            <tr>
                <td>${part}</td>
                <td><input type="text" value="0 / 0" style="width: 50px;"></td>
                <td><input type="number" class="wound-light" value="0" style="width: 40px;"></td>
                <td><input type="number" class="wound-heavy" value="0" style="width: 40px;"></td>
                <td class="sum-cell">0</td>
            </tr>
        `;
    });

    // Добавляем логику пересчета суммы
    tbody.querySelectorAll('tr').forEach(row => {
        const light = row.querySelector('.wound-light');
        const heavy = row.querySelector('.wound-heavy');
        
        const updateSum = () => {
            const sum = (parseInt(light.value) || 0) + (parseInt(heavy.value) || 0);
            row.querySelector('.sum-cell').innerText = sum;
        };

        light.addEventListener('input', updateSum);
        heavy.addEventListener('input', updateSum);
    });
}

// Запуск
window.onload = () => {
    renderLists();
    renderWoundsTable();
    calculateVirtues();
};
