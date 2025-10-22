// Основные переменные
let employees = [];
let pits = [];
let currentShift = 0;
let employeeHistory = {};
const totalPits = 5;
const tablesPerPit = 5;
const shiftDuration = 12; // часов
const intervalsPerHour = 3; // 20 минутные интервалы

// Русские фамилии для генерации
const russianSurnames = [
    'Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Попов', 'Васильев', 'Смирнов', 'Новиков',
    'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов', 'Егоров', 'Павлов',
    'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров',
    'Зайцев', 'Соловьёв', 'Борисов', 'Яковлев', 'Григорьев', 'Романов', 'Воробьёв', 'Сергеев',
    'Фролов', 'Гаврилов', 'Карпов', 'Киселёв', 'Ильин', 'Максимов', 'Поляков', 'Виноградов'
];

// Инициализация при загрузке
function init() {
    generatePitsConfiguration();
    updateTimeHeader();
}

// Генерация конфигурации питов
function generatePitsConfiguration() {
    const container = document.getElementById('pitsContainer');
    container.innerHTML = '';
    
    pits = [];
    
    for (let pit = 1; pit <= totalPits; pit++) {
        const pitDiv = document.createElement('div');
        pitDiv.className = 'pit';
        pitDiv.innerHTML = `
            <div class="pit-config-row">
                <strong>Пит ${pit}:</strong>
                <label>
                    <input type="checkbox" id="pit${pit}Active" checked 
                           onchange="togglePit(${pit})"> Активен
                </label>
            </div>
            <div id="tablesPit${pit}">
                ${generateTablesConfiguration(pit)}
            </div>
        `;
        container.appendChild(pitDiv);
        
        pits.push({
            id: pit,
            active: true,
            tables: Array.from({length: tablesPerPit}, (_, i) => ({
                id: i + 1,
                dealer: true,
                inspector: true
            }))
        });
    }
}

function togglePit(pitNumber) {
    const isActive = document.getElementById(`pit${pitNumber}Active`).checked;
    const tablesDiv = document.getElementById(`tablesPit${pitNumber}`);
    
    pits[pitNumber - 1].active = isActive;
    tablesDiv.style.display = isActive ? 'block' : 'none';
}

function generateTablesConfiguration(pitNumber) {
    let html = '';
    for (let table = 1; table <= tablesPerPit; table++) {
        html += `
            <div class="table-config-row">
                Стол ${table}:
                <div class="position-checkbox">
                    <label>
                        <input type="checkbox" id="pit${pitNumber}table${table}dealer" checked 
                               onchange="updateTableConfig(${pitNumber}, ${table}, 'dealer', this.checked)"> Д
                    </label>
                    <label>
                        <input type="checkbox" id="pit${pitNumber}table${table}inspector" checked 
                               onchange="updateTableConfig(${pitNumber}, ${table}, 'inspector', this.checked)"> И
                    </label>
                </div>
            </div>
        `;
    }
    return html;
}

function updateTableConfig(pitNumber, tableNumber, position, isActive) {
    pits[pitNumber - 1].tables[tableNumber - 1][position] = isActive;
}

// Генерация сотрудников
function generateEmployees() {
    const count = parseInt(document.getElementById('employeesCount').value);
    const shuffledSurnames = [...russianSurnames].sort(() => Math.random() - 0.5);
    
    employees = shuffledSurnames.slice(0, count).map((surname, index) => ({
        id: index + 1,
        surname: surname,
        currentPit: null
    }));
    
    displayEmployees();
    employeeHistory = {}; // Сбрасываем историю при новой генерации
}

function displayEmployees() {
    const container = document.getElementById('employeesList');
    container.innerHTML = '<strong>Сотрудники:</strong> ' + 
        employees.map(emp => emp.surname).join(', ');
}

// Обновление заголовка времени
function updateTimeHeader() {
    const container = document.getElementById('timeHeader');
    let html = '<div class="name-cell"></div>'; // Пустая ячейка для имен
    
    for (let hour = 0; hour < shiftDuration; hour++) {
        const displayHour = hour + 8; // Начинаем с 8 утра
        html += `<div class="hour-column">${displayHour}:00</div>`;
        
        for (let interval = 0; interval < intervalsPerHour; interval++) {
            const minutes = interval * 20;
            html += `<div class="minute-column">${minutes.toString().padStart(2, '0')}</div>`;
        }
    }
    
    container.innerHTML = html;
}

// Основная функция расчета шифта
function calculateShift() {
    if (employees.length === 0) {
        alert('Сначала сгенерируйте сотрудников!');
        return;
    }
    
    // Получаем активные позиции
    const activePositions = getActivePositions();
    const totalPositions = activePositions.length;
    
    if (totalPositions === 0) {
        alert('Нет активных позиций!');
        return;
    }
    
    // Определяем отдыхающих
    const restingCount = employees.length - totalPositions;
    
    if (restingCount <= 0) {
        alert('Недостаточно сотрудников для отдыхающих!');
        return;
    }
    
    // Расчет цепочек
    const chainLength = Math.floor(totalPositions / restingCount);
    const extraChains = totalPositions % restingCount;
    
    // Распределение отдыхающих по питам
    const restingPerPit = distributeRestingByPits(restingCount);
    
    // Формируем цепочки
    const chains = formChains(activePositions, restingPerPit, chainLength, extraChains);
    
    // Обновляем расписание
    updateSchedule(chains);
    
    currentShift++;
}

