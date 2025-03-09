import { resizeGameContainer, getGridSize, setUpGame, makeWalls, makeLevelMap } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;

export const solidWalls = [];
export const weakWalls = new Map();
export const bombs = new Map();
export const bombTime = 2000;
export const flames = new Map();
export const timedEvents = new Map();

let player;
let paused = false;
let lastFrameTime = 0;

// Prevent default behavior for arrow keys to avoid page scrolling. Notice 'window'
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    };
});

export function restartGame() {
    location.reload(); // Simple restart by reloading the page
};

function togglePause() {
    paused = !paused;
    const pauseMenu = document.getElementById("pause-menu");

    if (paused) {
        pauseMenu.style.display = "block";
        for (const timed of timedEvents.values()) {
            timed.pause();
        }
    } else {
        pauseMenu.style.display = "none";
        for (const timed of timedEvents.values()) {
            timed.resume();
        }

        // so player can't slide through walls during pause
        player.left = false;
        player.right = false;
        player.up = false;
        player.down = false;
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        togglePause();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("continue-btn").addEventListener("click", togglePause);
    document.getElementById("restart-btn").addEventListener("click", restartGame);
});

addEventListener("DOMContentLoaded", function () {
    bounds = resizeGameContainer();
    [gridStep, halfStep] = getGridSize();
    [mult, player] = setUpGame(bounds);
    levelMap = makeLevelMap()
    makeWalls();

    lastFrameTime = this.performance.now(); // initialize to current timestamp
    gameLoop();

    function gameLoop(timestamp) {

        if (!paused) {
            let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
            lastFrameTime = timestamp;
            player.movePlayer(deltaTime);
        }

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    };
});
