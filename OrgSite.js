document.addEventListener("DOMContentLoaded", () => {
  const events = {};

  const toggle = document.getElementById("toggle-view");
  const weekView = document.getElementById("week");
  const monthView = document.getElementById("month");
  const addBtn = document.getElementById("add-event");
  const formWrap = document.getElementById("event-form");
  const monthGrid = document.querySelector(".month-grid");
  const monthName = document.getElementById("month-name");
  const prevMonth = document.getElementById("prev-month");
  const nextMonth = document.getElementById("next-month");
  const prevWeek = document.getElementById("prev-week");
  const nextWeek = document.getElementById("next-week");
  const weekRangeDisplay = document.getElementById("week-range");
  const cancelBtn = document.getElementById("cancel-event");
  const addForm = document.getElementById("add-event-form");

  const detailOverlay = document.getElementById("event-detail-overlay");
  const detailTitle = document.getElementById("detail-title");
  const detailTime = document.getElementById("detail-time");
  const detailDesc = document.getElementById("detail-desc");
  const closeDetailBtn = document.getElementById("close-detail");
  const editBtn = document.getElementById("edit-event");
  const removeBtn = document.getElementById("remove-event");

  const nameInput = document.getElementById("event-name");
  const dateInput = document.getElementById("event-date");
  const startSelect = document.getElementById("start-hour");
  const endSelect = document.getElementById("end-hour");
  const descInput = document.getElementById("event-desc");

  let currentDate = new Date();
  let currentWeekStart = getSunday(new Date());
  let editing = null;
  let selectedEventRef = null;

  function pad(n){ return String(n).padStart(2,'0'); }
  function formatDateKey(d){
    if (typeof d === "string") return d;
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  function getSunday(d){
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    x.setHours(0,0,0,0);
    return x;
  }

  function populateHourSelects(){
    const opts = [];
    for (let i=1;i<=24;i++){
      opts.push(`<option value="${i}">${i}:00</option>`);
    }
    startSelect.innerHTML = opts.join('');
    endSelect.innerHTML = opts.join('');
    startSelect.value = 9;
    endSelect.value = 10;
  }

  function buildWeekGrid(){
    const hoursContainer = document.querySelector(".hours");
    hoursContainer.innerHTML = "";
    for (let hour = 1; hour <= 24; hour++){
      const row = document.createElement("div");
      row.className = "each-hour";
      row.dataset.hour = hour;
      for (let c = 0; c < 7; c++){
        const col = document.createElement("div");
        col.className = "day-column";
        row.appendChild(col);
      }
      hoursContainer.appendChild(row);
    }
    updateWeekHeaders(currentWeekStart);
  }

  function updateWeekHeaders(weekStart){
    const headers = document.querySelectorAll(".day-header");
    headers.forEach((h, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const opts = { weekday: "short", month: "short", day: "numeric" };
      h.textContent = d.toLocaleDateString(undefined, opts);
    });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const startOpt = { month:"short", day:"numeric" };
    const endOpt = { month:"short", day:"numeric", year:"numeric" };
    if (weekRangeDisplay) {
      weekRangeDisplay.textContent = `${weekStart.toLocaleDateString(undefined,startOpt)} - ${weekEnd.toLocaleDateString(undefined,endOpt)}`;
    }
  }

  function generateCalendar(date){
    monthGrid.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month+1, 0);
    const totalDays = lastDay.getDate();
    const firstWeekDay = firstDay.getDay();

    monthName.textContent = date.toLocaleString(undefined, { month:"long", year:"numeric" });

    for (let i=0;i<firstWeekDay;i++){
      const blank = document.createElement("div");
      blank.className = "month-cell empty";
      monthGrid.appendChild(blank);
    }

    for (let day = 1; day <= totalDays; day++){
      const cell = document.createElement("div");
      cell.className = "month-cell";
      const span = document.createElement("span");
      span.textContent = day;
      cell.appendChild(span);

      const dateKey = `${year}-${pad(month+1)}-${pad(day)}`;
      cell.dataset.date = dateKey;

      const today = new Date();
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()){
        cell.classList.add("today");
      }

      monthGrid.appendChild(cell);
    }

    Object.keys(events).forEach(dateKey => {
      const target = monthGrid.querySelector(`.month-cell[data-date="${dateKey}"]`);
      if (!target) return;
      events[dateKey].forEach((ev, idx) => {
        const evEl = document.createElement("div");
        evEl.className = "month-event";
        evEl.textContent = `${ev.startHour}:00-${ev.endHour}:00 ${ev.name}`;
        evEl.dataset.description = ev.description || "";
        evEl.addEventListener("click", (evclick) => {
          evclick.stopPropagation();
          openDetailModal(dateKey, idx);
        });
        target.appendChild(evEl);
      });
    });
  }

  function renderWeekEvents(weekStart){
    document.querySelectorAll(".each-hour .day-column .event").forEach(n => n.remove());

    const wkStart = new Date(weekStart);
    wkStart.setHours(0,0,0,0);
    const wkEnd = new Date(wkStart);
    wkEnd.setDate(wkStart.getDate() + 7);

    updateWeekHeaders(wkStart);

    const row = document.querySelector(".each-hour");
    const rowHeight = row ? row.offsetHeight : 48;

    Object.keys(events).forEach(dateKey => {
      const dateObj = new Date(dateKey + "T00:00:00");
      if (dateObj >= wkStart && dateObj < wkEnd){
        const dayIndex = dateObj.getDay();
        events[dateKey].forEach((ev, idx) => {
          const start = Number(ev.startHour);
          const end = Number(ev.endHour);
          if (isNaN(start) || isNaN(end) || end <= start) return;

          const hourRow = document.querySelector(`.each-hour[data-hour='${start}']`);
          if (!hourRow) return;
          const cols = hourRow.querySelectorAll(".day-column");
          const col = cols[dayIndex];
          if (!col) return;

          const el = document.createElement("div");
          el.className = "event";
          el.textContent = `${start}:00-${end}:00 ${ev.name}`;
          el.dataset.description = ev.description || "";
          const duration = Math.max(1, end - start);
          el.style.height = `${duration * rowHeight - 8}px`;
          el.style.top = `4px`;
          el.addEventListener("click", (evclick) => {
            evclick.stopPropagation();
            openDetailModal(dateKey, idx);
          });

          col.appendChild(el);
        });
      }
    });
  }

  function openDetailModal(dateKey, index){
    selectedEventRef = { date: dateKey, index };
    const ev = events[dateKey] && events[dateKey][index];
    if (!ev) return;
    detailTitle.textContent = ev.name;
    detailTime.textContent = `${ev.startHour}:00 - ${ev.endHour}:00 on ${dateKey}`;
    detailDesc.textContent = ev.description || "(no description)";
    detailOverlay.classList.remove("hidden");
  }
  function closeDetailModal(){
    selectedEventRef = null;
    detailOverlay.classList.add("hidden");
  }

  addBtn.addEventListener("click", () => {
    editing = null;
    formWrap.classList.remove("hidden");
    formWrap.classList.add("active");
    document.getElementById("form-title").textContent = "Add Task/Event";
  });

  monthGrid.addEventListener("click", (e) => {
    const cell = e.target.closest(".month-cell");
    if (!cell || cell.classList.contains("empty")) return;
    const dateKey = cell.dataset.date;
    dateInput.value = dateKey;
    editing = null;
    formWrap.classList.remove("hidden");
    formWrap.classList.add("active");
    document.getElementById("form-title").textContent = "Add Task/Event";
  });

  cancelBtn.addEventListener("click", () => {
    editing = null;
    addForm.reset();
    formWrap.classList.add("hidden");
    formWrap.classList.remove("active");
  });

  addForm.addEventListener("submit", function(e){
    e.preventDefault();
    const name = nameInput.value.trim();
    const dateKey = dateInput.value;
    const startHour = Number(startSelect.value);
    const endHour = Number(endSelect.value);
    const description = descInput.value.trim();

    if (!name || !dateKey){ alert("Please add a name and date."); return; }
    if (startHour >= endHour){ alert("Start must be before end."); return; }

    if (!events[dateKey]) events[dateKey] = [];

    if (editing && editing.date === dateKey && typeof editing.index === "number"){
      events[dateKey][editing.index] = { name, description, startHour, endHour };
      editing = null;
    } else {
      events[dateKey].push({ name, description, startHour, endHour });
    }

    generateCalendar(currentDate);
    renderWeekEvents(currentWeekStart);

    addForm.reset();
    formWrap.classList.add("hidden");
    formWrap.classList.remove("active");
  });

  closeDetailBtn.addEventListener("click", closeDetailModal);
  detailOverlay.addEventListener("click", (e) => {
    if (e.target === detailOverlay) closeDetailModal();
  });

  removeBtn.addEventListener("click", () => {
    if (!selectedEventRef) return;
    const { date, index } = selectedEventRef;
    if (events[date] && events[date][index]){
      events[date].splice(index, 1);
      if (events[date].length === 0) delete events[date];
    }
    closeDetailModal();
    generateCalendar(currentDate);
    renderWeekEvents(currentWeekStart);
  });

  editBtn.addEventListener("click", () => {
    if (!selectedEventRef) return;
    const { date, index } = selectedEventRef;
    const ev = events[date] && events[date][index];
    if (!ev) return;
    nameInput.value = ev.name;
    dateInput.value = date;
    startSelect.value = ev.startHour;
    endSelect.value = ev.endHour;
    descInput.value = ev.description || "";
    editing = { date, index };
    closeDetailModal();
    formWrap.classList.remove("hidden");
    formWrap.classList.add("active");
    document.getElementById("form-title").textContent = "Edit Event";
  });

  prevMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
  });
  nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
  });

  prevWeek.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeekEvents(currentWeekStart);
  });
  nextWeek.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeekEvents(currentWeekStart);
  });

  toggle.addEventListener("change", () => {
    if (toggle.checked){
      weekView.classList.add("hidden");
      monthView.classList.remove("hidden");
    } else {
      weekView.classList.remove("hidden");
      monthView.classList.add("hidden");
    }
  });

  populateHourSelects();
  buildWeekGrid();
  generateCalendar(currentDate);
  renderWeekEvents(currentWeekStart);
  weekView.classList.remove("hidden");
  monthView.classList.add("hidden");
  toggle.checked = false;
});
