const pitsModule = {
    pits: [],
    totalPits: 5,
    tablesPerPit: 5,
    
    init() {
        this.generatePitsConfiguration();
    },
    
    generatePitsConfiguration() {
        const container = document.getElementById('pitsContainer');
        container.innerHTML = '';
        
        this.pits = [];
        
        for (let pit = 1; pit <= this.totalPits; pit++) {
            const pitDiv = document.createElement('div');
            pitDiv.className = 'pit';
            pitDiv.innerHTML = `
                <div class="pit-config-row">
                    <strong>Пит ${pit}:</strong>
                    <label>
                        <input type="checkbox" id="pit${pit}Active" checked 
                               onchange="pitsModule.togglePit(${pit})"> Активен
                    </label>
                </div>
                <div id="tablesPit${pit}">
                    ${this.generateTablesConfiguration(pit)}
                </div>
            `;
            container.appendChild(pitDiv);
            
            this.pits.push({
                id: pit,
                active: true,
                tables: Array.from({length: this.tablesPerPit}, (_, i) => ({
                    id: i + 1,
                    dealer: true,
                    inspector: true
                }))
            });
        }
    },
    
    generateTablesConfiguration(pitNumber) {
        let html = '';
        for (let table = 1; table <= this.tablesPerPit; table++) {
            html += `
                <div class="table-config-row">
                    Стол ${table}:
                    <div class="position-checkbox">
                        <label>
                            <input type="checkbox" id="pit${pitNumber}table${table}dealer" checked 
                                   onchange="pitsModule.updateTableConfig(${pitNumber}, ${table}, 'dealer', this.checked)"> Дилер
                        </label>
                        <label>
                            <input type="checkbox" id="pit${pitNumber}table${table}inspector" checked 
                                   onchange="pitsModule.updateTableConfig(${pitNumber}, ${table}, 'inspector', this.checked)"> Инспектор
                        </label>
                    </div>
                </div>
            `;
        }
        return html;
    },
    
    togglePit(pitNumber) {
        const isActive = document.getElementById(`pit${pitNumber}Active`).checked;
        const tablesDiv = document.getElementById(`tablesPit${pitNumber}`);
        
        this.pits[pitNumber - 1].active = isActive;
        tablesDiv.style.display = isActive ? 'block' : 'none';
    },
    
    updateTableConfig(pitNumber, tableNumber, position, isActive) {
        this.pits[pitNumber - 1].tables[tableNumber - 1][position] = isActive;
    },
    
    getActivePositions() {
        const positions = [];
        
        this.pits.forEach(pit => {
            if (pit.active) {
                pit.tables.forEach(table => {
                    if (table.dealer) {
                        positions.push({ 
                            pit: pit.id, 
                            table: table.id, 
                            position: 'Д',
                            fullName: `Д${pit.id}.${table.id}`,
                            type: 'dealer'
                        });
                    }
                    if (table.inspector) {
                        positions.push({ 
                            pit: pit.id, 
                            table: table.id, 
                            position: 'И',
                            fullName: `И${pit.id}.${table.id}`,
                            type: 'inspector'
                        });
                    }
                });
            }
        });
        
        return positions;
    }
};
