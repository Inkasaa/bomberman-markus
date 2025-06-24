import { Finish } from "../finish.js";
import { resizeGameContainer, setUpGame, makeWalls, makeLevelMap, makeTextBar } from "../initialize.js";
import { inputs } from "../shared/inputs.js";
import { congrats, crowdClapCheer, levelMusic, menuMusic, tickingBomb, walkingSound } from "../sounds.js";
import { listenPlayerInputs } from "./inputListeners.js";
import { clearBombs, drawBombs } from "./renderBombs.js";
import { drawFlames } from "./renderFlames.js";
import { burnItem, drawPowerUps, pickUpItem } from "./renderItems.js";
import { addPlayers, updatePlayers } from "./renderPlayers.js";
import { collapseWeakWall, drawSolidWalls, drawWeakWalls } from "./renderWalls.js";
import { state } from "../shared/state.js";

export let bounds;
export let mult = 1.0;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;                    // for placing elements, wall collapses
export let powerUpMap;                  // powerups on different map

export const bombs = new Map();         // for player collisions
export const bombTime = 2500;
export const flames = new Map();        // for player collisions
export const timedEvents = new Map();
export const powerups = new Map();      // for player collisions

export let finish;

let levelinfo;
let livesinfo;
let scoreinfo;
let timeinfo;
const twoMinutes = 120000;
let score = 0;
let timeToSubtract = 0;
let gameStartTime;

let player;
let paused = false;
let finished = false;
let gameRunning = false;
let gameLost = false;
let scoreTime = 0;
let lastFrameTime = 0;
export let level = 1;
let currentMusic;

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

    let scoreAddition = ((twoMinutes - scoreTime) / 1000) * player.lives * level;
    if (scoreAddition > 0) score += scoreAddition;
    updateScoreInfo(score);

    if (level >= 5) {
        toggleEndScreen();
        congrats.play();
        congrats.onended = () => {
            crowdClapCheer.play();
        };
        return;
    }

    document.getElementById("game-container").replaceChildren();

    level++;
    timeToSubtract = window.performance.now(); // resets level clock  
    state.solidWalls = [];
    state.weakWalls.clear();
    bombs.clear();
    flames.clear();
    timedEvents.clear();
    state.enemies.clear();
    powerups.clear();

    //loadLevel();
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
            state.enemies.forEach(enemy => {
                enemy.enemyWalking.pause();
            });
            tickingBomb.pause();
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
            state.enemies.forEach(enemy => {
                if (enemy.isMoving) {
                    enemy.enemyWalking.play();
                }
            });
            if (bombs.size > 0) {
                tickingBomb.play();
            }
            timeToSubtract += window.performance.now(); // this is used to display time
            updateStartTime();
        };
    };
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        togglePause();
    }
});

function updateTimeInfo(time) {
    time = twoMinutes - time;
    if (time < 0) time = 0;
    let totalSeconds = Math.floor(time / 1000);
    let minutes = Math.floor(totalSeconds / 60); // Get minutes
    let seconds = totalSeconds % 60; // Get seconds
    timeinfo.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateLevelInfo(level) {
    levelinfo.textContent = `Level: ${level}`
}

export function updateLivesInfo(lives) {
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += `❤️`;
    };
    livesinfo.textContent = 'Lives: ' + livesText;
}

function updateScoreInfo(score) {
    if (score < 0) score = 0;
    scoreinfo.textContent = `Score: ${Math.round(score)}`
}

function updateStartTime() {
    gameStartTime = window.performance.now() + 100;     // time buffer to load something
}

