// Функция автошифта с правильной логикой
function performAutoshift() {
    if (!currentSystem) {
        alert('Сначала инициализируйте систему!');
        return;
    }

    console.log("=== НАЧАЛО АВТОШИФТА ===");

    // 1. ВСЕ сотрудники с отдыха выходят в зал
    const restingEmployees = currentSystem.employees.filter(emp => emp.isResting);
    console.log("С отдыха выходят:", restingEmployees.length, "сотрудников");

    // 2. Для каждого пита создаем цепочку замен
    currentSystem.pits.forEach(pit => {
        console.log(`Обрабатываем Пит ${pit.id}:`);
        
        // Все сотрудники пита (текущие работающие)
        const currentPitEmployees = [...pit.employees];
        console.log("Текущие сотрудники в пите:", currentPitEmployees.length);
        
        // Сотрудники, которые придут в этот пит с отдыха
        const incomingEmployees = restingEmployees.splice(0, currentPitEmployees.length);
        console.log("Приходят с отдыха:", incomingEmployees.length);

        if (incomingEmployees.length > 0) {
            // Создаем новую цепочку: новые сотрудники + текущие
            const newChain = [...incomingEmployees, ...currentPitEmployees];
            
            // Оставляем только необходимое количество (по позициям в пите)
            pit.employees = newChain.slice(0, pit.positions);
            
            // Те, кто не влез - идут на отдых
            const goingToRest = newChain.slice(pit.positions);
            goingToRest.forEach(emp => {
                emp.isResting = true;
                emp.pit = null;
                emp.position = null;
                emp.chain = null;
            });
            
            // Обновляем позиции оставшихся сотрудников
            pit.employees.forEach((emp, index) => {
                emp.isResting = false;
                emp.pit = pit.id;
                emp.position = index + 1;
            });

            console.log("Осталось в пите:", pit.employees.length);
            console.log("Ушло на отдых:", goingToRest.length);
        }
    });

    // 3. Оставшиеся сотрудники с отдыха (если не все разместились)
    restingEmployees.forEach(emp => {
        emp.isResting = true; // остаются на отдыхе
    });

    // 4. Пересчитываем статистику
    currentSystem.restingEmployees = currentSystem.employees.filter(emp => emp.isResting).length;
    
    // 5. Пересоздаем цепочки
    createChains();
    
    // 6. Обновляем отображение
    updateDisplay();
    
    console.log("=== АВТОШИФТ ЗАВЕРШЕН ===");
    showNotification('Автошифт выполнен! Все с отдыха вышли в зал');
}

// Упрощенное создание цепочек
function createChains() {
    if (!currentSystem) return;

    currentSystem.pits.forEach(pit => {
        pit.chains = [];
        
        // Просто делим сотрудников на цепочки по 3-5 человек
        const chainSize = Math.min(4, Math.ceil(pit.employees.length / 2));
        
        for (let i = 0; i < pit.employees.length; i += chainSize) {
            const chain = pit.employees.slice(i, i + chainSize);
            pit.chains.push(chain);
        }
    });
}
