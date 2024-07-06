let tasks = [];

function handleTimerTypeChange() {
    const timerType = document.getElementById('timerType').value;
    const taskTimeInput = document.getElementById('taskTime');
    const reminderTimeInput = document.getElementById('reminderTime');

    if (timerType === 'countdown') {
        taskTimeInput.style.display = 'block';
        reminderTimeInput.style.display = 'none';
    } else if (timerType === 'reminder') {
        taskTimeInput.style.display = 'none';
        reminderTimeInput.style.display = 'block';
    } else {
        taskTimeInput.style.display = 'none';
        reminderTimeInput.style.display = 'none';
    }
}

function addTask() {
    const taskTitle = document.getElementById('taskTitle').value;
    const taskTime = document.getElementById('taskTime').value;
    const reminderTime = document.getElementById('reminderTime').value;
    const timerType = document.getElementById('timerType').value;

    if (taskTitle) {
        const newTask = {
            id: Date.now(),
            title: taskTitle,
            time: taskTime ? taskTime * 60 : null,
            isCompleted: false,
            timer: taskTime ? taskTime * 60 : null, // convert to seconds
            intervalId: null,
            timerType: timerType,
            reminderTime: reminderTime ? new Date(reminderTime) : null
        };
        tasks.push(newTask);
        renderTasks();
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskTime').value = '';
        document.getElementById('reminderTime').value = '';
        document.getElementById('timerType').value = 'none';
        handleTimerTypeChange();
    }
}

function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    task.isCompleted = !task.isCompleted;
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

function startTimer(id) {
    const task = tasks.find(task => task.id === id);
    if (task.intervalId) {
        clearInterval(task.intervalId);
        task.intervalId = null;
    } else {
        task.intervalId = setInterval(() => {
            if (task.timerType === 'countdown' && task.timer > 0) {
                task.timer--;
            } else if (task.timerType === 'stopwatch') {
                task.timer++;
            } else if (task.timerType === 'countdown' && task.timer === 0) {
                clearInterval(task.intervalId);
                task.intervalId = null;
                task.isCompleted = true;
                showNotification(task.title);
            }
            renderTasks();
        }, 1000);
    }
}

function showNotification(taskTitle) {
    if (Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: `${taskTitle} is due!`
        });
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = task.isCompleted ? 'completed' : '';
        taskItem.innerHTML = `
            <span>${task.title}</span>
            <div>
                ${task.timerType === 'countdown' ? `<span class="timer">${formatTime(task.timer)}</span>` : ''}
                ${task.timerType === 'reminder' ? `<span class="timer">${task.reminderTime.toLocaleString()}</span>` : ''}
                <button onclick="startTimer(${task.id})"><i class="fas fa-play"></i></button>
                <button onclick="toggleTaskCompletion(${task.id})"><i class="fas fa-check"></i></button>
                <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(taskItem);

        if (task.timerType === 'reminder' && !task.isCompleted && task.reminderTime <= new Date()) {
            task.isCompleted = true;
            showNotification(task.title);
        }
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    renderTasks();
});