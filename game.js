import { Finish } from "./finish.js";
import { resizeGameContainer, getGridSize, setUpGame, makeWalls, makeLevelMap, makeTextBar } from "./initialize.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;                    // for placing elements, wall collapses
export let powerUpMap;                  // for placing elements, wall collapses

export let solidWalls = [];             // for player collisions
export const weakWalls = new Map();     // for player collisions
export const bombs = new Map();         // for player collisions
export const bombTime = 2500;
export const flames = new Map();        // for player collisions
export const timedEvents = new Map();
export const enemies = new Map();       // for player collisions
export const powerups = new Map();      // for player collisions
export let finish;

let levelinfo;
let livesinfo;
let scoreinfo;
let timeinfo;
const twoMinutes = 120000;
let score = 0;
let timeToSubtract = 0;

// Sound effects
export const menuMusic = new Audio("sfx/menuMusic.mp3");
menuMusic.loop = true;
export const walkingSound = new Audio ("sfx/walkingSound.mp3");
walkingSound.volume = 0.5;
walkingSound.loop = true;
export const enemyWalking = new Audio ("sfx/enemyWalking.mp3");
enemyWalking.volume = 0.2;
enemyWalking.loop = true;
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
export const wallBreak = new Audio("sfx/wallBreak2.mp3");
wallBreak.volume = 0.6;
export const flameUp = new Audio("sfx/flameUp.mp3");
export const bombUp = new Audio("sfx/bombUp.mp3");
export const finishLevel = new Audio("sfx/finishLevel.mp3");
export const gameLost1 = new Audio("sfx/sad-trombone.mp3");
export const gameLost2 = new Audio("sfx/sinister-laugh.mp3");
export const congrats = new Audio("sfx/congratulations.mp3");
export const crowdClapCheer = new Audio("sfx/cheering-and-clapping-crowd.mp3");

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
let finished = false;
let gameRunning = false;
let gameLost = false;
let scoreTime = 0;
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

export function toggleFinished() {
    finished = !finished;
    scoreTime = window.performance.now() - timeToSubtract;
}

function toggleEndScreen() {
    const victoryScreen = document.getElementById("victory");
    let msg = document.getElementById("victory-message");
    msg.textContent = `You scored ${Math.round(score)} points with ${player.lives} lives remaining, you absolute legend!`;
    victoryScreen.style.display == "flex" ? victoryScreen.style.display = "none" : victoryScreen.style.display = "flex";
}

export function nextLevel() {   

    let scoreAddition = ((twoMinutes - (scoreTime - timeToSubtract)) / 1000) * player.lives * level;
    if (scoreAddition > 0) score += scoreAddition;
    updateScoreInfo(score);

    if (level >= 5) {
        toggleEndScreen();
        congrats.play();
        congrats.onended = () => {
            crowdClapCheer.play();
        };
        //window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        return;
    }

    document.getElementById("game-container").replaceChildren();

    level++;
    timeToSubtract = window.performance.now(); // resets level clock  
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
    updateLevelInfo(level);
    updateLivesInfo(player.lives);
    toggleFinished();
};

function togglePause() {
    if (gameRunning && !gameLost) {
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
            walkingSound.pause();
            enemies.forEach(enemy => {
                enemy.enemyWalking.pause();
            });
            timeToSubtract -= window.performance.now(); // stored for unpausing 
        } else {
            pauseMenu.style.display = "none";
            for (const timed of timedEvents.values()) {
                timed.resume();
            }
            if (currentMusic) {
                currentMusic.play();
            }
            if (player.isMoving) {
                walkingSound.play();
            }

            enemies.forEach(enemy => {
                if (enemy.isMoving) {
                    enemy.enemyWalking.play();
                }
            });
            timeToSubtract += window.performance.now(); // this is used to display time
        }
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        togglePause();
    }
});

function updateTimeInfo(time) {
    let totalSeconds = Math.floor(time / 1000);
    let minutes = Math.floor(totalSeconds / 60); // Get minutes
    let seconds = totalSeconds % 60; // Get seconds
    timeinfo.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateLevelInfo(level) {
    levelinfo.textContent = `Level: ${level}`
}

export function updateLivesInfo(lives) {
    livesinfo.textContent = `Lives: ${lives}`
}

function updateScoreInfo(score) {
    if (score < 0) score = 0;
    scoreinfo.textContent = `Score: ${Math.round(score)}`
}

function startSequence() {
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

export function setGameLost() {
    gameLost = true;
}

function runGame() {
    const now = window.performance.now();
    timeToSubtract = now;
    lastFrameTime = now; // initialize to current timestamp
    gameRunning = true;
    requestAnimationFrame(gameLoop);

    function gameLoop(timestamp) {

        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
        lastFrameTime = timestamp;

        if (!paused && !gameLost) {
            if (!finished) updateTimeInfo(timestamp - timeToSubtract);
            player.movePlayer(deltaTime);
            enemies.forEach((en) => en.moveEnemy(deltaTime));
        }

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        if (gameRunning) { // Keep looping unless explicitly stopped
            requestAnimationFrame(gameLoop);
        };
    };
};

document.addEventListener("DOMContentLoaded", () => {
    // Pause menu
    document.getElementById("continue-btn").addEventListener("click", togglePause);
    //document.getElementById("restart-btn").addEventListener("click", restartGame);

    const restarts = document.querySelectorAll('.restart-btn');
    restarts.forEach(rs => rs.addEventListener('click', restartGame));

    // Start menu
    const startMenu = document.getElementById("start-menu");
    startMenu.style.display = "block";
    menuMusic.play();

    document.getElementById("start-btn").addEventListener("click", () => {
        menuMusic.pause();
        menuMusic.currentTime = 0;
        startMenu.style.display = "none";
        menuMusic.pause();
        menuMusic.currentTime = 0;
        startSequence();
        [levelinfo, livesinfo, scoreinfo, timeinfo] = makeTextBar();
        updateLivesInfo(player.lives);
        runGame();
    });

    document.getElementById("restart-btn-game-over").addEventListener("click", () => {
        document.getElementById("game-over-menu").style.display = "none";
        restartGame();
    });
});
