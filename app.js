
// Configuration
const CONFIG = {
    SCRIPT_URL: 'REPLACE_WITH_YOUR_APPS_SCRIPT_URL'
};

let menuData = [];
let currentMeal = 'breakfast';
let options = [];
let todaySelections = { breakfast: null, lunch: null, dinner: null };
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
        if (typeof MENU_DATA !== 'undefined' && MENU_DATA.dishes) {
            menuData = MENU_DATA.dishes;
        } else {
            throw new Error("Data missing");
        }
    } catch (e) {
        menuData = [
            { name: "Pancakes 🥞", meals: ["breakfast"], days: [] },
            { name: "Pizza 🍕", meals: ["lunch", "dinner"], days: [] }
        ];
    }
}

function updateMealOptions() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    options = menuData.filter(dish => {
        const mealMatch = dish.meals.includes(currentMeal);
        const dayMatch = dish.days.length === 0 || dish.days.includes(today);
        return mealMatch && dayMatch;
    }).map(d => d.name);

    if (currentMeal === 'lunch' && todaySelections.dinner) {
        options = options.filter(opt => opt !== todaySelections.dinner);
    } else if (currentMeal === 'dinner' && todaySelections.lunch) {
        options = options.filter(opt => opt !== todaySelections.lunch);
    }

    if (options.length === 0) options = ["Add more dishes!"];
    arc = Math.PI / (options.length / 2);
}

function getSliceColor(index, total) {
    const palette = [
        { bg: '#FF6B6B', text: '#FFFFFF' }, // Coral
        { bg: '#4ECDC4', text: '#FFFFFF' }, // Mint
        { bg: '#FFE66D', text: '#2D3436' }, // Yellow
        { bg: '#A29BFE', text: '#FFFFFF' }, // Lavender
        { bg: '#FAB1A0', text: '#FFFFFF' }, // Peach
        { bg: '#81ECEC', text: '#2D3436' }, // Cyan
        { bg: '#74B9FF', text: '#FFFFFF' }, // Blue
        { bg: '#55E6C1', text: '#FFFFFF' }  // Emerald
    ];
    let idx = index % palette.length;
    if (index === total - 1 && idx === 0 && total > 1) idx = 1;
    return palette[idx];
}

function drawWheel() {
    if (!ctx) return;
    const size = canvas.parentElement.offsetWidth;
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 5;

    ctx.clearRect(0, 0, size, size);

    options.forEach((opt, i) => {
        const angle = startAngle + i * arc;
        const colorSet = getSliceColor(i, options.length);

        // Slice with Gradient
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, colorSet.bg);
        grad.addColorStop(1, colorSet.bg);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Slice border
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.fillStyle = colorSet.text;
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        let fontSize = size < 300 ? 11 : 14;
        if (options.length > 12) fontSize = 10;
        ctx.font = `800 ${fontSize}px 'Outfit'`;

        const maxTextWidth = radius * 0.75;
        const words = opt.split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            let testLine = currentLine + word + ' ';
            if (ctx.measureText(testLine).width > maxTextWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim());

        const lineSpacing = fontSize * 1.2;
        const totalHeight = lines.length * lineSpacing;

        lines.forEach((line, index) => {
            const yOffset = (index * lineSpacing) - (totalHeight / 2) + (lineSpacing / 2);
            ctx.fillText(line, radius - 20, yOffset);
        });

        ctx.restore();
    });

    // Elegant Center Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#F1F2F6';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B6B';
    ctx.fill();
}

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

    const degrees = (startAngle * 180 / Math.PI) + 90;
    const arcd = (arc * 180 / Math.PI);
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    const result = options[(index + options.length) % options.length];

    chosenDishText.innerText = result;
    resultCard.style.display = 'block';

    // Smooth scroll to result
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);

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
    spinAngleStart = Math.random() * 10 + 25;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
}

// Listeners
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

document.getElementById('publish-btn').addEventListener('click', async () => {
    const dish = chosenDishText.innerText;
    if (!dish || resultCard.style.display === 'none') {
        alert("Spin first!");
        return;
    }
    const text = `Yum! Today's ${currentMeal} is ${dish}! 🥘`;
    if (navigator.share) {
        navigator.share({ title: 'Yummy Spinner', text: text, url: window.location.href });
    } else {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard! 📋");
    }
});

document.getElementById('save-btn').addEventListener('click', () => {
    alert("Saved to your favorites! ❤️");
});
