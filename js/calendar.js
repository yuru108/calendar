let isMonthView = true; // Flag to check if the calendar is showing months or year view
let isDecadeView = false; // Flag to check if the calendar is showing decade view

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
        if (day <= daysInMonth) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.textContent = day;
            daysContainer.appendChild(dayCell);
        } else {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            daysContainer.appendChild(emptyCell);
        }
    }

    showWeekdays();
}

function generateYearView(year) {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    months.forEach((month, index) => {
        const monthCell = document.createElement('div');
        monthCell.classList.add('month');
        monthCell.textContent = month;
        monthCell.addEventListener('click', () => {
            currentMonth = index;
            isMonthView = true;
            isDecadeView = false;
            updateCalendarTitle(currentYear, currentMonth);
            generateCalendar(currentYear, currentMonth);
        });
        daysContainer.appendChild(monthCell);
    });

    hideWeekdays();
}

function generateDecadeView(startYear) {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        if (i < 10) {
            const year = startYear + i;
            const yearCell = document.createElement('div');
            yearCell.classList.add('month');
            yearCell.textContent = `${year}年`;
            yearCell.addEventListener('click', () => {
                currentYear = year;
                isDecadeView = false;
                updateYearTitle(currentYear);
                generateYearView(currentYear);
            });
            daysContainer.appendChild(yearCell);
        } else {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('month');
            daysContainer.appendChild(emptyCell);
        }
    }

    hideWeekdays();
}

function updateCalendarTitle(year, month) {
    document.getElementById('title').textContent = `${year}年${month + 1}月`;
}

function updateYearTitle(year) {
    document.getElementById('title').textContent = `${year}年`;
}

function updateDecadeTitle(startYear) {
    document.getElementById('title').textContent = `${startYear}-${startYear + 9}年`;
}

function hideWeekdays() {
    document.getElementById('weekday').style.display = 'none';
    document.getElementById('separator').style.display = 'none';
}

function showWeekdays() {
    document.getElementById('weekday').style.display = 'flex';
    document.getElementById('separator').style.display = 'block';
}

const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let startDecadeYear = currentYear - (currentYear % 10);

updateCalendarTitle(currentYear, currentMonth);
generateCalendar(currentYear, currentMonth);

document.getElementById('prev').addEventListener('click', () => {
    if (isMonthView) {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendarTitle(currentYear, currentMonth);
        generateCalendar(currentYear, currentMonth);
    } else if (isDecadeView) {
        startDecadeYear -= 10;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    } else {
        currentYear--;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (isMonthView) {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendarTitle(currentYear, currentMonth);
        generateCalendar(currentYear, currentMonth);
    } else if (isDecadeView) {
        startDecadeYear += 10;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    } else {
        currentYear++;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
    }
});

document.getElementById('title').addEventListener('click', () => {
    if (isMonthView) {
        isMonthView = false;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
    } else if (!isDecadeView) {
        isDecadeView = true;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    }
});