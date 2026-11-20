// ==========================================
// 1. FitLife Class Booking Logic
// ==========================================
const classesData = [
    { id: 'c1', name: 'Morning Yoga', time: '08:00 AM', trainer: 'Alice', capacity: 15, available: 5 },
    { id: 'c2', name: 'HIIT Extreme', time: '06:00 PM', trainer: 'Bob', capacity: 20, available: 0 },
    { id: 'c3', name: 'Core Pilates', time: '10:00 AM', trainer: 'Charlie', capacity: 12, available: 3 }
];

function renderClasses() {
    const classList = document.getElementById('classList');
    if (!classList) return;

    classList.innerHTML = '';
    classesData.forEach(cls => {
        const isFull = cls.available === 0;
        classList.innerHTML += `
            <div class="class-card">
                <h3>${cls.name}</h3>
                <div class="meta">
                    <p>🕒 ${cls.time}</p>
                    <p>👤 Trainer: ${cls.trainer}</p>
                    <p>🎟️ Seats: ${cls.available} / ${cls.capacity}</p>
                </div>
                <button class="btn" style="background-color: ${isFull ? '#95a5a6' : '#2ecc71'}" 
                    ${isFull ? 'disabled' : ''} 
                    onclick="bookClass('${cls.id}', '${cls.name}', '${cls.time}')">
                    ${isFull ? 'Sold Out' : 'Reserve Seat'}
                </button>
            </div>
        `;
    });
}

function bookClass(id, name, time) {
    let bookings = JSON.parse(localStorage.getItem('fitlife_bookings') || '[]');
    if (bookings.find(b => b.id === id)) {
        alert("You have already booked this class!");
        return;
    }
    bookings.push({ id, name, time });
    localStorage.setItem('fitlife_bookings', JSON.stringify(bookings));
    alert(`Successfully reserved: ${name}\nGo to My Dashboard to view your pass.`);
    const cls = classesData.find(c => c.id === id);
    if (cls) cls.available--;
    renderClasses();
}

// ==========================================
// 2. Visitor Counter Method 1: Write Your Own
//    (Custom JavaScript + localStorage)
// ==========================================
function initCustomCounter() {
    const pageName = document.body.getAttribute('data-page') || 'home';
    const totalKey = 'fitlife_custom_total_visits';
    const pageKey = `fitlife_custom_visits_${pageName}`;

    let totalVisits = parseInt(localStorage.getItem(totalKey) || '0', 10) + 1;
    let pageVisits = parseInt(localStorage.getItem(pageKey) || '0', 10) + 1;

    localStorage.setItem(totalKey, String(totalVisits));
    localStorage.setItem(pageKey, String(pageVisits));

    const totalEl = document.getElementById('customTotalVisits');
    const pageEl = document.getElementById('customPageVisits');
    if (totalEl) totalEl.textContent = totalVisits;
    if (pageEl) pageEl.textContent = pageVisits;
}

function resetCustomCounter() {
    localStorage.removeItem('fitlife_custom_total_visits');
    localStorage.removeItem('fitlife_custom_visits_home');
    localStorage.removeItem('fitlife_custom_visits_classes');
    localStorage.removeItem('fitlife_custom_visits_dashboard');

    const totalEl = document.getElementById('customTotalVisits');
    const pageEl = document.getElementById('customPageVisits');
    if (totalEl) totalEl.textContent = '0';
    if (pageEl) pageEl.textContent = '0';
}

// ==========================================
// 3. Visitor Counter Method 2: Use API
//    (A: Live REST Counter API + B: Yandex.Metrika)
// ==========================================
async function initApiCounter() {
    const apiEl = document.getElementById('apiGlobalVisits');
    if (!apiEl) return;

    const endpoint = 'https://api.counterapi.dev/v1/zxwr1997-fitlife/visits/up';
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        apiEl.textContent = typeof data.count === 'number' ? data.count : 'N/A';
    } catch (error) {
        console.warn('Counter API unavailable:', error);
        apiEl.textContent = 'Offline';
    }
}

function updateYandexStatus() {
    const yandexEl = document.getElementById('yandexStatus');
    if (!yandexEl) return;

    if (window.YANDEX_METRIKA_ID && window.YANDEX_METRIKA_ID !== 0) {
        yandexEl.textContent = `Active (ID: ${window.YANDEX_METRIKA_ID})`;
        yandexEl.style.color = '#2ecc71';
    } else {
        yandexEl.textContent = 'Ready (Set ID from metrika.yandex.ru)';
        yandexEl.style.color = '#f1c40f';
    }
}

// ==========================================
// 4. Initialize All Modules
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderClasses();
    initCustomCounter();
    initApiCounter();
    updateYandexStatus();
});
