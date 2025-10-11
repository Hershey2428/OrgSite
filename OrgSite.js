document.addEventListener("DOMContentLoaded", () => {
  const hoursContainer = document.querySelector(".hours");
  for (let i = 1; i <= 24; i++) {
    const hourRow = document.createElement("div");
    hourRow.classList.add("each-hour");
    hourRow.dataset.hour = i;
    hoursContainer.appendChild(hourRow);
  }

  const headers = document.querySelectorAll(".day-header");
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);

  headers.forEach((cell, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const options = { weekday: "short", month: "short", day: "numeric" };
    cell.textContent = d.toLocaleDateString(undefined, options);
  });

  const toggle = document.getElementById("toggle-view");
  const weekView = document.getElementById("week");
  const monthView = document.getElementById("month");
  const add = document.getElementById("add-event");
  const form = document.getElementById("event-form");
  const monthGrid = document.querySelector(".month-grid");
  const monthName = document.getElementById("month-name");

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      weekView.classList.add("hidden");
      monthView.classList.remove("hidden");
    } else {
      weekView.classList.remove("hidden");
      monthView.classList.add("hidden");
    }
  });

  add.addEventListener("click", () => {
    form.classList.remove("hidden");
  });

  let currentDate = new Date();

  function generateCalendar(date) {
    monthGrid.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const firstWeekDay = firstDay.getDay();

    monthName.textContent = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    for (let i = 0; i < firstWeekDay; i++) {
      const empty = document.createElement("div");
      empty.classList.add("day-cell", "empty");
      monthGrid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.classList.add("day-cell");
      cell.textContent = day;

      const today = new Date();
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      monthGrid.appendChild(cell);
    }
  }

  document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
  });

  generateCalendar(currentDate);

  document
    .getElementById("add-event-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("event-name").value;
      const day = document.getElementById("event-day").value;
      const startHour = parseInt(document.getElementById("start-hour").value);
      const endHour = parseInt(document.getElementById("end-hour").value);
      const description = document.getElementById("event-desc").value || "";

      const target = document.querySelector(
        `.each-hour[data-hour="${startHour}"]`
      );

      if (target) {
        const newEvent = document.createElement("div");
        newEvent.classList.add("event");
        newEvent.textContent = name;
        newEvent.dataset.description = description;
        newEvent.style.top = "0";
        newEvent.style.height = (endHour - startHour) * 40 + "px";
        target.appendChild(newEvent);
      }

      form.classList.add("hidden");
      this.reset();
    });
  });
