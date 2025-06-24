import { Finish } from "../finish.js";
import { setUpGame, makeWalls, makeLevelMap } from "../initialize.js";
import { inputs } from "../shared/inputs.js";
import { listenPlayerInputs } from "../client/inputListeners.js";
import { state } from "../shared/state.js";

export let bounds;
export let mult = 0.65;
export let gridStep = 0;
export let halfStep = 0;
export let levelMap;                    // for placing elements, wall collapses
export let powerUpMap;                  // powerups on different map

export const bombs = new Map();         // for player collisions
export const bombTime = 2500;
export const flames = new Map();        // for player collisions
export const timedEvents = new Map();

export let finish;
let lastFrameTime;
let gameRunning;
let gameLost;

export function nextLevel() {
    state.level++;
    state.solidWalls = [];
    state.weakWalls.clear();
    bombs.clear();
    flames.clear();
    timedEvents.clear();
    state.enemies.clear();
    state.powerups.clear();

    startSequence();
};

export function startSequence(playerName = "") {
    state.players.length = 0;
    state.players.push(setUpGame(playerName, mult));
    bounds = { left: 0, right: 650, top: 0, bottom: 550, width: 650, height: 550 };
    [gridStep, halfStep] = [50, 25]; listenPlayerInputs();
    levelMap = makeLevelMap(); powerUpMap = makeLevelMap();
    makeWalls(state.level);
    finish = new Finish(gridStep * 12, gridStep * 10, gridStep);
    runGame();
}

export function setGameLost() {
    gameLost = true;
}

function runGame() {
    const now = window.performance.now();
    lastFrameTime = now; // initialize to current timestamp
    gameRunning = true;

    const interval = 10;
    setInterval(gameLoop, interval);

    function gameLoop(timestamp) {
        if (!gameLost) {
            lastFrameTime = timestamp;
            state.players.forEach(p => {
                p.movePlayer(interval * 0.08, inputs);
            })
            inputs.bomb = false;
            state.enemies.forEach((en) => en.moveEnemy(interval * 0.08));
        }
    };
};
