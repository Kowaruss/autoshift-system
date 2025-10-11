let currentSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('pitsCount').addEventListener('change', generatePitsConfig);
    document.getElementById('initBtn').addEventListener('click', initializeSystem);
    document.getElementById('autoshiftBtn').addEventListener('click', performAutoshift);
    
    generatePitsConfig();
    console.log("Сайт загружен!");
});

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
    
    console.log("Система инициализирована! Отдыхающих:", restingCount);
}

function distributeEmployees() {
    if (!currentSystem) return;

    let employeeIndex = 0;
    
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

    for (let i = employeeIndex; i < currentSystem.totalEmployees; i++) {
        currentSystem.employees[i].isResting = true;
        currentSystem.employees[i].pit = null;
        currentSystem.employees[i].position = null;
    }
}

// Создание цепочек - количество цепочек = количеству отдыхающих
function createChains() {
    if (!currentSystem) return;

    const restingCount = currentSystem.restingEmployees;
    console.log("Создаем цепочки. Количество цепочек = отдыхающим:", restingCount);

    // Очищаем все цепочки
    currentSystem.pits.forEach(pit => {
        pit.chains = [];
    });

    // Если нет отдыхающих - нет цепочек
    if (restingCount === 0) {
        console.log("Нет отдыхающих - цепочки не создаются");
        return;
    }

    // Распределяем цепочки по питам
    let chainIndex = 0;
    
    for (let i = 0; i < restingCount; i++) {
        const pitIndex = chainIndex % currentSystem.pits.length;
        const pit = currentSystem.pits[pitIndex];
        
        if (!pit.chains[i]) {
            pit.chains[i] = [];
        }
        
        chainIndex++;
    }

    // Распределяем сотрудников по цепочкам
    currentSystem.pits.forEach(pit => {
        if (pit.chains.length > 0) {
            const employeesPerChain = Math.ceil(pit.employees.length / pit.chains.length);
            let employeeIndex = 0;
            
            pit.chains.forEach(chain => {
                chain.length = 0; // Очищаем цепочку
                const chainEmployees = pit.employees.slice(employeeIndex, employeeIndex + employeesPerChain);
                chain.push(...chainEmployees);
                employeeIndex += employeesPerChain;
            });
        }
    });

    console.log("Цепочки созданы. Распределение:", 
        currentSystem.pits.map(pit => `Пит ${pit.id}: ${pit.chains.length} цеп.`).join(', '));
}

function updateDisplay() {
    if (!currentSystem) return;

    const container = document.getElementById('pitsContainer');
    container.innerHTML = '';

    document.getElementById('totalEmployeesCount').textContent = currentSystem.totalEmployees;
    document.getElementById('workingCount').textContent = currentSystem.totalEmployees - currentSystem.restingEmployees;
    document.getElementById('restingCount').textContent = currentSystem.restingEmployees;

    currentSystem.pits.forEach(pit => {
        const pitElement = document.createElement('div');
        pitElement.className = 'pit';
        
        let chainsHTML = '';
        pit.chains.forEach((chain, index) => {
            if (chain.length > 0) {
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
            }
        });

        pitElement.innerHTML = `
            <div class="pit-header">
                <h3 class="pit-title">Пит ${pit.id}</h3>
                <span>${pit.positions} позиций, ${pit.chains.length} цепочек</span>
            </div>
            ${chainsHTML || '<div class="chain">Нет цепочек</div>'}
        `;
        container.appendChild(pitElement);
    });

    const restingEmployees = currentSystem.employees.filter(emp => emp.isResting);
    const restingElement = document.createElement('div');
    restingElement.className = 'pit resting-section';
    restingElement.innerHTML = `
        <div class="pit-header">
            <h3 class="pit-title">💤 На отдыхе (${restingEmployees.length})</h3>
            <span>Цепочек: ${restingEmployees.length}</span>
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

function performAutoshift() {
    if (!currentSystem) {
        alert('Сначала инициализируйте систему!');
        return;
    }

    console.log("=== НАЧАЛО АВТОШИФТА ===");

    const targetRestingCount = currentSystem.restingEmployees;
    console.log("Количество цепочек (отдыхающих):", targetRestingCount);

    // Сохраняем текущее распределение по цепочкам
    const oldChains = currentSystem.pits.map(pit => [...pit.chains]);

    // Перемешиваем всех сотрудников
    const allEmployees = [...currentSystem.employees];
    const shuffledEmployees = [...allEmployees].sort(() => Math.random() - 0.5);

    // Распределяем сотрудников по позициям
    let employeeIndex = 0;
    
    currentSystem.pits.forEach(pit => {
        pit.employees = [];
        
        for (let i = 0; i < pit.positions && employeeIndex < shuffledEmployees.length; i++) {
            const employee = shuffledEmployees[employeeIndex];
            employee.isResting = false;
            employee.pit = pit.id;
            employee.position = i + 1;
            pit.employees.push(employee);
            employeeIndex++;
        }
    });

    // Оставшиеся идут на отдых
    for (let i = employeeIndex; i < shuffledEmployees.length; i++) {
        shuffledEmployees[i].isResting = true;
        shuffledEmployees[i].pit = null;
        shuffledEmployees[i].position = null;
    }

    // Количество отдыхающих должно остаться прежним
    currentSystem.restingEmployees = targetRestingCount;

    // Пересоздаем цепочки (количество = количеству отдыхающих)
    createChains();
    updateDisplay();
    
    console.log("=== АВТОШИФТ ЗАВЕРШЕН ===");
    showNotification(`Автошифт выполнен! Цепочек: ${currentSystem.restingEmployees}`);
}

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
