// DOM Elements
const personFilter = document.getElementById('person-filter');
const platformFilter = document.getElementById('platform-filter');
const statusFilter = document.getElementById('status-filter');
const resetBtn = document.getElementById('reset-btn');
const tableBody = document.querySelector('tbody');
const totalTasksCount = document.getElementById('total-tasks-count');
const completedTasksCount = document.getElementById('completed-tasks-count');
const pendingTasksCount = document.getElementById('pending-tasks-count');
const dueTasksCount = document.getElementById('due-tasks-count');

// Functions to handle tasks
function updateTaskStatus() {
    const tableRows = document.querySelectorAll('tbody tr');
    let completedCount = 0;
    let pendingCount = 0;
    let dueCount = 0;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    tableRows.forEach(row => {
        const checkbox = row.querySelector('.task-checkbox');
        const timeCell = row.dataset.time;
        
        row.classList.remove('due-task');

        if (checkbox.checked) {
            completedCount++;
        } else {
            pendingCount++;
            if (timeCell && !isNaN(parseInt(timeCell.split(':')[0]))) {
                const [timeHours, timeMinutes] = timeCell.split(':').map(Number);
                const taskTimeInMinutes = timeHours * 60 + timeMinutes;
                if (currentTime > taskTimeInMinutes) {
                    row.classList.add('due-task');
                    dueCount++;
                }
            }
        }
    });

    totalTasksCount.textContent = tableRows.length;
    completedTasksCount.textContent = completedCount;
    pendingTasksCount.textContent = pendingCount;
    dueTasksCount.textContent = dueCount;
}

function filterTable() {
    const selectedPerson = personFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedStatus = statusFilter.value;

    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        const personData = row.dataset.person;
        const platformData = row.dataset.platform;
        const checkbox = row.querySelector('.task-checkbox');

        let statusData = 'Pending';
        if (checkbox.checked) {
            statusData = 'Completed';
        } else if (row.classList.contains('due-task')) {
            statusData = 'Due';
        }

        const personMatch = selectedPerson === '' || personData.toLowerCase().includes(selectedPerson.toLowerCase());
        const platformMatch = selectedPlatform === '' || platformData.toLowerCase().includes(selectedPlatform.toLowerCase());
        const statusMatch = selectedStatus === '' || statusData.toLowerCase() === selectedStatus.toLowerCase();

        if (personMatch && platformMatch && statusMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function resetCheckboxesAndStorage() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    localStorage.removeItem('tasks');
    updateTaskStatus();
    filterTable();
}

function saveState() {
    const tasks = [];
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        tasks.push(checkbox.checked);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadState() {
    const savedState = localStorage.getItem('tasks');
    if (savedState) {
        const tasks = JSON.parse(savedState);
        document.querySelectorAll('.task-checkbox').forEach((checkbox, index) => {
            if (tasks[index] !== undefined) {
                checkbox.checked = tasks[index];
            }
        });
    }
}

function setupMidnightReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
        resetCheckboxesAndStorage();
        setInterval(resetCheckboxesAndStorage, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateTaskStatus();
    filterTable();
    setupMidnightReset();
    
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateTaskStatus();
            filterTable();
            saveState();
        });
    });

    personFilter.addEventListener('change', filterTable);
    platformFilter.addEventListener('change', filterTable);
    statusFilter.addEventListener('change', filterTable);
    resetBtn.addEventListener('click', () => {
        personFilter.value = '';
        platformFilter.value = '';
        statusFilter.value = '';
        filterTable();
    });
});