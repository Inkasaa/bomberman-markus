import { resizeGameContainer, getGridSize, setUpGame, makeWalls, levelMap } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let nameMap;

export const solidWalls = [];
//export let weakWalls = [];
export let weakWalls = new Map();

export let bombs = new Map();
export const bombTime = 2000;

let player;
let lastFrameTime = 0;

// Prevent default behavior for arrow keys to avoid page scrolling
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    };
});

addEventListener("DOMContentLoaded", function () {
    bounds = resizeGameContainer();
    [gridStep, halfStep] = getGridSize();
    [mult, player] = setUpGame(bounds);
    nameMap = levelMap()
    makeWalls();

    lastFrameTime = this.performance.now(); // initialize to current timestamp
    gameLoop();

    function gameLoop(timestamp) {
        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
        lastFrameTime = timestamp;

        player.movePlayer(deltaTime);

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    };
});
