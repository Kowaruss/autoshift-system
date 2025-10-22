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
                               onchange="updateTableConfig(${pitNumber}, ${table}, 'dealer', this.checked)"> Дилер
                    </label>
                    <label>
                        <input type="checkbox" id="pit${pitNumber}table${table}inspector" checked 
                               onchange="updateTableConfig(${pitNumber}, ${table}, 'inspector', this.checked)"> Инспектор
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
    clearDebugInfo();
    clearSchedule();
}

function displayEmployees() {
    const container = document.getElementById('employeesList');
    container.innerHTML = '<strong>Сотрудники:</strong> ' + 
        employees.map(emp => emp.surname).join(', ');
}

function clearDebugInfo() {
    document.getElementById('debugInfo').innerHTML = '';
}

function clearSchedule() {
    document.getElementById('scheduleTable').innerHTML = '';
}

// Обновление заголовка времени
function updateTimeHeader() {
    const container = document.getElementById('timeHeader');
    let html = '<div class="name-cell" style="background: #34495e; color: white; font-weight: bold;">Фамилия</div>';
    
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
        alert('Нет активных позиций! Проверьте настройки питов.');
        return;
    }
    
    // Проверяем, что позиций меньше чем сотрудников
    if (totalPositions >= employees.length) {
        alert(`Ошибка: Активных позиций (${totalPositions}) должно быть МЕНЬШЕ чем сотрудников (${employees.length})! Отключите некоторые позиции.`);
        return;
    }
    
    // Определяем отдыхающих (разница между сотрудниками и позициями)
    const restingCount = employees.length - totalPositions;
    
    if (restingCount <= 0) {
        alert('Недостаточно сотрудников для формирования отдыхающих!');
        return;
    }
    
    // Расчет цепочек
    const chainLength = Math.floor(totalPositions / restingCount);
    const extraChains = totalPositions % restingCount;
    
    // Показываем отладочную информацию
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.innerHTML = `
        <strong>Информация о расчете:</strong><br>
        • Всего сотрудников: ${employees.length}<br>
        • Активных позиций: ${totalPositions}<br>
        • Отдыхающих: ${restingCount}<br>
        • Длина цепочки: ${chainLength} (основная)<br>
        • Доп. цепочек: ${extraChains} (длина ${chainLength + 1})
    `;
    
    console.log(`Позиций: ${totalPositions}, Отдыхающих: ${restingCount}`);
    console.log(`Длина цепочки: ${chainLength}, Доп. цепочек: ${extraChains}`);
    
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
                    positions.push({ 
                        pit: pit.id, 
                        table: table.id, 
                        position: 'Д',
                        fullName: `Д${table.id}.${pit.id}`
                    });
                }
                if (table.inspector) {
                    positions.push({ 
                        pit: pit.id, 
                        table: table.id, 
                        position: 'И',
                        fullName: `И${table.id}.${pit.id}`
                    });
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
    
    console.log('Распределение отдыхающих по питам:', restingPerPit);
    return restingPerPit;
}

