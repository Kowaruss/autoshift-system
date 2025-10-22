const scheduleModule = {
    shiftDuration: 2,
    intervalsPerHour: 3,
    
    init() {
        this.updateTimeHeader();
    },
    
    updateTimeHeader() {
        const container = document.getElementById('timeHeader');
        let html = '<div class="name-cell" style="background: #34495e; color: white; font-weight: bold;">Сотрудник</div>';
        
        for (let hour = 8; hour < 8 + this.shiftDuration; hour++) {
            html += `<div class="hour-column">${hour}:00</div>`;
            
            for (let interval = 0; interval < this.intervalsPerHour; interval++) {
                const minutes = interval * 20;
                html += `<div class="minute-column">${minutes.toString().padStart(2, '0')}</div>`;
            }
        }
        
        container.innerHTML = html;
    },
    
    clearSchedule() {
        document.getElementById('scheduleTable').innerHTML = '';
    },
    
    updateSchedule(assignments, restingEmployees, currentInterval) {
        let table = document.getElementById('scheduleTable');
        
        // Если таблица пустая, создаем ее
        if (table.innerHTML === '') {
            this.createEmptySchedule();
        }
        
        // Обновляем текущий интервал
        this.updateCurrentInterval(assignments, restingEmployees, currentInterval);
    },
    
    createEmptySchedule() {
        const table = document.getElementById('scheduleTable');
        table.innerHTML = '';
        
        employeesModule.employees.forEach(employee => {
            const row = document.createElement('div');
            row.className = 'employee-row';
            
            // Ячейка с номером сотрудника
            const nameCell = document.createElement('div');
            nameCell.className = 'name-cell';
            nameCell.textContent = employee.surname;
            row.appendChild(nameCell);
            
            // Пустые ячейки времени
            const totalIntervals = this.shiftDuration * this.intervalsPerHour;
            for (let i = 0; i < totalIntervals; i++) {
                const timeCell = document.createElement('div');
                timeCell.className = 'time-cell';
                timeCell.textContent = '';
                row.appendChild(timeCell);
            }
            
            table.appendChild(row);
        });
    },
    
    updateCurrentInterval(assignments, restingEmployees, intervalIndex) {
        const table = document.getElementById('scheduleTable');
        const rows = table.getElementsByClassName('employee-row');
        
        // Сбрасываем текущий интервал
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByClassName('time-cell');
            if (cells[intervalIndex]) {
                cells[intervalIndex].textContent = '';
                cells[intervalIndex].className = 'time-cell';
            }
        }
        
        // Заполняем рабочие позиции
        Object.keys(assignments).forEach(employeeId => {
            const employeeIndex = employeesModule.employees.findIndex(emp => emp.id === parseInt(employeeId));
            if (employeeIndex !== -1) {
                const cells = rows[employeeIndex].getElementsByClassName('time-cell');
                if (cells[intervalIndex]) {
                    cells[intervalIndex].textContent = assignments[employeeId].fullName;
                    cells[intervalIndex].className = 'time-cell work';
                }
            }
        });
        
        // Заполняем отдыхающих
        restingEmployees.forEach(restingEmp => {
            const employeeIndex = employeesModule.employees.findIndex(emp => emp.id === restingEmp.id);
            if (employeeIndex !== -1) {
                const cells = rows[employeeIndex].getElementsByClassName('time-cell');
                if (cells[intervalIndex]) {
                    cells[intervalIndex].textContent = '/';
                    cells[intervalIndex].className = 'time-cell break';
                }
            }
        });
        
        // Помечаем текущий интервал
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByClassName('time-cell');
            if (cells[intervalIndex]) {
                cells[intervalIndex].classList.add('current');
            }
        }
        
        // Обновляем позиции сотрудников
        employeesModule.employees.forEach(employee => {
            if (assignments[employee.id]) {
                employeesModule.updateEmployeePosition(employee.id, assignments[employee.id]);
            } else if (restingEmployees.find(re => re.id === employee.id)) {
                employeesModule.updateEmployeePosition(employee.id, null);
            }
        });
    }
};
