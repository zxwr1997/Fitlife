// ==========================================
// 1. FitLife Class Booking & Keyword Filter Logic
// ==========================================
const classesData = [
    {
        id: 'c1',
        category: 'yoga',
        name: 'Morning Yoga',
        time: '08:00 AM',
        trainer: 'Alice (Certified Yoga Trainer)',
        capacity: 15,
        available: 5,
        keywords: ['Morning Yoga', 'Yoga Classes Near Me', 'Online Fitness Class Booking']
    },
    {
        id: 'c2',
        category: 'hiit',
        name: 'HIIT Extreme',
        time: '06:00 PM',
        trainer: 'Bob (Personal Trainer)',
        capacity: 20,
        available: 0,
        keywords: ['HIIT Workout', 'Fitness Classes Near Me', 'Gym Booking']
    },
    {
        id: 'c3',
        category: 'pilates',
        name: 'Core Pilates',
        time: '10:00 AM',
        trainer: 'Charlie (Pilates Specialist)',
        capacity: 12,
        available: 3,
        keywords: ['Pilates Class', 'Pilates Classes Near Me', 'Pilates for Beginners']
    }
];

let activeFilter = 'all';

function renderClasses(filter = activeFilter) {
    const classList = document.getElementById('classList');
    if (!classList) return;

    activeFilter = filter;
    const filtered = filter === 'all'
        ? classesData
        : classesData.filter(cls => cls.category === filter);

    classList.innerHTML = '';
    filtered.forEach(cls => {
        const isFull = cls.available === 0;
        const tagsHtml = cls.keywords
            .map(kw => `<span class="class-kw-tag">${kw}</span>`)
            .join('');

        classList.innerHTML += `
            <div class="class-card">
                <div>
                    <div class="class-kw-tags">${tagsHtml}</div>
                    <h3>${cls.name}</h3>
                    <div class="meta">
                        <p>🕒 ${cls.time}</p>
                        <p>👤 Trainer: ${cls.trainer}</p>
                        <p>🎟️ Seats: ${cls.available} / ${cls.capacity}</p>
                    </div>
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

function filterClasses(category, btnEl) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        const matchingBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
        if (matchingBtn) matchingBtn.classList.add('active');
    }
    renderClasses(category);
}

function applyUrlFilter() {
    const classList = document.getElementById('classList');
    if (!classList) return;

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    if (filterParam && ['yoga', 'hiit', 'pilates'].includes(filterParam)) {
        filterClasses(filterParam);
    } else {
        renderClasses('all');
    }
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
    renderClasses(activeFilter);
}

// ==========================================
// 2. Visitor Counter Method 1: Write Your Own
//    (Custom JavaScript + localStorage)
// ==========================================
function incrementCustomCounter() {
    const pageName = document.body.getAttribute('data-page') || 'home';
    const totalKey = 'fitlife_custom_total_visits';
    const pageKey = `fitlife_custom_visits_${pageName}`;

    const totalVisits = parseInt(localStorage.getItem(totalKey) || '0', 10) + 1;
    const pageVisits = parseInt(localStorage.getItem(pageKey) || '0', 10) + 1;

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
//    (Clickable REST Counter API + Yandex.Metrika)
// ==========================================
async function hitApiCounter(isManualClick = false) {
    const apiEl = document.getElementById('apiGlobalVisits');
    const apiBtn = document.getElementById('apiCounterBtn');
    if (!apiEl) return;

    if (apiBtn) apiBtn.disabled = true;
    if (isManualClick) {
        apiEl.textContent = '...';
    }

    const endpoint = 'https://api.counterapi.dev/v1/zxwr1997-fitlife/visits/up';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(endpoint, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const count = typeof data.count === 'number' ? data.count : data.value;
        apiEl.textContent = typeof count === 'number' ? count : 'Retry';
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Counter API unavailable:', error);
        apiEl.textContent = 'Retry';
    } finally {
        if (apiBtn) apiBtn.disabled = false;
    }
}

// ==========================================
// 4. Initialize All Modules
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    applyUrlFilter();
    incrementCustomCounter();
    hitApiCounter(false);
});
