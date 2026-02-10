
// Configuration
const CONFIG = {
    // Replace with your Google Apps Script Web App URL if persistence is needed
    SCRIPT_URL: 'REPLACE_WITH_YOUR_APPS_SCRIPT_URL',
    MENU_DATA_URL: 'menu.json'
};

let menuData = [];
let currentMeal = 'breakfast';
let options = [];
let todaySelections = {
    breakfast: null,
    lunch: null,
    dinner: null
};

let isSpinning = false;
let startAngle = 0;
let arc = 0;
let spinTimeout = null;

const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultCard = document.getElementById('result-card');
const chosenDishText = document.getElementById('chosen-dish');

// Initialize
window.addEventListener('load', async () => {
    await loadMenu();
    updateMealOptions();
    drawWheel();
});

async function loadMenu() {
    try {
        const response = await fetch(CONFIG.MENU_DATA_URL);
        const data = await response.json();
        menuData = data.dishes;
    } catch (e) {
        console.error('Failed to load menu.json, using defaults', e);
        // Fallback if file is missing
        menuData = [
            { name: "Fallback Dish 1", meals: ["breakfast", "lunch", "dinner"], days: [] },
            { name: "Fallback Dish 2", meals: ["breakfast", "lunch", "dinner"], days: [] }
        ];
    }
}

function updateMealOptions() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    // 1. Filter by meal and day preferences
    options = menuData.filter(dish => {
        const mealMatch = dish.meals.includes(currentMeal);
        const dayMatch = dish.days.length === 0 || dish.days.includes(today);
        return mealMatch && dayMatch;
    }).map(d => d.name);

    // 2. Prevent repetition between lunch and dinner
    if (currentMeal === 'lunch' && todaySelections.dinner) {
        options = options.filter(opt => opt !== todaySelections.dinner);
    } else if (currentMeal === 'dinner' && todaySelections.lunch) {
        options = options.filter(opt => opt !== todaySelections.lunch);
    }

    // Default if no options found
    if (options.length === 0) options = ["No options for today!"];

    arc = Math.PI / (options.length / 2);
    startAngle = 0;
}

function getColor(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2AB7CA', '#F0A6CA', '#9B5DE5', '#00BBF9'];
    return colors[index % colors.length];
}

function drawWheel() {
    if (!ctx) return;
    const cw = canvas.parentElement.offsetWidth;
    canvas.width = cw;
    canvas.height = cw;
    const centerX = cw / 2;
    const centerY = cw / 2;
    const radius = cw / 2 - 15;

    ctx.clearRect(0, 0, cw, cw);

    options.forEach((opt, i) => {
        const angle = startAngle + i * arc;

        // Piece
        ctx.fillStyle = getColor(i);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);

        // Handle long text: Wrap or Scale
        const maxTextWidth = radius * 0.7;
        let fontSize = options.length > 8 ? 12 : 16;
        if (options.length > 12) fontSize = 10;
        ctx.font = `bold ${fontSize}px Outfit`;

        const words = opt.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw multiple lines
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        lines.forEach((l, index) => {
            ctx.fillText(l.trim(), radius * 0.4, (index * lineHeight) - (totalHeight / 2) + (lineHeight / 2) + 5);
        });

        ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A2E';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Spin logic
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    isSpinning = false;
    spinBtn.disabled = false;

    // Calculate winning index (90 degrees adjustment for top pointer)
    const degrees = (startAngle * 180 / Math.PI) + 90;
    const arcd = (arc * 180 / Math.PI);
    const index = Math.floor((360 - (degrees % 360)) / arcd);

    const result = options[(index + options.length) % options.length];

    chosenDishText.innerText = result;
    resultCard.style.display = 'block';

    // Save to current session to avoid repeats
    todaySelections[currentMeal] = result;

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
    });
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function spin() {
    if (isSpinning || options.length <= 1) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultCard.style.display = 'none';

    spinAngleStart = Math.random() * 10 + 20;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
}

// Event Listeners
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isSpinning) return;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMeal = btn.dataset.meal;
        updateMealOptions();
        resultCard.style.display = 'none';
        drawWheel();
    });
});

spinBtn.addEventListener('click', spin);

document.getElementById('save-btn').addEventListener('click', async () => {
    const dish = chosenDishText.innerText;
    if (CONFIG.SCRIPT_URL.includes('REPLACE')) {
        alert('Saving: ' + dish + ' (Connect Apps Script to persist!)');
        return;
    }

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ action: 'saveHistory', meal: currentMeal, dish: dish, date: new Date().toISOString() })
        });
        alert('Saved to History!');
    } catch (e) {
        alert('Error saving to history.');
    }
});
