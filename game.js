const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const speedMeter = document.getElementById("speedMeter");

const engineSound = document.getElementById("engineSound");
const crashSound = document.getElementById("crashSound");

// IMAGES
const playerImg = new Image();
playerImg.src = "/static/images/player.png";

const enemyImg = new Image();
enemyImg.src = "/static/images/enemy.png";

// GAME STATE
let gameRunning = false;

// PLAYER PHYSICS
let carX = 170;
let carY = 470;
let velocityX = 0;
let acceleration = 2.2;
let friction = 0.72;
let maxSpeed = 16;

// ROAD
let roadOffset = 0;
let roadCurve = 0;
let speed = 4;

// ENEMIES
let enemies = [];

// INPUT STATE
let keys = {};

// INPUT (NO DELAY — REAL)
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// START / RESTART
startBtn.onclick = startGame;
restartBtn.onclick = startGame;

function startGame() {
    gameRunning = true;

    carX = 170;
    velocityX = 0;
    speed = 4;
    roadOffset = 0;

    enemies = [
        { x: 80, y: -200 },
        { x: 240, y: -500 }
    ];

    startBtn.style.display = "none";
    restartBtn.style.display = "none";

    engineSound.currentTime = 0;
    engineSound.loop = true;
    engineSound.play();

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// ROAD DRAW (REAL FEEL)
function drawRoad() {
    roadCurve += (Math.random() - 0.5) * 0.4;
    roadCurve = Math.max(-25, Math.min(25, roadCurve));

    ctx.fillStyle = "#777";
    ctx.fillRect(50 + roadCurve, 0, 300, canvas.height);

    ctx.fillStyle = "white";
    for (let i = 0; i < 10; i++) {
        let h = 30 + i * 5;
        ctx.fillRect(
            195 + roadCurve,
            roadOffset + i * 80,
            10,
            h
        );
    }

    roadOffset += speed;
    if (roadOffset > 80) roadOffset = 0;
}

// MAIN LOOP (DELTA TIME)
let lastTime = 0;

function gameLoop(time) {
    if (!gameRunning) return;

    const delta = (time - lastTime) / 16.6;
    lastTime = time;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}

// UPDATE (PHYSICS)
function update(dt) {
    // INPUT → ACCELERATION
    if (keys["ArrowLeft"]) velocityX -= acceleration * dt;
    if (keys["ArrowRight"]) velocityX += acceleration * dt;

    // LIMIT SPEED
    velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, velocityX));

    // APPLY FRICTION
    velocityX *= friction;

    // MOVE CAR
    carX += velocityX * dt;

    // ROAD BOUNDS
    carX = Math.max(60, Math.min(280, carX));

    // ENEMY MOVE
    enemies.forEach(enemy => {
        enemy.y += speed * dt;

        // COLLISION
        if (
            carX < enemy.x + 60 &&
            carX + 60 > enemy.x &&
            carY < enemy.y + 100 &&
            carY + 100 > enemy.y
        ) {
            gameOver();
        }

        if (enemy.y > canvas.height) {
            enemy.y = -200;
            enemy.x = Math.random() * 220 + 60;
            speed += 0.2;
        }
    });

    speedMeter.innerText = "Speed: " + speed.toFixed(1);
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    ctx.drawImage(playerImg, carX, carY, 60, 100);

    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x + roadCurve, enemy.y, 60, 100);
    });
}

// GAME OVER
function gameOver() {
    gameRunning = false;
    engineSound.pause();
    crashSound.play();
    restartBtn.style.display = "inline-block";
}







