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
    localStorage.removeItem('fitlife_custom_visits_tools');

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
    calculateMacros();
    resetIntervalTimer();
    renderDashboardData();
});


// ==========================================
// 5. Practical Utility 1: Daily Calorie & Macro Calculator
// ==========================================
let latestCalculatedMacros = null;

function calculateMacros() {
    const genderEl = document.getElementById('macroGender');
    if (!genderEl) return;

    const gender = genderEl.value;
    const age = parseFloat(document.getElementById('macroAge').value) || 23;
    const height = parseFloat(document.getElementById('macroHeight').value) || 175;
    const weight = parseFloat(document.getElementById('macroWeight').value) || 68;
    const activity = parseFloat(document.getElementById('macroActivity').value) || 1.375;
    const goal = document.getElementById('macroGoal').value;

    // Mifflin-St Jeor Equation
    const bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161));
    const tdee = Math.round(bmr * activity);

    let targetCalories = tdee;
    let goalLabel = 'Body Recomp / Maintain';
    let classAdvice = 'Balance strength & cardio with 2x Core Pilates and 1x Morning Yoga per week.';

    if (goal === 'cut') {
        targetCalories = Math.max(1200, tdee - 400);
        goalLabel = 'Fat Loss (-400 kcal)';
        classAdvice = 'Pair this calorie deficit with 2x HIIT Extreme sessions and 1x Core Pilates weekly for maximum fat burn.';
    } else if (goal === 'bulk') {
        targetCalories = tdee + 300;
        goalLabel = 'Lean Muscle Gain (+300 kcal)';
        classAdvice = 'Support muscle recovery with 2x Core Pilates and 1x Morning Yoga mobility sessions alongside strength training.';
    }

    const proteinG = Math.round(weight * 1.8);
    const fatG = Math.round((targetCalories * 0.25) / 9);
    const carbsG = Math.max(50, Math.round((targetCalories - (proteinG * 4) - (fatG * 9)) / 4));

    const chickenG = Math.round((proteinG / 20) * 100);
    const riceG = Math.round((carbsG / 26) * 100);
    const oliveTbsp = (fatG / 14).toFixed(1);

    document.getElementById('resCalories').textContent = `${targetCalories.toLocaleString()} kcal`;
    document.getElementById('resBmr').textContent = `BMR: ${bmr.toLocaleString()} kcal`;
    document.getElementById('resProtein').textContent = `${proteinG} g`;
    document.getElementById('resChicken').textContent = `≈ ${chickenG}g chicken breast`;
    document.getElementById('resCarbs').textContent = `${carbsG} g`;
    document.getElementById('resRice').textContent = `≈ ${riceG}g cooked rice`;
    document.getElementById('resFat').textContent = `${fatG} g`;
    document.getElementById('resOlive').textContent = `≈ ${oliveTbsp} tbsp olive oil/nuts`;
    document.getElementById('resClassAdvice').innerHTML = `<strong>Recommended FitLife Class Pair:</strong> ${classAdvice}`;

    latestCalculatedMacros = {
        goalLabel,
        targetCalories,
        proteinG,
        carbsG,
        fatG,
        updatedAt: new Date().toLocaleDateString()
    };

    const statusEl = document.getElementById('macroSaveStatus');
    if (statusEl) statusEl.textContent = '';
}

function saveMacrosToDashboard() {
    if (!latestCalculatedMacros) calculateMacros();
    if (!latestCalculatedMacros) return;

    localStorage.setItem('fitlife_saved_macros', JSON.stringify(latestCalculatedMacros));
    const statusEl = document.getElementById('macroSaveStatus');
    if (statusEl) {
        statusEl.textContent = '✓ Saved! View it anytime on My Dashboard.';
    }
}

function renderDashboardData() {
    const bookingsList = document.getElementById('myBookingsList');
    if (bookingsList) {
        const bookings = JSON.parse(localStorage.getItem('fitlife_bookings') || '[]');
        if (bookings.length > 0) {
            bookingsList.innerHTML = '';
            bookings.forEach(b => {
                bookingsList.innerHTML += `<li><strong>${b.name}</strong> - ${b.time} <span class="badge green">Confirmed</span></li>`;
            });
        }
    }

    const macroBox = document.getElementById('savedMacroSummary');
    if (macroBox) {
        const saved = JSON.parse(localStorage.getItem('fitlife_saved_macros') || 'null');
        if (saved) {
            macroBox.innerHTML = `
                <p><strong>Goal:</strong> ${saved.goalLabel} <span class="badge green">${saved.targetCalories} kcal/day</span></p>
                <ul class="saved-macro-list">
                    <li>🥩 <strong>Protein:</strong> ${saved.proteinG} g / day</li>
                    <li>🍚 <strong>Carbs:</strong> ${saved.carbsG} g / day</li>
                    <li>🥑 <strong>Healthy Fats:</strong> ${saved.fatG} g / day</li>
                </ul>
                <p class="small-text">Last updated: ${saved.updatedAt} • <a href="tools.html#macro-tool" class="inline-link">Recalculate &rarr;</a></p>
            `;
        }
    }
}

// ==========================================
// 6. Practical Utility 2: Interactive HIIT & Rest Interval Timer
// ==========================================
let timerState = {
    intervalId: null,
    isRunning: false,
    phase: 'ready',
    currentRound: 1,
    totalRounds: 8,
    workSec: 20,
    restSec: 10,
    remainingSec: 20,
    phaseTotalSec: 20,
    presetTitle: 'Tabata Sprint (20s/10s)'
};

