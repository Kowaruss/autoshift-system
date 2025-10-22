const chainsModule = {
    chains: [],
    currentChains: [],
    
    resetChains() {
        this.chains = [];
        this.currentChains = [];
    },
    
    calculateChains(employees, positions) {
        const totalPositions = positions.length;
        const restingCount = employees.length - totalPositions;
        
        if (restingCount <= 0) {
            throw new Error('Недостаточно сотрудников для формирования отдыхающих');
        }
        
        // Расчет длины цепочек
        const chainLength = Math.floor(totalPositions / restingCount) + 1;
        const totalChains = restingCount;
        
        console.log(`Цепочки: ${totalChains} цепочек по ${chainLength} звеньев`);
        
        // Если цепочки уже существуют, используем их
        if (this.chains.length > 0 && this.chains[0].length === chainLength) {
            this.rotateExistingChains();
            return this.currentChains;
        }
        
        // Создаем новые цепочки
        this.createNewChains(employees, positions, totalChains, chainLength);
        return this.currentChains;
    },
    
    createNewChains(employees, positions, totalChains, chainLength) {
        this.chains = [];
        this.currentChains = [];
        
        // Перемешиваем позиции и сотрудников
        const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
        const shuffledEmployees = [...employees].sort(() => Math.random() - 0.5);
        
        // Разделяем на работающих и отдыхающих
        const workingEmployees = shuffledEmployees.slice(0, positions.length);
        const restingEmployees = shuffledEmployees.slice(positions.length);
        
        // Создаем цепочки
        let positionIndex = 0;
        
        restingEmployees.forEach((restingEmp, chainIndex) => {
            const chain = [];
            
            // Добавляем позиции в цепочку
            for (let i = 0; i < chainLength - 1 && positionIndex < shuffledPositions.length; i++) {
                chain.push(shuffledPositions[positionIndex]);
                positionIndex++;
            }
            
            // Последнее звено - отдых
            chain.push({ fullName: '/', isRest: true });
            
            this.chains.push(chain);
            
            // Для первой итерации назначаем позиции
            const currentChainState = [];
            
            // Первое звено - отдыхающий сотрудник
            if (chain[0]) {
                currentChainState.push({
                    employee: restingEmp,
                    position: chain[0]
                });
            }
            
            // Остальные звенья - работающие сотрудники
            for (let i = 1; i < chain.length; i++) {
                const workingEmp = workingEmployees[(chainIndex * (chainLength - 1) + i - 1) % workingEmployees.length];
                if (chain[i]) {
                    currentChainState.push({
                        employee: workingEmp,
                        position: chain[i]
                    });
                }
            }
            
            this.currentChains.push(currentChainState);
        });
        
        console.log('Созданы новые цепочки:', this.chains);
    },
    
    rotateExistingChains() {
        this.currentChains = this.currentChains.map(chain => {
            if (chain.length === 0) return chain;
            
            const newChain = [];
            
            // Сдвигаем цепочку
            for (let i = 0; i < chain.length; i++) {
                const nextIndex = (i + 1) % chain.length;
                newChain.push({
                    employee: chain[i].employee,
                    position: chain[nextIndex].position
                });
            }
            
            return newChain;
        });
        
        console.log('Цепочки сдвинуты:', this.currentChains);
    },
    
    getAllAssignments() {
        const assignments = {};
        
        this.currentChains.forEach(chain => {
            chain.forEach(link => {
                if (link.employee && link.position && !link.position.isRest) {
                    assignments[link.employee.id] = link.position;
                }
            });
        });
        
        return assignments;
    },
    
    getRestingEmployees() {
        const resting = [];
        
        this.currentChains.forEach(chain => {
            chain.forEach(link => {
                if (link.position && link.position.isRest) {
                    resting.push(link.employee);
                }
            });
        });
        
        return resting;
    }
};
