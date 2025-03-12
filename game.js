import { Finish } from "./finish.js";
import { resizeGameContainer, getGridSize, setUpGame, makeWalls, makeLevelMap } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;                    // for placing elements, wall collapses
export let powerUpMap;                  // for placing elements, wall collapses

export let solidWalls = [];           // for player collisions
export const weakWalls = new Map();     // for player collisions
export const bombs = new Map();         // for player collisions
export const bombTime = 2500;
export const flames = new Map();        // for player collisions
export const timedEvents = new Map();
export const enemies = new Map();        // for player collisions
export const powerups = new Map();        // for player collisions
export let finish;

// Sound effects
export const walkingSound = new Audio ("sfx/walkingSound.mp3");
walkingSound.volume = 0.5;
walkingSound.loop = true;
export const playerDeath = new Audio("sfx/playerDeath.mp3");
playerDeath.volume = 0.3;
export const playerDeath2 = new Audio("sfx/playerDeath2.mp3");
playerDeath2.volume = 0.3;
window.deathSound = 0;
export const playerBombDeath = new Audio("sfx/playerBombDeath.mp3");
playerBombDeath.volume = 0.5;
export const enemyDeath = new Audio("sfx/enemyDeath.mp3");
enemyDeath.volume = 0.3;
export const explosion = new Audio("sfx/explosion.mp3");
explosion.volume = 0.6;
export const placeBomb = new Audio("sfx/placeBomb.mp3");
export const tickingBomb = new Audio("sfx/tickingBomb.mp3");
tickingBomb.loop = true;
export const wallBreak = new Audio("sfx/wallBreak.mp3");
wallBreak.volume = 0.4;
export const flameUp = new Audio("sfx/flameUp.mp3");
export const bombUp = new Audio("sfx/bombUp.mp3");
export const finishLevel = new Audio("sfx/finishLevel.mp3");

// Background music for each level
export const levelMusic = [
    new Audio('sfx/level1music.mp3'),
    new Audio('sfx/level2music.mp3'),
    new Audio('sfx/level3music.mp3'),
    new Audio('sfx/level4music.mp3'),
    new Audio('sfx/level5music.mp3')
];

// Set all music to loop
levelMusic.forEach(track => {
    track.loop = true; // Loops infinitely
    track.volume = 0.5;
});


let player;
let paused = false;
let lastFrameTime = 0;
export let level = 1;
let currentMusic = null;

// Prevent default behavior for arrow keys to avoid page scrolling. Notice 'window'
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    };
});

export function restartGame() {
    location.reload();
};

export function nextLevel() {
    if (level >= 5) {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        return;
    }

    document.getElementById("game-container").replaceChildren();
    //document.getElementById("game-container").innerHTML = "";
    //document.onkeydown = null;
    level++;
    solidWalls = [];
    weakWalls.clear();
    bombs.clear();
    flames.clear();
    timedEvents.clear();
    enemies.clear();
    powerups.clear();

    // Stop current music and start new level’s music
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0; // Reset to start
    }
    currentMusic = levelMusic[level - 1];
    if (!paused) {
        currentMusic.play();
    }

    startSequence();
};

function togglePause() {
    paused = !paused;
    const pauseMenu = document.getElementById("pause-menu");

    if (paused) {
        pauseMenu.style.display = "block";
        for (const timed of timedEvents.values()) {
            timed.pause();
        }
        if (currentMusic) {
            currentMusic.pause();
        }
    } else {
        pauseMenu.style.display = "none";
        for (const timed of timedEvents.values()) {
            timed.resume();
        }
        if (currentMusic) {
            currentMusic.play();
        }
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        togglePause();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Pause menu
    document.getElementById("continue-btn").addEventListener("click", togglePause);
    document.getElementById("restart-btn").addEventListener("click", restartGame);

    // Start menu
    const startMenu = document.getElementById("start-menu");
    startMenu.style.display = "block";

    document.getElementById("start-btn").addEventListener("click", () => {
        startMenu.style.display = "none"; 
        startSequence();
        runGame();      
    });
    document.getElementById("restart-btn-game-over").addEventListener("click", () => {
        document.getElementById("game-over-menu").style.display = "none";
        restartGame();
    });
});

function startSequence(){
    bounds = resizeGameContainer();
    [gridStep, halfStep] = getGridSize();
    [mult, player] = setUpGame(bounds);
    levelMap = makeLevelMap();
    powerUpMap = makeLevelMap();
    makeWalls();
    finish = new Finish(gridStep * 12, gridStep * 10, gridStep);

    // Start music for the current level
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    currentMusic = levelMusic[level - 1];
    currentMusic.play();
}

function runGame(){
    lastFrameTime = window.performance.now(); // initialize to current timestamp
    requestAnimationFrame(gameLoop);

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
};
