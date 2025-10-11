// Функция автошифта с постоянным количеством отдыхающих
function performAutoshift() {
    if (!currentSystem) {
        alert('Сначала инициализируйте систему!');
        return;
    }

    console.log("=== НАЧАЛО АВТОШИФТА ===");

    // Фиксируем количество отдыхающих, которое должно остаться
    const targetRestingCount = currentSystem.restingEmployees;
    console.log("Должно остаться на отдыхе:", targetRestingCount);

    // 1. ВСЕ сотрудники с отдыха выходят в зал
    const allRestingEmployees = currentSystem.employees.filter(emp => emp.isResting);
    console.log("С отдыха выходят:", allRestingEmployees.length, "сотрудников");

    // 2. Собираем ВСЕХ сотрудников в один пул
    const allEmployeesPool = [
        ...currentSystem.employees.filter(emp => !emp.isResting), // работающие
        ...allRestingEmployees // отдыхающие
    ];
    console.log("Всего сотрудников в пуле:", allEmployeesPool.length);

    // 3. Перемешиваем пул для случайного распределения
    const shuffledEmployees = [...allEmployeesPool].sort(() => Math.random() - 0.5);

    // 4. Распределяем сотрудников по питам
    let employeeIndex = 0;
    
    currentSystem.pits.forEach(pit => {
        pit.employees = [];
        
        // Заполняем пит сотрудниками из пула
        for (let i = 0; i < pit.positions && employeeIndex < shuffledEmployees.length; i++) {
            const employee = shuffledEmployees[employeeIndex];
            employee.isResting = false;
            employee.pit = pit.id;
            employee.position = i + 1;
            pit.employees.push(employee);
            employeeIndex++;
        }
    });

    // 5. Оставшиеся сотрудники идут на отдых (ровно targetRestingCount)
    const remainingEmployees = shuffledEmployees.slice(employeeIndex);
    
    // Оставляем ровно targetRestingCount человек на отдыхе
    const employeesGoingToRest = remainingEmployees.slice(0, targetRestingCount);
    employeesGoingToRest.forEach(emp => {
        emp.isResting = true;
        emp.pit = null;
        emp.position = null;
        emp.chain = null;
    });

    // 6. Если остались "лишние" сотрудники после targetRestingCount, 
    // распределяем их обратно в питы (если есть свободные места)
    const extraEmployees = remainingEmployees.slice(targetRestingCount);
    if (extraEmployees.length > 0) {
        console.log("Лишние сотрудники для распределения:", extraEmployees.length);
        
        extraEmployees.forEach(emp => {
            // Ищем пит со свободными местами
            const availablePit = currentSystem.pits.find(pit => 
                pit.employees.length < pit.positions
            );
            
            if (availablePit) {
                emp.isResting = false;
                emp.pit = availablePit.id;
                emp.position = availablePit.employees.length + 1;
                availablePit.employees.push(emp);
            } else {
                // Если нет свободных мест - оставляем на отдыхе
                emp.isResting = true;
            }
        });
    }

    // 7. Пересчитываем актуальное количество отдыхающих
    currentSystem.restingEmployees = currentSystem.employees.filter(emp => emp.isResting).length;
    console.log("Фактически на отдыхе:", currentSystem.restingEmployees);

    // 8. Пересоздаем цепочки
    createChains();
    
    // 9. Обновляем отображение
    updateDisplay();
    
    console.log("=== АВТОШИФТ ЗАВЕРШЕН ===");
    showNotification(`Автошифт выполнен! На отдыхе: ${currentSystem.restingEmployees} чел.`);
}

// Упрощенное создание цепочек
function createChains() {
    if (!currentSystem) return;

    currentSystem.pits.forEach(pit => {
        pit.chains = [];
        
        if (pit.employees.length === 0) return;
        
        // Делим сотрудников на цепочки по 2-4 человека
        const chainSize = Math.min(4, Math.max(2, Math.ceil(pit.employees.length / 3)));
        
        for (let i = 0; i < pit.employees.length; i += chainSize) {
            const chain = pit.employees.slice(i, i + chainSize);
            pit.chains.push(chain);
            
            // Помечаем сотрудников принадлежность к цепочке
            chain.forEach((emp, index) => {
                emp.chain = pit.chains.length - 1;
                emp.chainPosition = index;
            });
        }
    });
}
