import { resizeGameContainer, getGridSize, setUpGame, makeWalls, makeLevelMap } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;                    // for placing elements, wall collapses

export const solidWalls = [];           // for player collisions
export const weakWalls = new Map();     // for player collisions
export const bombs = new Map();         // for player collisions
export const bombTime = 2500;
export const flames = new Map();        // for player collisions
export const timedEvents = new Map();
export const enemies = new Map();        // for player collisions

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

    //console.log(enemies)

    lastFrameTime = this.performance.now(); // initialize to current timestamp
    requestAnimationFrame(gameLoop);
    //gameLoop();    

    function gameLoop(timestamp) {

        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
        lastFrameTime = timestamp;

        if (!paused) {                        
            player.movePlayer(deltaTime);

            for (const en of enemies.values()){
                en.moveEnemy(deltaTime);
            }
        }

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    };
});
