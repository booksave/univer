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
    "Сейчас: " + (type === "numerator" ? "числитель" : "знаменатель");

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
  const daysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
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

function setThemeColor(color) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('menu-hidden');
  });

  // Закрытие меню при клике вне его
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
      menu.classList.add('menu-hidden');
    }
  });

  // Открытие настроек
  document.querySelectorAll('#menu li a').forEach(link => {
    if (link.textContent.trim() === 'Настройки') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('settings-modal').classList.remove('hidden');
        document.getElementById('menu').classList.add('menu-hidden');
      });
    }
  });

  // Закрытие окна настроек
  document.getElementById('close-settings').onclick = () => {
    document.getElementById('settings-modal').classList.add('hidden');
  };

  // Смена темы
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.onclick = () => {
    document.body.classList.remove('theme-cyberpunk', 'theme-christmas', 'theme-minimalistic');
    if (btn.dataset.theme !== 'default') {
      document.body.classList.add('theme-' + btn.dataset.theme);
    }
    document.getElementById('settings-modal').classList.add('hidden');
    localStorage.setItem('theme', btn.dataset.theme);

    // Устанавливаем цвет для status bar
    switch (btn.dataset.theme) {
      case 'cyberpunk':
        setThemeColor('#0f2027');
        break;
      case 'christmas':
        setThemeColor('#4e7c59');
        break;
      case 'minimalistic':
        setThemeColor('#f7f7f7');
        break;
      default:
        setThemeColor('#1e1e2f');
    }
  };
});


const savedTheme = localStorage.getItem('theme');
if (savedTheme && savedTheme !== 'default') {
  document.body.classList.add('theme-' + savedTheme);
  switch (savedTheme) {
    case 'cyberpunk':
      setThemeColor('#0f2027');
      break;
    case 'christmas':
      setThemeColor('#4e7c59');
      break;
    case 'minimalistic':
      setThemeColor('#f7f7f7');
      break;
    default:
      setThemeColor('#1e1e2f');
  }
} else {
  setThemeColor('#1e1e2f');
}
});

window.addEventListener("DOMContentLoaded", loadSchedule);

const CACHE_NAME = 'schedule-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/schedule.json',
  '/images/favicon_io/favicon-32x32.png',
  '/images/favicon_io/android-chrome-192x192.png',
  '/images/favicon_io/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});