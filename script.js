// Elements
const taskTitle = document.getElementById("task-title");
const taskDate = document.getElementById("task-date");
const taskTime = document.getElementById("task-time");
const addTaskBtn = document.getElementById("add-task");
const tasksContainer = document.getElementById("tasks");
const timelineContainer = document.getElementById("timeline-container");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const darkToggle = document.getElementById("dark-toggle");

// Load tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  tasksContainer.innerHTML = "";
  timelineContainer.innerHTML = "";

  let doneCount = tasks.filter(t => t.done).length;
  let progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  progressFill.style.width = progress + "%";
  progressText.textContent = `${progress}% Completed`;

  tasks.forEach((task, index) => {
    // List
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${task.done ? 'done' : ''}">
        ${task.title} - ${task.date} ${task.time}
      </span>
      <div class="task-actions">
        <button onclick="markDone(${index})">✔</button>
        <button onclick="deleteTask(${index})">🗑</button>
      </div>
    `;
    tasksContainer.appendChild(li);

    // Timeline
    const timelineItem = document.createElement("div");
    timelineItem.className = "timeline-item";
    timelineItem.textContent = `${task.date} ${task.time} - ${task.title}`;
    timelineContainer.appendChild(timelineItem);

    // Reminder Check
    let taskTimeStamp = new Date(`${task.date}T${task.time}`).getTime();
    let now = Date.now();
    if (!task.done && taskTimeStamp - now < 60000 && taskTimeStamp > now) {
      showNotification(task.title);
    }
  });
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  if (!taskTitle.value || !taskDate.value || !taskTime.value) {
    alert("Please fill all fields!");
    return;
  }

  tasks.push({
    title: taskTitle.value,
    date: taskDate.value,
    time: taskTime.value,
    done: false
  });

  saveTasks();
  renderTasks();

  taskTitle.value = "";
  taskDate.value = "";
  taskTime.value = "";
});

// Mark Done
function markDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Notification
function showNotification(task) {
  if (Notification.permission === "granted") {
    new Notification("Reminder ⏰", { body: `It's time for: ${task}` });
  } else {
    Notification.requestPermission();
  }
  let audio = new Audio("notification.mp3");
  audio.play();
}


// Dark Mode Toggle
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

const suggestBtn = document.getElementById("suggest-plan");
const freeTimeInput = document.getElementById("free-time");
const suggestionsOutput = document.getElementById("suggestions-output");

suggestBtn.addEventListener("click", () => {
  let freeMinutes = parseInt(freeTimeInput.value);
  if (!freeMinutes || freeMinutes <= 0) {
    alert("Enter valid free time in minutes!");
    return;
  }

  // Get pending tasks
  let pending = tasks.filter(t => !t.done);
  if (pending.length === 0) {
    suggestionsOutput.innerHTML = "<p>🎉 No pending tasks! Enjoy your free time!</p>";
    return;
  }

  // Distribute time among tasks + breaks
  let breakTime = Math.floor(freeMinutes * 0.1); // 10% time as breaks
  let studyTime = freeMinutes - breakTime;
  let perTask = Math.floor(studyTime / pending.length);

  let plan = "<h3>📅 Suggested Plan</h3><ul>";
  pending.forEach(task => {
    plan += `<li>${task.title} — ${perTask} mins</li>`;
  });
  if (breakTime > 0) {
    plan += `<li>☕ Break — ${breakTime} mins</li>`;
  }
  plan += "</ul>";

  suggestionsOutput.innerHTML = plan;
});

// Initial
renderTasks();
