let currentEditTypeElement = null;
let currentEditTypeName = null;

function createTypeElement(typeName, typeColor, periods = []) {
    const newType = document.createElement('div');
    newType.className = 'type';
    newType.setAttribute('data-type-name', typeName);
    newType.setAttribute('data-type-color', typeColor);
    newType.setAttribute('data-periods', JSON.stringify(periods));

    if(isSelectMode) {
        newType.classList.add('selectable-type');
        newType.addEventListener('click', UpdateCurrentType);
    }

    newType.innerHTML = `
        <div style="padding-right: 5px;">${typeName}</div>
        <div style="display: flex; justify-items: center;">
            <img alt="edit" src="../img/edit.svg" onclick="editType(event)" style="padding-right: 5px;">
            <img alt="delete" src="../img/delete.svg" onclick="deleteType(event)">
        </div>
    `;

    document.getElementById('type-container').appendChild(newType);
    document.dispatchEvent(new CustomEvent('typeElementCreated'));
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('../source/DataTypeList.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            lines.forEach(line => {
                const [typeName, typeColor, ...periods] = line.split(', ');
                const parsedPeriods = [];
                for (let i = 0; i < periods.length; i += 2) {
                    parsedPeriods.push([periods[i], periods[i + 1]]);
                }
                if (typeName && typeColor) {
                    createTypeElement(typeName.trim(), typeColor.trim(), parsedPeriods);
                }
            });
            document.dispatchEvent(new CustomEvent('allTypesLoaded'));
        })
        .catch(error => console.error('Error loading types:', error));
});

document.getElementById('add-type-button').addEventListener('click', function() {
    document.getElementById('setting').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('type-name').value = '';
    document.getElementById('type-color').value = '#FFFFFF';
    clearPeriods();
    addPeriod();
    currentEditTypeElement = null;
    currentEditTypeName = null;
});

document.getElementById('cancel-setting-button').addEventListener('click', function() {
    document.getElementById('setting').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    clearPeriods();
});

document.getElementById('save-setting-button').addEventListener('click', function() {
    const typeName = document.getElementById('type-name').value;
    const typeColor = document.getElementById('type-color').value;
    const periodInputs = document.querySelectorAll('#period-container .time-container');
    const periods = [];

    periodInputs.forEach((inputDiv, index) => {
        const startTime = inputDiv.querySelector(`#start-time-${index + 1}`).value;
        const endTime = inputDiv.querySelector(`#end-time-${index + 1}`).value;
        if (startTime && endTime) {
            periods.push([startTime, endTime]);
        }
    });

    if (!typeName) {
        alert('名稱不可為空。');
        return;
    }

    const typeExists = Array.from(document.querySelectorAll('.type')).some(typeElement => {
        return typeElement.getAttribute('data-type-name') === typeName && currentEditTypeName !== typeName;
    });

    if (typeExists) {
        alert('名稱已存在。');
        return;
    }

    if (periods.length === 0) {
        alert('至少需要有一個時段。');
        return;
    }

    if (typeName && typeColor) {
        if (currentEditTypeElement) {
            currentEditTypeElement.querySelector('div').textContent = typeName;
            currentEditTypeElement.setAttribute('data-type-name', typeName);
            currentEditTypeElement.setAttribute('data-type-color', typeColor);
            currentEditTypeElement.setAttribute('data-periods', JSON.stringify(periods));

            fetch('../php/saveType.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `originalType=${encodeURIComponent(currentEditTypeName)}&newType=${encodeURIComponent(typeName)}&typeColor=${encodeURIComponent(typeColor)}&periods=${encodeURIComponent(JSON.stringify(periods))}`
            })
                .then(response => response.text())
                .then(data => {
                    if (data !== 'Type updated successfully') {
                        console.error('Error updating type:', data);
                    } else {
                        console.log(data);
                        currentEditTypeElement = null;
                        currentEditTypeName = null;
                    }
                })
                .catch(error => console.error('Error updating type:', error));
        } else {
            createTypeElement(typeName, typeColor, periods);

            fetch('../php/saveType.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `newType=${encodeURIComponent(typeName)}&typeColor=${encodeURIComponent(typeColor)}&periods=${encodeURIComponent(JSON.stringify(periods))}`
            })
                .then(response => response.text())
                .then(data => {
                    if (data !== 'Type saved successfully') {
                        console.error('Error saving type:', data);
                    } else {
                        console.log(data);
                    }
                })
                .catch(error => console.error('Error saving type:', error));
        }
        document.getElementById('current-type-name').textContent = '名稱：' + typeName;
        document.getElementById('current-type-color').style.backgroundColor = typeColor;
        document.getElementById('setting').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        clearPeriods();
        generateCalendar(currentYear, currentMonth);
    }
});

function editType(event) {
    const typeElement = event.target.closest('.type');
    const typeName = typeElement.getAttribute('data-type-name');
    const typeColor = typeElement.getAttribute('data-type-color');
    const periods = JSON.parse(typeElement.getAttribute('data-periods'));

    document.getElementById('setting').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('type-name').value = typeName;
    document.getElementById('type-color').value = typeColor;

    clearPeriods();
    periods.forEach((period, index) => {
        addPeriod(period[0], period[1], index + 1);
    });

    currentEditTypeElement = typeElement;
    currentEditTypeName = typeName;

    event.stopPropagation();
}

function deleteType(event) {
    const typeElement = event.target.closest('.type');
    const typeName = typeElement.getAttribute('data-type-name');

    if (confirm(`確定要刪除 "${typeName}" 嗎？`)) {
        fetch('../php/deleteType.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'typeName=' + encodeURIComponent(typeName)
        })
            .then(response => response.text())
            .then(data => {
                if (data === 'Type deleted successfully') {
                    typeElement.remove();
                    console.log(data);
                    generateCalendar(currentYear, currentMonth);
                } else {
                    console.error('Error deleting type:', data);
                }
            })
            .catch(error => console.error('Error deleting type:', error));
    }
    event.stopPropagation();
}

function addPeriod(startTime = '', endTime = '', index = 1) {
    const periodContainer = document.getElementById('period-container');
    const periodDiv = document.createElement('div');
    periodDiv.className = 'period';
    periodDiv.innerHTML = `
        <div class="period-title"">時段<img id="delete" alt="delete" src="img/delete.svg"></div>
        <div class="time-container" style="margin: 10px; padding: 0 5px; border-left: 2px solid #393939;">
            <div>
                <label for="start-time-${index}">開始時間</label>
                <input type="text" id="start-time-${index}" class="text-input start-time" value="${startTime}" style="width: 65%;">
            </div>
            <div>
                <label for="end-time-${index}">結束時間</label>
                <input type="text" id="end-time-${index}" class="text-input end-time" value="${endTime}" style="width: 65%;">
            </div>
        </div>
    `;
    periodContainer.appendChild(periodDiv);

    const deleteButton = periodDiv.querySelector('#delete');
    deleteButton.addEventListener('click', function() {
        periodDiv.remove();
    });
}

document.getElementById('add-period-button').addEventListener('click', function() {
    const periodsCount = document.querySelectorAll('#period-container .period').length;
    addPeriod('', '', periodsCount + 1);
});

function clearPeriods() {
    const periodContainer = document.getElementById('period-container');
    periodContainer.innerHTML = '';
}