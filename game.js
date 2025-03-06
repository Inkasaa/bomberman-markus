import { resizeGameContainer, setGridSize, setUpGame, makeWalls } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;

export const walls = [];
export const bombTime = 2000;
let player;
let lastFrameTime = 0;

// Prevent default behavior for arrow keys to avoid page scrolling
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
});

addEventListener("DOMContentLoaded", function () {
    bounds = resizeGameContainer();
    [gridStep, halfStep] = setGridSize();
    [mult, player] = setUpGame(bounds);    
    walls.push(...makeWalls());
    lastFrameTime = this.performance.now() // initialize to current timestamp

    gameLoop();

    function gameLoop(timestamp) {
        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
        lastFrameTime = timestamp;

        player.movePlayer(deltaTime);
        // requestAnimationFrame() always runs callback with 'timestamp' (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    }
});
