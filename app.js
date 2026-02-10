
// Configuration - User should replace these
const CONFIG = {
    // Replace with your Google Apps Script Web App URL
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx8ru2lkDM6NLFB1TX2axglT-4ch_bnLxD7rqt902YA9PJs7O6C_mR8w1W7uVbnhcK-Mg/exec',
    // Mock data in case the script is not connected yet
    MOCK_DATA: {
        breakfast: [
            "Poha 🍚",
            "Upma 🍲",
            "Thalipith 🫓",
            "Dosa 🥞",
            "Idli 🍘",
            "Bread Butter 🍞🧈",
            "PBJ Sandwich 🥪",
            "Dhokla 🍰",
            "Shevyancha Upma 🍜"
        ],
        lunch: [
            "Bhendi 🌿",
            "Gawar 🫘",
            "Tondli 🥒",
            "Batata 🥔",
            "Kanda Batata Rassa 🍛",
            "Shev Bhaji 🍛",
            "Pav Bhaji 🍞🍛",
            "Aloo Paratha 🫓",
            "Misal 🌶️🍛",
            "Flower Batata 🥦🥔",
            "Watana 🟢",
            "Matki 🌱",
            "Chole 🫘🍛",
            "Vangi Bharit 🍆",
            "Bharli Vangi 🍆🍛",
            "Capsicum 🫑"
        ],
        dinner: [
            "Bhendi 🌿",
            "Gawar 🫘",
            "Tondli 🥒",
            "Batata 🥔",
            "Kanda Batata Rassa 🍛",
            "Shev Bhaji 🍛",
            "Pav Bhaji 🍞🍛",
            "Aloo Paratha 🫓",
            "Misal 🌶️🍛",
            "Flower Batata 🥦🥔",
            "Watana 🟢",
            "Matki 🌱",
            "Chole 🫘🍛",
            "Vangi Bharit 🍆",
            "Bharli Vangi 🍆🍛",
            "Capsicum 🫑"
        ]
    }
};

let currentMeal = 'breakfast';
let options = CONFIG.MOCK_DATA.breakfast;
let isSpinning = false;
let startAngle = 0;
let arc = Math.PI / (options.length / 2);
let spinTimeout = null;

const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultCard = document.getElementById('result-card');
const chosenDishText = document.getElementById('chosen-dish');

function getColor(index, total) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2AB7CA', '#F0A6CA'];
    return colors[index % colors.length];
}

function drawWheel() {
    if (!ctx) return;
    const cw = canvas.parentElement.offsetWidth;
    canvas.width = cw;
    canvas.height = cw;
    const centerX = cw / 2;
    const centerY = cw / 2;
    const radius = cw / 2 - 10;

    ctx.clearRect(0, 0, cw, cw);

    arc = Math.PI / (options.length / 2);

    options.forEach((opt, i) => {
        const angle = startAngle + i * arc;

        ctx.fillStyle = getColor(i, options.length);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.arc(centerX, centerY, 0, angle + arc, angle, true);
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(centerX + Math.cos(angle + arc / 2) * (radius * 0.7),
            centerY + Math.sin(angle + arc / 2) * (radius * 0.7));
        ctx.rotate(angle + arc / 2 + Math.PI / 2);

        ctx.font = 'bold 16px Outfit';
        const text = opt.split(' ')[0]; // Take first word if emoji
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    });
}

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

let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    isSpinning = false;
    spinBtn.disabled = false;

    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);

    const result = options[(index + options.length) % options.length];

    chosenDishText.innerText = result;
    resultCard.style.display = 'block';

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
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultCard.style.display = 'none';

    spinAngleStart = Math.random() * 10 + 10;
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
        options = CONFIG.MOCK_DATA[currentMeal];
        resultCard.style.display = 'none';
        startAngle = 0;
        drawWheel();
    });
});

spinBtn.addEventListener('click', spin);

// Initial Load
window.addEventListener('load', () => {
    drawWheel();
    fetchRemoteData();
});

// Fetching from Google Sheets (Placeholder logic)
async function fetchRemoteData() {
    if (CONFIG.SCRIPT_URL.includes('REPLACE')) return;

    try {
        const res = await fetch(CONFIG.SCRIPT_URL + '?action=getMenu');
        const data = await res.json();
        CONFIG.MOCK_DATA = data;
        options = CONFIG.MOCK_DATA[currentMeal];
        drawWheel();
    } catch (e) {
        console.warn('Could not fetch remote data, using mocks.');
    }
}

document.getElementById('save-btn').addEventListener('click', async () => {
    const dish = chosenDishText.innerText;
    if (CONFIG.SCRIPT_URL.includes('REPLACE')) {
        alert('Saving: ' + dish + ' (Connect Apps Script to persist!)');
        return;
    }

    await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'saveHistory', meal: currentMeal, dish: dish, date: new Date().toISOString() })
    });
    alert('Saved to History!');
});
