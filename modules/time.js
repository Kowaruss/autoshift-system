const timeModule = {
    currentTime: { hour: 8, minute: 0 },
    currentShift: 0,
    
    resetTime() {
        this.currentTime = { hour: 8, minute: 0 };
        this.currentShift = 0;
        this.updateCurrentTimeDisplay();
    },
    
    updateCurrentTimeDisplay() {
        const timeDisplay = document.getElementById('currentTime');
        const minuteStr = this.currentTime.minute.toString().padStart(2, '0');
        timeDisplay.textContent = `Текущее время: ${this.currentTime.hour}:${minuteStr}`;
    },
    
    moveToNextTime() {
        this.currentTime.minute += 20;
        if (this.currentTime.minute >= 60) {
            this.currentTime.minute = 0;
            this.currentTime.hour += 1;
        }
        
        if (this.currentTime.hour >= 10) {
            this.currentTime.hour = 8;
            this.currentTime.minute = 0;
        }
        
        this.updateCurrentTimeDisplay();
        this.currentShift++;
    },
    
    getCurrentTimeInterval() {
        const hourIndex = this.currentTime.hour - 8;
        const minuteIndex = this.currentTime.minute / 20;
        return hourIndex * 3 + minuteIndex;
    }
};