function startSequence() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.style.visibility = "hidden";

    const startMenu = document.getElementById("start-menu");
    let tasks = [
        () => { bounds = resizeGameContainer(level); },
        //() => { [gridStep, halfStep] = getGridSize();[mult, player] = setUpGame(bounds) },
        () => { [gridStep, halfStep] = [50, 25];[mult, player] = setUpGame("Player1"); state.players.push(player); listenPlayerInputs() },       // Player initialized => serve should start game
        () => { levelMap = makeLevelMap(); powerUpMap = makeLevelMap(); },
        () => { makeWalls(level); },
        //() => { fillFlameAndBombPools(); },   // try without for now
        () => { finish = new Finish(gridStep * 12, gridStep * 10, gridStep); },
        () => {
            if (currentMusic) { currentMusic.pause(); currentMusic.currentTime = 0; }
            currentMusic = levelMusic[level - 1]; currentMusic.play();
        },
        () => {
            menuMusic.pause();
            menuMusic.currentTime = 0;
            startMenu.style.display = "none";
        },
        () => {
            updateStartTime();
            [levelinfo, livesinfo, scoreinfo, timeinfo] = makeTextBar();
            updateLivesInfo(player.lives);
        },
        () => { document.body.classList.add("grey"); },
        () => {
            const gameContainer = document.getElementById("game-container");
            gameContainer.style.visibility = "visible";
        },

        // Render dom elements
        () => { drawSolidWalls(state.solidWalls); drawSolidWalls(state.surroundingWalls), drawWeakWalls(state.weakWalls) },
        () => { drawPowerUps(powerups); addPlayers(state.players) },

        () => { runGame(); },
    ];

    function processNextTask() {
        if (tasks.length > 0) {
            let task = tasks.shift();
            task();
            requestAnimationFrame(processNextTask);
        }
    }

    requestAnimationFrame(processNextTask);
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

        // pause game when window not active
        window.onblur = () => { if (!paused) togglePause() };

        if (timestamp > gameStartTime && !paused && !gameLost) {
            if (!finished) updateTimeInfo(timestamp - timeToSubtract);
            player.movePlayer(deltaTime, inputs);
            inputs.bomb = false;

            state.enemies.forEach((en) => en.moveEnemy(deltaTime));
            updatePlayers(state.players);

            if (state.collapsingWalls.length > 0) {
                state.collapsingWalls.forEach(id => collapseWeakWall(id))
                state.collapsingWalls.length = 0; 
            }

            if (state.pickedItems.length > 0) {
                state.pickedItems.forEach(name => pickUpItem(name))
                state.pickedItems.length = 0;
            }

            if (state.burningItems.length > 0) {
                state.burningItems.forEach(name => burnItem(name))
                state.burningItems.length = 0;
            }

            if (state.newFlames.size > 0) {
                drawFlames(state.newFlames);
                state.newFlames.clear();
            }

            if (state.newBombs.size > 0) {
                drawBombs(state.newBombs);
                state.newBombs.clear();
            }

            if (state.removedBombs.size > 0) {
                clearBombs(state.removedBombs);
                state.removedBombs.clear();
            }
        }

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        if (gameRunning) { // Keep looping unless explicitly stopped
            requestAnimationFrame(gameLoop);
        };
    };
};

function playMenuMusicOnInteraction() {
    menuMusic.play();
    // Remove the event listeners after the first interaction to avoid triggering play multiple times
    document.removeEventListener('click', playMenuMusicOnInteraction);
    document.removeEventListener('keydown', playMenuMusicOnInteraction);
}

document.addEventListener("DOMContentLoaded", () => {
    // Pause menu
    document.getElementById("continue-btn").addEventListener("click", togglePause);
    const restarts = document.querySelectorAll('.restart-btn');
    restarts.forEach(rs => rs.addEventListener('click', restartGame));

    document.getElementById("restart-btn-game-over").addEventListener("click", () => {
        document.getElementById("game-over-menu").style.display = "none";
        restartGame();
    });

    // Start music on interaction to avoid errors
    document.addEventListener('click', playMenuMusicOnInteraction);
    document.addEventListener('keydown', playMenuMusicOnInteraction);

    // Start menu
    const startMenu = document.getElementById("start-menu");
    startMenu.style.display = "block";
    //menuMusic.play();    

    document.getElementById("start-btn").addEventListener("click", () => {
        startSequence();
    });
});