function formChains(positions, restingPerPit, chainLength, extraChains) {
    const chains = [];
    
    // Группируем позиции по питам
    const positionsByPit = {};
    pits.forEach(pit => {
        if (pit.active) {
            positionsByPit[pit.id] = positions.filter(pos => pos.pit === pit.id);
            // Перемешиваем позиции внутри пита для случайности
            positionsByPit[pit.id] = positionsByPit[pit.id].sort(() => Math.random() - 0.5);
        }
    });
    
    // Создаем копию сотрудников для работы
    let availableEmployees = [...employees];
    
    // Формируем цепочки для каждого пита
    Object.keys(positionsByPit).forEach(pitId => {
        const pitIdNum = parseInt(pitId);
        const pitPositions = positionsByPit[pitId];
        const pitRestingCount = restingPerPit[pitIdNum - 1];
        
        if (pitRestingCount > 0 && pitPositions.length > 0) {
            // Расчет длины цепочек для этого пита
            const pitChainLength = Math.floor(pitPositions.length / pitRestingCount);
            const pitExtraChains = pitPositions.length % pitRestingCount;
            
            // Выбираем случайных отдыхающих для этого пита (которые не были на этом пите в прошлый раз)
            const availableForThisPit = availableEmployees.filter(emp => 
                !employeeHistory[emp.id] || employeeHistory[emp.id] !== pitIdNum
            );
            
            // Если нет подходящих, берем любых доступных
            const restingForThisPit = (availableForThisPit.length >= pitRestingCount) 
                ? availableForThisPit.sort(() => Math.random() - 0.5).slice(0, pitRestingCount)
                : availableEmployees.sort(() => Math.random() - 0.5).slice(0, pitRestingCount);
            
            // Удаляем выбранных из доступных
            restingForThisPit.forEach(emp => {
                availableEmployees = availableEmployees.filter(e => e.id !== emp.id);
            });
            
            // Формируем цепочки для выбранных отдыхающих
            let positionIndex = 0;
            restingForThisPit.forEach((restingEmp, index) => {
                const actualChainLength = index < pitExtraChains ? pitChainLength + 1 : pitChainLength;
                const chainPositions = pitPositions.slice(positionIndex, positionIndex + actualChainLength);
                
                if (chainPositions.length > 0) {
                    const chain = {
                        restingEmployee: restingEmp,
                        positions: chainPositions,
                        pit: pitIdNum,
                        chainLength: actualChainLength
                    };
                    chains.push(chain);
                    
                    // Обновляем историю
                    employeeHistory[restingEmp.id] = pitIdNum;
                }
                
                positionIndex += actualChainLength;
            });
        }
    });
    
    console.log('Сформированные цепочки:', chains);
    return chains;
}

function updateSchedule(chains) {
    const table = document.getElementById('scheduleTable');
    table.innerHTML = '';
    
    // Создаем карту распределения по интервалам
    const scheduleMap = createScheduleMap(chains);
    
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
                
                const intervalIndex = hour * intervalsPerHour + interval;
                const position = scheduleMap[employee.id]?.[intervalIndex];
                
                if (position) {
                    timeCell.textContent = position.fullName;
                    timeCell.className += ' work';
                    // Помечаем начало цепочки
                    if (position.isChainStart) {
                        timeCell.className += ' chain-start';
                        timeCell.title = 'Начало цепочки';
                    }
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

function createScheduleMap(chains) {
    const scheduleMap = {};
    
    // Инициализируем карту для всех сотрудников
    employees.forEach(emp => {
        scheduleMap[emp.id] = {};
    });
    
    // Заполняем расписание на основе цепочек
    chains.forEach(chain => {
        const { restingEmployee, positions, chainLength } = chain;
        
        // Для каждого интервала в цепочке
        for (let i = 0; i < chainLength; i++) {
            const position = positions[i];
            const intervalIndex = i; // Упрощенная логика - позиция соответствует интервалу
            
            if (intervalIndex < shiftDuration * intervalsPerHour) {
                // Первая позиция в цепочке - отдыхающий сотрудник
                if (i === 0) {
                    scheduleMap[restingEmployee.id][intervalIndex] = {
                        ...position,
                        isChainStart: true
                    };
                }
                
                // Остальные позиции распределяем по другим сотрудникам
                // В реальной реализации здесь должна быть более сложная логика ротации
                const workingEmployee = findEmployeeForPosition(restingEmployee.id, chains);
                if (workingEmployee && i > 0) {
                    scheduleMap[workingEmployee.id][intervalIndex] = position;
                }
            }
        }
    });
    
    return scheduleMap;
}

function findEmployeeForPosition(excludeEmployeeId, chains) {
    // Упрощенная логика поиска сотрудника для позиции
    // В реальной реализации нужно учитывать всю логику ротации
    const availableEmployees = employees.filter(emp => 
        emp.id !== excludeEmployeeId && 
        !chains.some(chain => chain.restingEmployee.id === emp.id)
    );
    
    return availableEmployees.length > 0 ? availableEmployees[0] : null;
}

// Инициализация при загрузке
window.onload = init;
