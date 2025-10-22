const shiftSystem = {
    calculateShift() {
        try {
            if (employeesModule.employees.length === 0) {
                alert('Сначала создайте сотрудников!');
                return;
            }
            
            const positions = pitsModule.getActivePositions();
            const totalPositions = positions.length;
            
            if (totalPositions === 0) {
                alert('Нет активных позиций!');
                return;
            }
            
            if (totalPositions >= employeesModule.employees.length) {
                alert('Активных позиций должно быть меньше чем сотрудников!');
                return;
            }
            
            // Рассчитываем цепочки
            const chains = chainsModule.calculateChains(employeesModule.employees, positions);
            
            // Получаем распределение
            const assignments = chainsModule.getAllAssignments();
            const restingEmployees = chainsModule.getRestingEmployees();
            
            // Обновляем расписание
            const currentInterval = timeModule.getCurrentTimeInterval();
            scheduleModule.updateSchedule(assignments, restingEmployees, currentInterval);
            
            // Показываем информацию
            const debugInfo = document.getElementById('debugInfo');
            debugInfo.innerHTML = `
                <strong>Шифт для ${timeModule.currentTime.hour}:${timeModule.currentTime.minute.toString().padStart(2, '0')}</strong><br>
                • Сотрудников: ${employeesModule.employees.length}<br>
                • Позиций: ${totalPositions}<br>
                • Отдыхающих: ${restingEmployees.length}<br>
                • Цепочек: ${chains.length}<br>
                • Длина цепочки: ${chains[0] ? chains[0].length : 0} звеньев
            `;
            
            // Переходим к следующему времени
            timeModule.moveToNextTime();
            
        } catch (error) {
            alert(error.message);
        }
    }
};

// Инициализация при загрузке
window.onload = function() {
    pitsModule.init();
    scheduleModule.init();
    timeModule.updateCurrentTimeDisplay();
};
