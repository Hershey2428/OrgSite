function getWeekDates(){
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);

    let dates = [];
    for(let i=0; i<7; i++){
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function updateDayHeaders() {
  const days = document.querySelectorAll(".days div");
  const weekDates = getWeekDates();
  const options = { month: "short", day: "numeric" };
  const names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  days.forEach((dayDiv, i) => {
    dayDiv.textContent = names[i] + " " + weekDates[i].toLocaleDateString(undefined, options);
  });
}

updateDayHeaders();

document.getElementById("add-event-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("event-name").value;
  const day = document.getElementById("event-day").value;
  const startHour = parseInt(document.getElementById("start-hour").value);
  const endHour = parseInt(document.getElementById("end-hour").value);
  const description = document.querySelector("#add-event-form input:last-of-type").value;

  const target = document.querySelector(`.each-hour[data-hour="${startHour}"]`);

  if (target) {
    const newEvent = document.createElement("div");
    newEvent.classList.add("event");
    newEvent.textContent = name;
    newEvent.dataset.description = description;
    newEvent.style.top = "0";
    newEvent.style.height = (endHour - startHour) * 40 + "px"; // each hour ~40px tall

    target.appendChild(newEvent);
  }

  document.getElementById("event-form").classList.add("hidden");
  this.reset();
});