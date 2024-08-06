let isMonthView = false;
let isDecadeView = false;
let isSelectMode = false;
let selectedDates = [];
let selectedType = '';

document.addEventListener('DOMContentLoaded', function() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    document.addEventListener('allTypesLoaded', function() {
        generateCalendar(currentYear, currentMonth);
    });
});

function generateCalendar(year, month) {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    fetch(`../source/DateList/${year}.txt`, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found or unable to fetch');
            }
            return response.text();
        })
        .then(data => {
            const lines = data.trim().split('\n');
            const monthData = lines[month].split(',').map(item => item.trim());

            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('day');
                daysContainer.appendChild(emptyCell);
            }

            for (let day = 1; day <= (42 - firstDay); day++) {
                if (day <= daysInMonth) {
                    const dayCell = document.createElement('div');
                    dayCell.classList.add('day');
                    const type = monthData[day - 1];
                    if (type) {
                        dayCell.classList.add('type-day');
                        const color = getColorForType(type);
                        dayCell.style.setProperty('--type-background-color', color);
                    }
                    if (isSelectMode) {
                        dayCell.classList.add('selectable');
                        dayCell.addEventListener('click', () => selectDate(year, month, day));
                    }
                    dayCell.textContent = day;
                    daysContainer.appendChild(dayCell);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.classList.add('day');
                    daysContainer.appendChild(emptyCell);
                }
            }
            if(isSelectMode) {
                updateSelectedDatesDisplay();
                updateSelectAll();
            }
            showWeekdays();
        })
        .catch(error => {
            console.error('Error loading types:', error);
            // If there's an error, generate the calendar without Types
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('day');
                daysContainer.appendChild(emptyCell);
            }

            for (let day = 1; day <= (42 - firstDay); day++) {
                if (day <= daysInMonth) {
                    const dayCell = document.createElement('div');
                    dayCell.classList.add('day');
                    if (isSelectMode) {
                        dayCell.classList.add('selectable');
                        dayCell.addEventListener('click', () => selectDate(year, month, day));
                    }
                    dayCell.textContent = day;
                    daysContainer.appendChild(dayCell);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.classList.add('day');
                    daysContainer.appendChild(emptyCell);
                }
            }
            showWeekdays();
        });
}

function getColorForType(typeName) {
    const typeElements = document.querySelectorAll('.type');
    let color = 'orange';

    typeElements.forEach(typeElement => {
        const name = typeElement.getAttribute('data-type-name');
        const typeColor = typeElement.getAttribute('data-type-color');

        if (name === typeName) {
            color = typeColor;
            return color;
        }
    });
    return color;
}

