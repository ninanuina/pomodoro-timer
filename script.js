// ------- TIMER SETTINGS -------
let MODES = {
  pomodoro: 40 * 60,
  short: 10 * 60,
  long: 20 * 60
};

let currentMode = "pomodoro";
let timeLeft = MODES[currentMode];
let timer = null;
let totalTracked = 0;

// Elements
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const modeBtns = document.querySelectorAll(".modes button");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const doneList = document.getElementById("doneList");
const toggleDone = document.getElementById("toggleDone");
const trackedEl = document.getElementById("tracked");
const resetTracked = document.getElementById("resetTracked");

// Ambient sounds
const sounds = {
  cafe: new Audio("https://gdurl.com/28Ur"),
  rain: new Audio("https://gdurl.com/sWXh"),
  library: new Audio("/https://gdurl.com/iWgR")
};
Object.values(sounds).forEach(a => a.loop = true);

// Load tasks
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// ------- FUNCTIONS -------
function updateTime() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timeEl.textContent = `${min}:${sec.toString().padStart(2,"0")}`;
}

function switchMode(mode) {
  currentMode = mode;
  timeLeft = MODES[mode];
  clearInterval(timer);
  timer = null;
  startBtn.textContent = "Start";
  modeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  updateTime();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  doneList.innerHTML = "";

  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    // Active checkbox
    const select = document.createElement("input");
    select.type = "checkbox";
    select.checked = task.selected;
    select.onchange = () => {
      task.selected = select.checked;
      saveTasks();
    };

    // Complete checkbox
    const complete = document.createElement("input");
    complete.type = "checkbox";
    complete.checked = task.completed;
    complete.onchange = () => {
      task.completed = complete.checked;
      if(complete.checked) task.selected = false;
      saveTasks();
      renderTasks();
    };

    // Text
    const span = document.createElement("span");
    span.textContent = task.text;

    // Delete button
    const del = document.createElement("button");
    del.textContent = "🗑";
    del.className = "delete";
    del.onclick = () => {
      tasks.splice(i,1);
      saveTasks();
      renderTasks();
    };

    if(task.completed) {
      doneList.appendChild(li);
      li.append(span, del);
    } else {
      taskList.appendChild(li);
      li.append(select, complete, span);
    }
  });
}

// ------- EVENT LISTENERS -------
modeBtns.forEach(btn => btn.addEventListener("click", () => switchMode(btn.dataset.mode)));

startBtn.onclick = () => {
  if(timer){
    clearInterval(timer);
    timer = null;
    startBtn.textContent = "Start";
  } else {
    timer = setInterval(()=>{
      timeLeft--;
      totalTracked++;
      trackedEl.textContent = Math.floor(totalTracked/60);
      updateTime();
      if(timeLeft<=0){
        clearInterval(timer);
        timer=null;
        alert("Time’s up!");
      }
    },1000);
    startBtn.textContent = "Pause";
  }
};

resetBtn.onclick = () => switchMode(currentMode);

addTaskBtn.onclick = () => {
  if(!taskInput.value.trim()) return;
  tasks.push({text: taskInput.value, selected:false, completed:false});
  taskInput.value="";
  saveTasks();
  renderTasks();
};

// Collapse done list
toggleDone.onclick = () => {
  if(doneList.style.display==="none") {
    doneList.style.display="block";
    toggleDone.textContent="Hide Completed Tasks";
  } else {
    doneList.style.display="none";
    toggleDone.textContent="Show Completed Tasks";
  }
};

resetTracked.onclick = () => {
  totalTracked = 0;
  trackedEl.textContent="0";
};

// Load initial state
updateTime();
renderTasks();
trackedEl.textContent=Math.floor(totalTracked/60);