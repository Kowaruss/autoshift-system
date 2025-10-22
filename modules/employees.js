const employeesModule = {
    employees: [],
    
    generateEmployees() {
        const count = parseInt(document.getElementById('employeesCount').value);
        
        this.employees = [];
        for (let i = 1; i <= count; i++) {
            this.employees.push({
                id: i,
                surname: i.toString(),
                currentPosition: null,
                currentPit: null
            });
        }
        
        this.displayEmployees();
        chainsModule.resetChains();
        scheduleModule.clearSchedule();
        timeModule.resetTime();
        
        const debugInfo = document.getElementById('debugInfo');
        debugInfo.innerHTML = `<strong>Создано ${count} сотрудников</strong>`;
    },
    
    displayEmployees() {
        const container = document.getElementById('employeesList');
        container.innerHTML = '<strong>Сотрудники:</strong> ' + 
            this.employees.map(emp => emp.surname).join(', ');
    },
    
    getEmployeeById(id) {
        return this.employees.find(emp => emp.id === id);
    },
    
    updateEmployeePosition(employeeId, position) {
        const employee = this.getEmployeeById(employeeId);
        if (employee) {
            employee.currentPosition = position;
            employee.currentPit = position ? position.pit : null;
        }
    }
};
