import { setUpGame, resizeGameContainer } from "./initialize.js";

export const startValues = {}
export const xy = {}

let bounds;
let mult = 1.0;
let player;
let playerSize = 10
let speed = 10

let leftDown = false;
let rightDown = false;
let upDown = false;
let downDown = false;
let playerX = 0
let playerY = 0

function getValues() {
    playerSize = startValues.playerSize
    speed = startValues.moveSpeed
    bounds = startValues.bounds
    mult = startValues.multiplier
    player = startValues.player
    playerX = xy.playerX
    playerY = xy.playerY
}

// Prevent default behavior for arrow keys to avoid page scrolling
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
});

function nextPosition() {
    // Calculate diagonal movement slowdown factor
    let slowDown = 1;
    if ((leftDown || rightDown) && (upDown || downDown)) {
        slowDown = 0.707; // Approximately 1/sqrt(2)
    }

    // Calculate new position
    let newX = xy.playerX;
    let newY = xy.playerY;

    if (leftDown) newX -= speed * slowDown;
    if (rightDown) newX += speed * slowDown;
    if (upDown) newY -= speed * slowDown;
    if (downDown) newY += speed * slowDown;

    // Ensure player stays within container bounds
    xy.playerX = Math.max(0, Math.min(newX, bounds.width - playerSize));
    xy.playerY = Math.max(0, Math.min(newY, bounds.height - playerSize));
}

function updatePlayerPosition() {
    // Use transform for smoothness (often hardware accelerated)
    player.style.transform = `translate(${xy.playerX}px, ${xy.playerY}px)`;
}

function move(event) {
    switch (event.key) {
        case "ArrowLeft":
            leftDown = true;
            break;
        case "ArrowRight":
            rightDown = true;
            break;
        case "ArrowUp":
            upDown = true;
            break;
        case "ArrowDown":
            downDown = true;
            break;
    }
}

function stop(event) {
    switch (event.key) {
        case "ArrowLeft":
            leftDown = false;
            break;
        case "ArrowRight":
            rightDown = false;
            break;
        case "ArrowUp":
            upDown = false;
            break;
        case "ArrowDown":
            downDown = false;
            break;
    }
}

addEventListener("DOMContentLoaded", function () {
    resizeGameContainer();
    setUpGame();
    getValues();

    document.addEventListener('keydown', move);
    document.addEventListener('keyup', stop);

    gameLoop();

    function gameLoop() {
        nextPosition();
        updatePlayerPosition();
        requestAnimationFrame(gameLoop);
    }
});
