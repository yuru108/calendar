function generateCalendar(year, month) {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        daysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= 35 - firstDay; day++) {
        if(day <= daysInMonth) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.textContent = day;
            daysContainer.appendChild(dayCell);
        }
        else {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            daysContainer.appendChild(emptyCell);
        }
    }
}

function updateCalendarTitle(year, month) {
    document.getElementById('title').textContent = `${year}年${month + 1}月`;
}

const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

updateCalendarTitle(currentYear, currentMonth);
generateCalendar(currentYear, currentMonth);

document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendarTitle(currentYear, currentMonth);
    generateCalendar(currentYear, currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendarTitle(currentYear, currentMonth);
    generateCalendar(currentYear, currentMonth);
});