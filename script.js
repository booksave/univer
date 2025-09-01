let scheduleData = {};

// --- Определение числитель/знаменатель ---
function detectWeekType() {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const septFirst = new Date(year, 8, 1);
  const diff = Math.floor((now - septFirst) / (1000 * 60 * 60 * 24 * 7));
  return diff % 2 === 0 ? "numerator" : "denominator";
}

// --- Загрузка JSON ---
async function loadSchedule() {
  const res = await fetch("schedule.json");
  scheduleData = await res.json();

  const type = detectWeekType();
  document.getElementById("current-week").textContent =
    "Сейчас идёт: неделя " + (type === "numerator" ? "числитель" : "знаменатель");

  renderSchedule(type);
  highlightTodayAndLesson(type);

  document.getElementById("numerator-btn").addEventListener("click", () => {
    renderSchedule("numerator");
    highlightTodayAndLesson("numerator");
  });

  document.getElementById("denominator-btn").addEventListener("click", () => {
    renderSchedule("denominator");
    highlightTodayAndLesson("denominator");
  });
}

// --- Отрисовка расписания ---
function renderSchedule(type) {
    const container = document.getElementById("schedule-container");
    const weekLabel = document.getElementById("week-type");
  
    container.innerHTML = "";
    weekLabel.textContent = "Неделя: " + (type === "numerator" ? "числитель" : "знаменатель");
  
    const days = scheduleData[type];
    const dayNamesRu = {
      monday: "Понедельник",
      tuesday: "Вторник",
      wednesday: "Среда",
      thursday: "Четверг",
      friday: "Пятница",
      saturday: "Суббота",
      sunday: "Воскресенье"
    };
  
    for (const [day, lessons] of Object.entries(days)) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
  
      const dayTitle = document.createElement("h3");
      dayTitle.textContent = dayNamesRu[day];
      dayDiv.appendChild(dayTitle);
  
      const ul = document.createElement("ul");
  
      // Проверяем — выходной?
      if (!lessons || lessons.length === 0 || Object.keys(lessons[0]).length === 0) {
        const li = document.createElement("li");
        li.className = "holiday"; 
        li.innerHTML = "🎉 RELAX BRO 🎉";
        ul.appendChild(li);
      } else {
        lessons.forEach(lesson => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${lesson.time}</strong> — ${lesson.subject} 
            <br><em>${lesson.room}, ${lesson.teacher}</em>
          `;
          ul.appendChild(li);
        });
      }
  
      dayDiv.appendChild(ul);
      container.appendChild(dayDiv);
    }
  }
  


// --- Подсветка текущего дня и пары ---
function highlightTodayAndLesson(type) {
  const now = new Date();
  const dayIndex = now.getDay(); // 0=вс, 1=пн ... 6=сб
  const daysRu = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
  const currentDay = daysRu[dayIndex];

  // Подсветка дня
  document.querySelectorAll(".day").forEach(dayDiv => {
    const title = dayDiv.querySelector("h3");
    if (title.textContent === currentDay) {
      dayDiv.classList.add("today");
    }
  });

  // Подсветка пары (по времени)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = timeStr => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const dayBlock = [...document.querySelectorAll(".day")].find(
    d => d.querySelector("h3").textContent === currentDay
  );

  if (dayBlock) {
    const lessons = dayBlock.querySelectorAll("li");
    lessons.forEach(li => {
      const match = li.innerHTML.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/);
      if (match) {
        const start = timeToMinutes(match[1]);
        const end = timeToMinutes(match[2]);
        if (currentTime >= start && currentTime <= end) {
          li.classList.add("current-lesson");
        }
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", loadSchedule);

