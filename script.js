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

      for (let i = 0; i < 5; i++) {
        const span = document.createElement("span");
        span.className = "firework";
        span.style.animationDelay = `${i * 0.3}s`;
        li.appendChild(span);
      }

      const text = document.createElement("span");
      text.className = "holiday-text";
      text.textContent = "Выходной";
      li.appendChild(text);

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
      document.body.classList.remove('theme-cyberpunk', 'theme-christmas', 'theme-minimalistic', 'theme-gold');
      if (btn.dataset.theme !== 'default') {
        document.body.classList.add('theme-' + btn.dataset.theme);
      }
      document.getElementById('settings-modal').classList.add('hidden');
      localStorage.setItem('theme', btn.dataset.theme);
    };
  });


  // Применение темы при загрузке
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && savedTheme !== 'default') {
    document.body.classList.add('theme-' + savedTheme);
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

const firebaseConfig = {
  apiKey: "AIzaSyDJB6qoJtNLvBBPn7G7SwujL7uf0YHfnEs",
  authDomain: "univer-fc0db.firebaseapp.com",
  projectId: "univer-fc0db",
  storageBucket: "univer-fc0db.appspot.com",
  messagingSenderId: "191387845727",
  appId: "1:191387845727:web:c3fd151e0a232cedb407ea",
  measurementId: "G-5L7SY21MD2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();



async function loadSuggestions() {
  const list = document.getElementById('suggestions-list');
  list.innerHTML = '';
  const snapshot = await db.collection('suggestions').get();
  snapshot.forEach(doc => {
    const item = doc.data();
    const li = document.createElement('li');
    li.textContent = item.text;

    if (item.status === 'done') {
      li.style.textDecoration = 'line-through';
      li.style.color = 'green';
      li.textContent += ' (Выполнено)';
    } else if (item.status === 'rejected') {
      li.style.color = 'red';
      li.textContent += ' (Отклонено)';
    }

    if (item.status === 'new') {
      const doneBtn = document.createElement('button');
      doneBtn.textContent = 'Выполнено';
      doneBtn.onclick = () => updateStatus(doc.id, 'done');

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Отклонить';
      rejectBtn.onclick = () => updateStatus(doc.id, 'rejected');

      li.appendChild(doneBtn);
      li.appendChild(rejectBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.onclick = () => deleteSuggestion(doc.id);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

async function updateStatus(id, status) {
  await db.collection('suggestions').doc(id).update({ status });
  loadSuggestions();
}

async function deleteSuggestion(id) {
  await db.collection('suggestions').doc(id).delete();
  loadSuggestions();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('suggestion-form');
  const input = document.getElementById('suggestion-input');
  const list = document.getElementById('suggestions-list');

  if (form && input && list) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        await db.collection('suggestions').add({ text: value, status: 'new' });
        input.value = '';
        loadSuggestions();
      }
    });

    loadSuggestions();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (value.length < 1 || value.length > 500) {
    alert('Текст предложения должен быть от 1 до 500 символов.');
    return;
  }
  // Можно добавить фильтрацию от XSS
  const safeValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  await db.collection('suggestions').add({ text: safeValue, status: 'new' });
  input.value = '';
  loadSuggestions();
});