function playTimerBeep(freq = 880, duration = 0.18) {
    const toggle = document.getElementById('timerSoundToggle');
    if (toggle && !toggle.checked) return;

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Ignore audio errors if blocked
    }
}

function formatClock(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerUI() {
    const clockEl = document.getElementById('timerClockDisplay');
    const phaseEl = document.getElementById('timerPhaseLabel');
    const roundEl = document.getElementById('timerRoundDisplay');
    const barEl = document.getElementById('timerProgressBar');
    const panelEl = document.getElementById('timerPanel');
    if (!clockEl || !panelEl) return;

    clockEl.textContent = formatClock(timerState.remainingSec);
    panelEl.className = `timer-display-panel phase-${timerState.phase}`;

    if (timerState.phase === 'ready') {
        phaseEl.textContent = `READY • ${timerState.presetTitle.toUpperCase()}`;
        roundEl.textContent = `Round 1 of ${timerState.totalRounds} • Work ${timerState.workSec}s / Rest ${timerState.restSec}s`;
    } else if (timerState.phase === 'work') {
        phaseEl.textContent = '🔥 WORK INTERVAL • PUSH HARD!';
        roundEl.textContent = `Round ${timerState.currentRound} of ${timerState.totalRounds}`;
    } else if (timerState.phase === 'rest') {
        phaseEl.textContent = '💧 REST & RECOVER • BREATHE';
        roundEl.textContent = `Next: Round ${timerState.currentRound + 1} of ${timerState.totalRounds}`;
    } else if (timerState.phase === 'done') {
        phaseEl.textContent = '🏆 WORKOUT COMPLETE!';
        roundEl.textContent = `Completed all ${timerState.totalRounds} rounds (${timerState.presetTitle})`;
    }

    const pct = timerState.phaseTotalSec > 0
        ? Math.max(0, Math.min(100, (timerState.remainingSec / timerState.phaseTotalSec) * 100))
        : 100;
    barEl.style.width = `${pct}%`;
}

function applyTimerPreset(workSec, restSec, rounds, title, btnEl) {
    pauseIntervalTimer();
    document.querySelectorAll('.preset-bar .filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    document.getElementById('timerWorkSec').value = workSec;
    document.getElementById('timerRestSec').value = restSec;
    document.getElementById('timerRounds').value = rounds;

    timerState.presetTitle = title;
    resetIntervalTimer();
}

function startIntervalTimer() {
    const clockEl = document.getElementById('timerClockDisplay');
    if (!clockEl || timerState.isRunning) return;

    if (timerState.phase === 'ready' || timerState.phase === 'done') {
        timerState.workSec = Math.max(5, parseInt(document.getElementById('timerWorkSec').value, 10) || 20);
        timerState.restSec = Math.max(5, parseInt(document.getElementById('timerRestSec').value, 10) || 10);
        timerState.totalRounds = Math.max(1, parseInt(document.getElementById('timerRounds').value, 10) || 8);
        timerState.currentRound = 1;
        timerState.phase = 'work';
        timerState.remainingSec = timerState.workSec;
        timerState.phaseTotalSec = timerState.workSec;
        playTimerBeep(980, 0.25);
    }

    timerState.isRunning = true;
    const startBtn = document.getElementById('timerStartBtn');
    if (startBtn) startBtn.textContent = 'Running...';
    updateTimerUI();

    timerState.intervalId = setInterval(() => {
        timerState.remainingSec--;

        if (timerState.remainingSec > 0 && timerState.remainingSec <= 3) {
            playTimerBeep(660, 0.12);
        }

        if (timerState.remainingSec <= 0) {
            if (timerState.phase === 'work') {
                if (timerState.currentRound >= timerState.totalRounds) {
                    pauseIntervalTimer();
                    timerState.phase = 'done';
                    timerState.remainingSec = 0;
                    playTimerBeep(1046, 0.45);
                    updateTimerUI();
                    return;
                }
                timerState.phase = 'rest';
                timerState.remainingSec = timerState.restSec;
                timerState.phaseTotalSec = timerState.restSec;
                playTimerBeep(523, 0.28);
            } else if (timerState.phase === 'rest') {
                timerState.currentRound++;
                timerState.phase = 'work';
                timerState.remainingSec = timerState.workSec;
                timerState.phaseTotalSec = timerState.workSec;
                playTimerBeep(980, 0.28);
            }
        }
        updateTimerUI();
    }, 1000);
}

function pauseIntervalTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    timerState.isRunning = false;
    const startBtn = document.getElementById('timerStartBtn');
    if (startBtn) startBtn.textContent = timerState.phase === 'ready' ? 'Start Workout' : 'Resume';
}

function resetIntervalTimer() {
    pauseIntervalTimer();
    const workInput = document.getElementById('timerWorkSec');
    if (!workInput) return;

    timerState.workSec = Math.max(5, parseInt(workInput.value, 10) || 20);
    timerState.restSec = Math.max(5, parseInt(document.getElementById('timerRestSec').value, 10) || 10);
    timerState.totalRounds = Math.max(1, parseInt(document.getElementById('timerRounds').value, 10) || 8);
    timerState.currentRound = 1;
    timerState.phase = 'ready';
    timerState.remainingSec = timerState.workSec;
    timerState.phaseTotalSec = timerState.workSec;

    const startBtn = document.getElementById('timerStartBtn');
    if (startBtn) startBtn.textContent = 'Start Workout';
    updateTimerUI();
}
