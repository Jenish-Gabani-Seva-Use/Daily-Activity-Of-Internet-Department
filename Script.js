// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const personFilter = document.getElementById('person-filter');
    const platformFilter = document.getElementById('platform-filter');
    const statusFilter = document.getElementById('status-filter');
    const resetBtn = document.getElementById('reset-btn');
    const tableRows = document.querySelectorAll('tbody tr');
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const overdueTasksEl = document.getElementById('overdue-tasks');
    const teamMembersEl = document.getElementById('team-members');
    const lastResetEl = document.getElementById('last-reset');
    
    // Initialize counts
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;
    const uniquePersons = new Set();
    
    // Initialize last reset time
    const lastReset = localStorage.getItem('lastReset');
    if (lastResetEl) {
        if (lastReset) {
            lastResetEl.textContent = new Date(parseInt(lastReset)).toLocaleString();
        } else {
            lastResetEl.textContent = 'Never';
        }
    }
    
    // Initialize checkbox states
    function initializeCheckboxes() {
        checkboxes.forEach(checkbox => {
            const taskId = checkbox.dataset.task;
            const savedState = localStorage.getItem(`task-${taskId}`);
            
            if (savedState === 'true') {
                checkbox.checked = true;
            }
        });
    }
    
    // Update stats function
    function updateStats() {
        completedTasks = 0;
        pendingTasks = 0;
        overdueTasks = 0;
        
        // Get current time
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHours * 60 + currentMinutes;
        
        // Count tasks
        tableRows.forEach(row => {
            const checkbox = row.querySelector('.task-checkbox');
            if (checkbox) {
                const taskTime = row.dataset.time;
                if (taskTime && taskTime.includes(':')) { // Ensure taskTime is in a valid format
                    const [hours, minutes] = taskTime.split(':').map(Number);
                    const taskTimeInMinutes = hours * 60 + minutes;
                    
                    if (checkbox.checked) {
                        completedTasks++;
                    } else {
                        pendingTasks++;
                        
                        // Check if task is overdue
                        if (currentTime > taskTimeInMinutes) {
                            overdueTasks++;
                            row.classList.add('overdue');
                        } else {
                            row.classList.remove('overdue');
                        }
                    }
                }
            }
        });
        
        // Update DOM
        totalTasksEl.textContent = totalTasks;
        completedTasksEl.textContent = completedTasks;
        pendingTasksEl.textContent = pendingTasks;
        overdueTasksEl.textContent = overdueTasks;
    }
    
    // Count unique persons
    function countUniquePersons() {
        tableRows.forEach(row => {
            const personTags = row.querySelectorAll('.person-tag');
            personTags.forEach(tag => {
                uniquePersons.add(tag.textContent.trim());
            });
        });
        teamMembersEl.textContent = uniquePersons.size;
    }
    
    // Filter functionality
    function filterTable() {
        const selectedPerson = personFilter.value;
        const selectedPlatform = platformFilter.value;
        const selectedStatus = statusFilter.value;
        
        tableRows.forEach(row => {
            const personCell = row.querySelector('.person-cell');
            const platformCell = row.querySelector('.platform-cell');
            const checkbox = row.querySelector('.task-checkbox');
            
            const persons = personCell ? personCell.textContent.toLowerCase() : '';
            const platform = platformCell ? platformCell.dataset.platform.toLowerCase() : '';
            const status = checkbox ? (checkbox.checked ? 'completed' : 'pending') : '';
            
            const personMatch = selectedPerson === '' || persons.includes(selectedPerson.toLowerCase());
            const platformMatch = selectedPlatform === '' || platform.includes(selectedPlatform.toLowerCase());
            
            let statusMatch = true;
            if (selectedStatus === 'completed') {
                statusMatch = status === 'completed';
            } else if (selectedStatus === 'pending') {
                statusMatch = status === 'pending';
            } else if (selectedStatus === 'overdue') {
                statusMatch = row.classList.contains('overdue');
            }
            
            if (personMatch && platformMatch && statusMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Reset at midnight
    function resetAtMidnight() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Next midnight
        
        const timeUntilMidnight = midnight - now;
        
        setTimeout(() => {
            // Reset all checkboxes
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                const taskId = checkbox.dataset.task;
                localStorage.removeItem(`task-${taskId}`);
            });
            
            // Update last reset time
            const resetTime = new Date().getTime();
            localStorage.setItem('lastReset', resetTime);
            if (lastResetEl) lastResetEl.textContent = new Date(resetTime).toLocaleString();
            
            // Update stats
            updateStats();
            
            // Schedule next reset
            resetAtMidnight();
        }, timeUntilMidnight);
    }
    
    // Initialize
    function init() {
        totalTasks = tableRows.length;
        initializeCheckboxes();
        updateStats();
        countUniquePersons();
        resetAtMidnight();
        
        // Add event listeners
        personFilter.addEventListener('change', filterTable);
        platformFilter.addEventListener('change', filterTable);
        statusFilter.addEventListener('change', filterTable);
        
        resetBtn.addEventListener('click', () => {
            personFilter.value = '';
            platformFilter.value = '';
            statusFilter.value = '';
            filterTable();
        });
        
        // Checkbox change events
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = this.dataset.task;
                localStorage.setItem(`task-${taskId}`, this.checked);
                updateStats();
                filterTable();
            });
        });
        
        // Add animation to rows after page load
        setTimeout(() => {
            tableRows.forEach(row => {
                row.style.opacity = '1';
            });
        }, 300);
        
        // Update due status every minute
        setInterval(updateStats, 60000);
    }
    
    // Run initialization
    init();
});