function getActivePositions() {
    const positions = [];
    
    pits.forEach(pit => {
        if (pit.active) {
            pit.tables.forEach(table => {
                if (table.dealer) {
                    positions.push({ pit: pit.id, table: table.id, position: 'Д' });
                }
                if (table.inspector) {
                    positions.push({ pit: pit.id, table: table.id, position: 'И' });
                }
            });
        }
    });
    
    return positions;
}

function distributeRestingByPits(restingCount) {
    const restingPerPit = new Array(totalPits).fill(0);
    const baseResting = Math.floor(restingCount / totalPits);
    let remaining = restingCount - baseResting * totalPits;
    
    // Базовое распределение
    for (let i = 0; i < totalPits; i++) {
        restingPerPit[i] = baseResting;
    }
    
    // Распределение остатка
    for (let i = 0; i < remaining; i++) {
        restingPerPit[i]++;
    }
    
    return restingPerPit;
}

function formChains(positions, restingPerPit, chainLength, extraChains) {
    const chains = [];
    let positionIndex = 0;
    
    // Группируем позиции по питам
    const positionsByPit = {};
    pits.forEach(pit => {
        if (pit.active) {
            positionsByPit[pit.id] = positions.filter(pos => pos.pit === pit.id);
        }
    });
    
    // Формируем цепочки для каждого пита
    Object.keys(positionsByPit).forEach(pitId => {
        const pitPositions = positionsByPit[pitId];
        const pitRestingCount = restingPerPit[pitId - 1];
        
        if (pitRestingCount > 0) {
            const pitChainLength = Math.floor(pitPositions.length / pitRestingCount);
            const pitExtraChains = pitPositions.length % pitRestingCount;
            
            // Выбираем случайных отдыхающих для этого пита
            const availableResting = employees.filter(emp => 
                !employeeHistory[emp.id] || employeeHistory[emp.id] !== parseInt(pitId)
            );
            
            const restingForThisPit = availableResting
                .sort(() => Math.random() - 0.5)
                .slice(0, pitRestingCount);
            
            // Формируем цепочки
            let posIndex = 0;
            restingForThisPit.forEach((restingEmp, index) => {
                const actualChainLength = index < pitExtraChains ? pitChainLength + 1 : pitChainLength;
                const chain = {
                    restingEmployee: restingEmp,
                    positions: pitPositions.slice(posIndex, posIndex + actualChainLength),
                    pit: parseInt(pitId)
                };
                chains.push(chain);
                posIndex += actualChainLength;
                
                // Обновляем историю
                employeeHistory[restingEmp.id] = parseInt(pitId);
            });
        }
    });
    
    return chains;
}

function updateSchedule(chains) {
    const table = document.getElementById('scheduleTable');
    table.innerHTML = '';
    
    // Создаем строки для сотрудников
    employees.forEach(employee => {
        const row = document.createElement('div');
        row.className = 'employee-row';
        
        // Ячейка с фамилией
        const nameCell = document.createElement('div');
        nameCell.className = 'name-cell';
        nameCell.textContent = employee.surname;
        row.appendChild(nameCell);
        
        // Ячейки времени
        for (let hour = 0; hour < shiftDuration; hour++) {
            for (let interval = 0; interval < intervalsPerHour; interval++) {
                const timeCell = document.createElement('div');
                timeCell.className = 'time-cell';
                
                // Находим позицию сотрудника в этом интервале
                const position = findEmployeePosition(employee, hour, interval, chains);
                if (position) {
                    timeCell.textContent = `${position.position}${position.table}.${position.pit}`;
                    timeCell.className += ' work';
                } else {
                    timeCell.textContent = 'Отдых';
                    timeCell.className += ' break';
                }
                
                row.appendChild(timeCell);
            }
        }
        
        table.appendChild(row);
    });
}

function findEmployeePosition(employee, hour, interval, chains) {
    // Упрощенная логика - для демонстрации
    // В реальной реализации нужно учитывать длину цепочек и временные интервалы
    const totalIntervals = shiftDuration * intervalsPerHour;
    const currentInterval = hour * intervalsPerHour + interval;
    
    for (let chain of chains) {
        if (chain.restingEmployee.id === employee.id) {
            // Отдыхающий начинает цепочку
            if (currentInterval === 0) {
                return chain.positions[0];
            }
        } else {
            // Проверяем другие позиции в цепочке
            const empIndex = employees.findIndex(emp => emp.id === employee.id);
            const chainIndex = chains.findIndex(ch => ch.restingEmployee.id === employee.id);
            
            if (chainIndex !== -1) {
                const positionIndex = (currentInterval + empIndex) % chain.positions.length;
                return chain.positions[positionIndex];
            }
        }
    }
    
    return null;
}

// Инициализация при загрузке
window.onload = init;
