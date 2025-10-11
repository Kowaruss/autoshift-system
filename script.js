let currentSystem = null;

// Генерация конфигурации питов
document.getElementById('pitsCount').addEventListener('change', generatePitsConfig);

function generatePitsConfig() {
    const pitsCount = parseInt(document.getElementById('pitsCount').value);
    const container = document.getElementById('pitsConfig');
    container.innerHTML = '<h3>Конфигурация питов:</h3>';
    
    for (let i = 1; i <= pitsCount; i++) {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label>Пит ${i} - количество позиций:</label>
            <input type="number" id="pit${i}Positions" value="${i === 1 ? 15 : 20}" min="1">
        `;
        container.appendChild(div);
    }
}

// Инициализация системы
function initializeSystem() {
    const pitsCount = parseInt(document.getElementById('pitsCount').value);
    const totalEmployees = parseInt(document.getElementById('totalEmployees').value);
    
    const pitsConfig = [];
    let totalPositions = 0;
    
    for (let i = 1; i <= pitsCount; i++) {
        const positions = parseInt(document.getElementById(`pit${i}Positions`).value);
        pitsConfig.push({
            id: i,
            positions: positions,
            employees: [],
            chains: []
        });
        totalPositions += positions;
    }

    const restingCount = totalEmployees - totalPositions;
    
    if (restingCount < 0) {
        alert('Ошибка: Недостаточно сотрудников для заполнения всех позиций!');
        return;
    }

    currentSystem = {
        pits: pitsConfig,
        totalEmployees: totalEmployees,
        restingEmployees: restingCount,
        employees: Array.from({length: totalEmployees}, (_, i) => ({
            id: i + 1,
            pit: null,
            position: null,
            isResting: false,
            chain: null
        }))
    };

    distributeEmployees();
    createChains();
    updateDisplay();
    document.getElementById('autoshiftBtn').disabled = false;
}

// Распределение сотрудников по питам
function distributeEmployees() {
    if (!currentSystem) return;

    let employeeIndex = 0;
    
    // Распределяем работающих сотрудников
    currentSystem.pits.forEach(pit => {
        pit.employees = [];
        for (let i = 0; i < pit.positions; i++) {
            if (employeeIndex < currentSystem.totalEmployees) {
                const employee = currentSystem.employees[employeeIndex];
                employee.pit = pit.id;
                employee.position = i + 1;
                employee.isResting = false;
                pit.employees.push(employee);
                employeeIndex++;
            }
        }
    });

    // Оставшиеся сотрудники на отдыхе
    for (let i = employeeIndex; i < currentSystem.totalEmployees; i++) {
        currentSystem.employees[i].isResting = true;
        currentSystem.employees[i].pit = null;
        currentSystem.employees[i].position = null;
    }
}

// Создание цепочек для каждого пита
function createChains() {
    if (!currentSystem) return;

    currentSystem.pits.forEach(pit => {
        // Создаем цепочки внутри пита
        const chainLength = Math.ceil(pit.positions / 2); // Пример логики
        pit.chains = [];
        
        for (let i = 0; i < pit.employees.length; i += chainLength) {
            const chain = pit.employees.slice(i, i + chainLength);
            pit.chains.push(chain);
            
            // Помечаем сотрудников принадлежность к цепочке
            chain.forEach(emp => {
                emp.chain = pit.chains.length - 1;
            });
        }
    });
}

// Визуализация системы
function updateDisplay() {
    if (!currentSystem) return;

    const container = document.getElementById('pitsContainer');
    container.innerHTML = '';

    // Обновляем статистику
    document.getElementById('totalEmployeesCount').textContent = currentSystem.totalEmployees;
    document.getElementById('workingCount').textContent = currentSystem.totalEmployees - currentSystem.restingEmployees;
    document.getElementById('restingCount').textContent = currentSystem.restingEmployees;

    // Отображаем питы
    currentSystem.pits.forEach(pit => {
        const pitElement = document.createElement('div');
        pitElement.className = 'pit';
        
        let chainsHTML = '';
        pit.chains.forEach((chain, index) => {
            chainsHTML += `
                <div class="chain">
                    <div class="chain-title">Цепочка ${index + 1} (${chain.length} чел.)</div>
                    ${chain.map(emp => `
                        <div class="employee working">
                            <span class="employee-id">Сотрудник ${emp.id}</span>
                            <span class="employee-position">Поз. ${emp.position}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        pitElement.innerHTML = `
            <div class="pit-header">
                <h3 class="pit-title">Пит ${pit.id}</h3>
                <span>${pit.positions} позиций</span>
            </div>
            ${chainsHTML}
        `;
        container.appendChild(pitElement);
    });

    // Отображение отдыхающих
    const restingEmployees = currentSystem.employees.filter(emp => emp.isResting);
    const restingElement = document.createElement('div');
    restingElement.className = 'pit resting-section';
    restingElement.innerHTML = `
        <div class="pit-header">
            <h3 class="pit-title">💤 На отдыхе</h3>
            <span>${restingEmployees.length} чел.</span>
        </div>
        <div class="chain">
            ${restingEmployees.map(emp => 
                `<div class="employee resting">
                    <span class="employee-id">Сотрудник ${emp.id}</span>
                    <span class="employee-position">Отдых</span>
                 </div>`
            ).join('')}
        </div>
    `;
    container.appendChild(restingElement);
}

// Функция автошифта
function performAutoshift() {
    if (!currentSystem) {
        alert('Сначала инициализируйте систему!');
        return;
    }

    // Сохраняем текущее состояние для анимации
    const previousState = JSON.parse(JSON.stringify(currentSystem.employees));

    // Логика ротации: последние с каждого пита идут отдыхать
    currentSystem.pits.forEach(pit => {
        if (pit.employees.length > 0) {
            // Берем последнего сотрудника из каждой цепочки
            pit.chains.forEach(chain => {
                if (chain.length > 0) {
                    const lastEmployee = chain.pop();
                    lastEmployee.isResting = true;
                    lastEmployee.pit = null;
                    lastEmployee.position = null;
                    lastEmployee.chain = null;
                    
                    // Удаляем из основного массива сотрудников пита
                    const index = pit.employees.findIndex(emp => emp.id === lastEmployee.id);
                    if (index > -1) {
                        pit.employees.splice(index, 1);
                    }
                }
            });
        }
    });

    // Пересчитываем отдыхающих
    currentSystem.restingEmployees = currentSystem.employees.filter(emp => emp.isResting).length;

    // Сотрудники с отдыха выходят на работу (занимают первые позиции)
    const restingEmployees = currentSystem.employees.filter(emp => emp.isResting);
    currentSystem.pits.forEach(pit => {
        if (restingEmployees.length > 0 && pit.employees.length < pit.positions) {
            const newEmployee = restingEmployees.shift();
            newEmployee.isResting = false;
            newEmployee.pit = pit.id;
            newEmployee.position = pit.employees.length + 1;
            pit.employees.unshift(newEmployee); // Добавляем в начало
        }
    });

    // Пересоздаем цепочки
    createChains();
    
    // Обновляем отображение
    updateDisplay();
    
    // Показываем сообщение о выполненном автошифте
    showNotification('Автошифт выполнен!');
}

// Вспомогательная функция для уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    generatePitsConfig();
});
