import { resizeGameContainer, setUpGame } from "./initialize.js";
import { Wall } from "./walls.js";
import { setGridSize } from "./bomb.js";

let bounds;
export let mult = 1.0;
let player;
let playerSize = 10
let speed = 10

let leftDown = false;
let rightDown = false;
let upDown = false;
let downDown = false;
let playerX = 0
let playerY = 0

let lastFrameTime = 0;

const walls = [];

// Prevent default behavior for arrow keys to avoid page scrolling
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
});

function makeWalls() {
    const size = bounds.width / 13;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const x = bounds.width / 13 * (1 + i * 2);
            const y = bounds.height / 11 * (1 + j * 2);
            walls.push(new Wall(x, y, size));
        }
    }
}

function movePlayer(deltaTime) {
    // diagonal movement slowdown factor
    let slowDown = 1;
    if ((leftDown || rightDown) && (upDown || downDown)) {
        slowDown = 0.707;
    }

    // normalize speed for different framerates
    let moveDistance = speed * slowDown * deltaTime;

    // calculate new position
    let newX = playerX;
    let newY = playerY;

    if (leftDown) newX -= moveDistance;
    if (rightDown) newX += moveDistance;
    if (upDown) newY -= moveDistance;
    if (downDown) newY += moveDistance;

    // find walls player collides with
    const collidingWalls = []
    for (const wall of walls) {
        if (wall.checkCollision(newX, newY, playerSize).toString() != [newX, newY].toString()) {
            collidingWalls.push(wall);
            if (collidingWalls.length === 2) break; // Won't collide with more than two walls
        }
    }

    // update new coordinates based on possible collision
    if (collidingWalls.length === 1) {
        [playerX, playerY] = collidingWalls[0].checkCollision(newX, newY, playerSize)
    } else if (collidingWalls.length === 2) {
        [newX, newY] = collidingWalls[0].checkCollision(newX, newY, playerSize)
        [playerX, playerY] = collidingWalls[1].checkCollision(newX, newY, playerSize)
    } else {
        // may still collide with outer boundaries
        // max: don't go negative (past left or top), min: don't go past right or bottom 
        playerX = Math.max(0, Math.min(newX, bounds.width - playerSize));
        playerY = Math.max(0, Math.min(newY, bounds.height - playerSize));
    }

    player.updatePosition(playerX, playerY)
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

/* function placeBomb(event) {
    if (event.key === " ") { // Spacebar to place a bomb
        bombs.push(new Bomb(playerX + playerSize / 2, playerY + playerSize / 2, mult));
    }
} */

addEventListener("DOMContentLoaded", function () {
    bounds = resizeGameContainer();
    setGridSize();
    [playerSize, speed, mult, player, playerX, playerY] = setUpGame(bounds);    
    makeWalls();

    document.addEventListener('keydown', move);
    document.addEventListener('keyup', stop);

    lastFrameTime = this.performance.now() // initialize to current timestamp

    gameLoop();

    function gameLoop(timestamp) {
        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed
        lastFrameTime = timestamp;

        movePlayer(deltaTime);
        // requestAnimationFrame() always runs callback with 'timestamp' (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    }
});