function generateYearView() {
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    months.forEach((month, index) => {
        const monthCell = document.createElement('div');
        monthCell.classList.add('month');
        monthCell.textContent = month;
        monthCell.addEventListener('click', () => {
            currentMonth = index;
            isMonthView = false;
            isDecadeView = false;
            updateCalendarTitle(currentYear, currentMonth);
            generateCalendar(currentYear, currentMonth);
            document.getElementById('select-mode-buttons').style.display = 'flex';
            document.getElementById('select-all').style.display = 'flex';
            document.getElementById('current-type').style.display = 'block';
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
    if (isSelectMode && selectedDates.length > 0) {
        const confirmation = confirm('點擊後將會清空目前所選的選項，是否繼續？');
        if (!confirmation) {
            return;
        } else {
            selectedDates = [];
        }
    }
    if (isMonthView) {
        currentYear--;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
    } else if (isDecadeView) {
        startDecadeYear -= 10;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    } else {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendarTitle(currentYear, currentMonth);
        generateCalendar(currentYear, currentMonth);
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (isSelectMode && selectedDates.length > 0) {
        const confirmation = confirm('點擊後將會清空目前所選的選項，是否繼續？');
        if (!confirmation) {
            return;
        } else {
            selectedDates = [];
        }
    }
    if (isMonthView) {
        currentYear++;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
    } else if (isDecadeView) {
        startDecadeYear += 10;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    } else {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendarTitle(currentYear, currentMonth);
        generateCalendar(currentYear, currentMonth);
    }
});

document.getElementById('title').addEventListener('click', () => {
    if (isSelectMode && selectedDates.length > 0) {
        const confirmation = confirm('點擊後將會清空目前所選的選項，是否繼續？');
        if (!confirmation) {
            return;
        } else {
            selectedDates = [];
        }
    }
    if (!isMonthView) {
        isMonthView = true;
        updateYearTitle(currentYear);
        generateYearView(currentYear);
        document.getElementById('select-mode-buttons').style.display = 'none';
        document.getElementById('select-all').style.display = 'none';
        document.getElementById('current-type').style.display = 'none';
    } else if (!isDecadeView) {
        isDecadeView = true;
        updateDecadeTitle(startDecadeYear);
        generateDecadeView(startDecadeYear);
    }
});

document.getElementById('view-button').addEventListener('click', function () {
    if (isSelectMode && selectedDates.length > 0) {
        const confirmation = confirm('點擊後將會清空目前所選的選項，是否繼續？');
        if (!confirmation) {
            return;
        }
    }
    isSelectMode = false;
    selectedDates = [];
    selectedType = '';
    document.getElementById('select-all').style.display = 'none';
    document.getElementById('current-type').style.display = 'none'
    document.getElementById('current-type-name').textContent = '名稱：';
    document.getElementById('current-type-color').style.backgroundColor = 'rgba(0, 0, 0, 0)';
    document.getElementById('select-button').style.backgroundColor = 'rgba(0, 0, 0, 0)';
    document.getElementById('view-button').style.backgroundColor = 'rgba(0, 0, 0, 0.3)';

    const typeElements = document.querySelectorAll('.type');
    typeElements.forEach(typeElement => {
        typeElement.classList.remove('selectable-type');
        typeElement.classList.remove('selected-type');
        typeElement.removeEventListener('click', UpdateCurrentType);
    });

    generateCalendar(currentYear, currentMonth);
});

document.getElementById('select-button').addEventListener('click', function () {
    isSelectMode = true;
    document.getElementById('select-all').style.display = 'flex';
    document.getElementById('current-type').style.display = 'block';
    document.getElementById('select-button').style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    document.getElementById('view-button').style.backgroundColor = 'rgba(0, 0, 0, 0)'

    const typeElements = document.querySelectorAll('.type');
    typeElements.forEach(typeElement => {
        typeElement.classList.add('selectable-type');
        typeElement.addEventListener('click', UpdateCurrentType);
    });

    generateCalendar(currentYear, currentMonth);
});

function UpdateCurrentType(event) {
    const selectedElement = event.currentTarget;

    const typeElements = document.querySelectorAll('.selectable-type');
    typeElements.forEach(typeElement => {
        typeElement.classList.remove('selected-type');
    });

    selectedElement.classList.add('selected-type');
    const typeName = selectedElement.getAttribute('data-type-name');
    const typeColor = selectedElement.getAttribute('data-type-color');

    document.getElementById('current-type-name').textContent = '名稱：' + typeName;
    document.getElementById('current-type-color').style.backgroundColor = typeColor;

    selectedType = typeName;
}

function selectDate(year, month, day) {
    const date = new Date(year, month, day);
    const dateString = formatDateToYYYYMMDD(date);
    const dateIndex = selectedDates.indexOf(dateString);
    if (dateIndex === -1) {
        selectedDates.push(dateString);
    } else {
        selectedDates.splice(dateIndex, 1);
    }
    updateSelectedDatesDisplay();
    updateSelectAll();
}

function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateSelectedDatesDisplay() {
    const dayCells = document.querySelectorAll('.day.selectable');
    dayCells.forEach(cell => {
        const date = new Date(currentYear, currentMonth, parseInt(cell.textContent));
        const dateString = formatDateToYYYYMMDD(date);
        if (selectedDates.includes(dateString)) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });
}

function updateSelectAll() {
    const days = document.querySelectorAll('.day.selectable');
    const selectedDays = document.querySelectorAll('.day.selected');
    const selectIcon = document.getElementById('select-all-button');

    if (days.length === selectedDays.length) {
        selectIcon.alt = 'select';
        selectIcon.src = 'img/select.svg';
    } else {
        selectIcon.alt = 'unselect';
        selectIcon.src = 'img/unselect.svg';
    }
}

document.getElementById('select-all-button').addEventListener('click', function () {
    const selectIcon = document.getElementById('select-all-button');
    if (selectIcon.alt === 'unselect') {
        const dayCells = document.querySelectorAll('.day.selectable');
        dayCells.forEach(cell => {
            if (!cell.classList.contains('selected')) {
                cell.click();
            }
        });
    } else {
        const dayCells = document.querySelectorAll('.day.selectable');
        dayCells.forEach(cell => {
            if (cell.classList.contains('selected')) {
                cell.click();
            }
        });
    }
    updateSelectAll()
});

document.getElementById('cancel-select-button').addEventListener('click', function () {
    document.getElementById('current-type-name').textContent = '名稱：';
    document.getElementById('current-type-color').style.backgroundColor = 'rgba(0, 0, 0, 0)';

    const dayCells = document.querySelectorAll('.day.selectable');
    dayCells.forEach(cell => {
        cell.classList.remove('selected');
    });
    const typeElements = document.querySelectorAll('.selectable-type');
    typeElements.forEach(typeElement => {
        typeElement.classList.remove('selected-type');
    });

    selectedDates = [];
    selectedType = '';
});

document.getElementById('save-select-button').addEventListener('click', function () {
    if (isSelectMode) {
        const data = {
            selectedDates: selectedDates,
            selectedType: selectedType
        };

        fetch('../php/updateDateList.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(updatedData => {
                console.log('Updated data:', updatedData);
                selectedDates = [];
                generateCalendar(currentYear, currentMonth);

                alert('儲存成功！');
            })
            .catch(error => console.error('Error:', error));
    }
});