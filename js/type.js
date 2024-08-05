let currentEditTypeElement = null;
let currentEditTypeName = null;

function createTypeElement(typeName, typeColor, periods = []) {
    const newType = document.createElement('div');
    newType.className = 'types';

    const menuId = 'menu-' + typeName.replace(/\s+/g, '-').toLowerCase();

    newType.innerHTML = `
        <div>${typeName}</div>
        <img alt="ellipsis" src="img/ellipsis.svg" style="width: 25px;" onclick="toggleMenu(event, '${menuId}')">
        <div id="${menuId}" class="context-menu">
            <div data-type-name="${typeName}" data-type-color="${typeColor}" data-periods='${JSON.stringify(periods)}' onclick="editType(event)">Edit</div>
            <hr>
            <div onclick="deleteType(event)">Delete</div>
        </div>
    `;

    document.getElementById('type-container').appendChild(newType);
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

    if (typeName && typeColor) {
        if (currentEditTypeElement) {
            currentEditTypeElement.querySelector('div').textContent = typeName;
            const contextMenu = currentEditTypeElement.querySelector('.context-menu');
            contextMenu.querySelector('[onclick="editType(event)"]').setAttribute('data-type-name', typeName);
            contextMenu.querySelector('[onclick="editType(event)"]').setAttribute('data-type-color', typeColor);
            contextMenu.querySelector('[onclick="editType(event)"]').setAttribute('data-periods', JSON.stringify(periods));

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
                    }
                })
                .catch(error => console.error('Error updating type:', error));

            currentEditTypeElement = null;
            currentEditTypeName = null;
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

        document.getElementById('setting').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        clearPeriods();
    }
});

function toggleMenu(event, menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const menus = document.querySelectorAll('.context-menu');
    if (!menus.length) return;

    menus.forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });

    menu.classList.toggle('show');
    event.stopPropagation();
}

document.addEventListener('click', function() {
    const menus = document.querySelectorAll('.context-menu');
    if (!menus.length) return;

    menus.forEach(menu => {
        menu.classList.remove('show');
    });
});

function editType(event) {
    const typeElement = event.target;
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

    currentEditTypeElement = typeElement.closest('.types');
    currentEditTypeName = typeName;
    event.stopPropagation();
}

function deleteType(event) {
    const typeElement = event.target.closest('.types');
    const typeName = typeElement.querySelector('div').textContent;

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