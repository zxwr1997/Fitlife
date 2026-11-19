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
    // Check if already booked
    if(bookings.find(b => b.id === id)) {
        alert("You have already booked this class!");
        return;
    }
    
    // Add to pseudo-database (localStorage)
    bookings.push({ id, name, time });
    localStorage.setItem('fitlife_bookings', JSON.stringify(bookings));
    
    alert(`Successfully reserved: ${name}\nGo to My Dashboard to view your pass.`);
    
    // Simulate capacity reduction locally for demo
    const cls = classesData.find(c => c.id === id);
    if(cls) cls.available--;
    renderClasses();
}

// Init
document.addEventListener('DOMContentLoaded', renderClasses);
