// State management
let state = {
    currentUser: null,
    coffeeCount: 5,
    timerEnd: null,
    lastCoffeeTime: null
};

// Constants
const COFFEE_COOLDOWN = 30 * 60 * 1000; // 30 minutes in milliseconds
const STORAGE_KEY = 'pretCoffeeState';

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        const parsed = JSON.parse(savedState);
        // Only load state if it's from today
        if (parsed.date === new Date().toDateString()) {
            state = parsed.state;
            updateUI();
        } else {
            // Reset for new day
            resetForNewDay();
        }
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: new Date().toDateString(),
        state: state
    }));
}

// Reset state for a new day
function resetForNewDay() {
    state = {
        currentUser: null,
        coffeeCount: 5,
        timerEnd: null,
        lastCoffeeTime: null
    };
    saveState();
    updateUI();
}

// Update the UI elements
function updateUI() {
    // Update user buttons
    document.getElementById('vaibhavBtn').classList.toggle('active', state.currentUser === 'Vaibhav');
    document.getElementById('manasBtn').classList.toggle('active', state.currentUser === 'Manas');
    
    // Update coffee count
    document.getElementById('coffeeCount').textContent = state.coffeeCount;
    
    // Update current date
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    
    // Update get coffee button state
    const coffeeBtn = document.getElementById('getCoffeeBtn');
    coffeeBtn.disabled = !canGetCoffee();
    
    // Update status message
    updateStatusMessage();
}

// Check if coffee can be taken
function canGetCoffee() {
    if (!state.currentUser) return false;
    if (state.coffeeCount <= 0) return false;
    if (!state.timerEnd) return true;
    return Date.now() >= state.timerEnd;
}

// Update the status message
function updateStatusMessage() {
    const message = document.getElementById('statusMessage');
    if (!state.currentUser) {
        message.textContent = 'Please select a user';
    } else if (state.coffeeCount <= 0) {
        message.textContent = 'No more coffees available today';
    } else if (state.timerEnd && Date.now() < state.timerEnd) {
        const timeLeft = Math.ceil((state.timerEnd - Date.now()) / 1000 / 60);
        message.textContent = `Please wait ${timeLeft} minutes before next coffee`;
    } else {
        message.textContent = 'You can get a coffee now!';
    }
}

// Select a user
function selectUser(user) {
    state.currentUser = user;
    saveState();
    updateUI();
}

// Get coffee function
function getCoffee() {
    if (!canGetCoffee()) return;
    
    state.coffeeCount--;
    state.lastCoffeeTime = Date.now();
    state.timerEnd = Date.now() + COFFEE_COOLDOWN;
    
    // Request notification permission if not granted
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Set timer for notification
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification('Coffee Timer', {
                body: 'You can now get another coffee!',
                icon: 'https://www.pret.com/favicon.ico'
            });
        }
    }, COFFEE_COOLDOWN);
    
    saveState();
    updateUI();
}

// Update timer display every second
setInterval(() => {
    if (state.timerEnd && Date.now() < state.timerEnd) {
        const timeLeft = Math.ceil((state.timerEnd - Date.now()) / 1000);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('timerDisplay').textContent = 'Ready!';
    }
    updateStatusMessage();
}, 1000);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
}); 