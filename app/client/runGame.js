import { startSequence } from "../server/game.js";
import { state } from "../shared/state.js";
import { menuMusic } from "../sounds.js";
import { makeTextBar, resizeGameContainer } from "./initializeClient.js";
import { drawSolidWalls, drawWeakWalls, collapseWeakWall } from "./renderWalls.js";
import { drawPowerUps, pickUpItem, burnItem } from "./renderItems.js";
import { drawBombs, clearBombs } from "./renderBombs.js";
import { drawFlames } from "./renderFlames.js"
import { addPlayers, updatePlayers } from "./renderPlayers.js";
import { listenPlayerInputs } from "./inputListeners.js";

export const playerName = "Player1";
export let thisPlayer;
let levelinfo;
let livesinfo;
let oldlives;
let finished = false;
export const clientEvents = new Map();

export function setThisPlayer(player) {
    thisPlayer = player;
}

// Prevent default behavior for arrow keys to avoid page scrolling. Notice 'window'
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    };
});

export function nextLevel() {

    if (state.level >= 5) {
        toggleEndScreen();
        congrats.play();
        congrats.onended = () => {
            crowdClapCheer.play();
        };
        return;
    }

    document.getElementById("game-container").replaceChildren();

    startSequence(playerName);
    startSequenceClient();
    updateLevelInfo(state.level);
    updateLivesInfo(thisPlayer.lives);
    toggleFinished();
};


export function restartGame() {
    location.reload();
};

export function toggleFinished() {
    finished = !finished;
    //scoreTime = window.performance.now() - timeToSubtract;
}

export function updateLivesInfo(lives) {
    oldlives = lives;
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += `❤️`;
    };
    livesinfo.textContent = 'Lives: ' + livesText;
}

function updateLevelInfo(level) {
    levelinfo.textContent = `Level: ${level}`
}

function toggleEndScreen() {
    const victoryScreen = document.getElementById("victory");
    let msg = document.getElementById("victory-message");
    msg.textContent = `You finished with ${thisPlayer.lives} lives remaining, you absolute legend!`;
    victoryScreen.style.display == "flex" ? victoryScreen.style.display = "none" : victoryScreen.style.display = "flex";
}

function playMenuMusicOnInteraction() {
    menuMusic.play();
    // Remove the event listeners after the first interaction to avoid triggering play multiple times
    document.removeEventListener('click', playMenuMusicOnInteraction);
    document.removeEventListener('keydown', playMenuMusicOnInteraction);
}

/* function updateStartTime() {
    gameStartTime = window.performance.now() + 100;     // time buffer to load something
} */

export function startSequenceClient() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.style.visibility = "hidden";
    const startMenu = document.getElementById("start-menu");

    let tasks = [
        () => { resizeGameContainer() },
        () => {
            menuMusic.pause();
            menuMusic.currentTime = 0;
            startMenu.style.display = "none";
        },
        () => {
            //updateStartTime();
            [levelinfo, livesinfo] = makeTextBar();
            updateLivesInfo(thisPlayer.lives);
        },
        () => { document.body.classList.add("grey"); listenPlayerInputs();},
        () => {
            const gameContainer = document.getElementById("game-container");
            gameContainer.style.visibility = "visible";
        },

        // Render dom elements
        () => { drawSolidWalls(state.solidWalls); drawSolidWalls(state.surroundingWalls), drawWeakWalls(state.weakWalls) },
        () => { drawPowerUps(state.powerups); addPlayers(state.players) },
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


function runGame() {
    requestAnimationFrame(gameLoop);

    function gameLoop(timestamp) {
        if (state.finished === true) {
            state.finished = false;
            nextLevel();
            return
        };

        updatePlayers(state.players);
        if (oldlives !== thisPlayer.lives) updateLivesInfo(thisPlayer.lives);

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

        // requestAnimationFrame() always runs callback with 'timestamp' argument (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Start music on interaction to avoid errors
    document.addEventListener('click', playMenuMusicOnInteraction);
    document.addEventListener('keydown', playMenuMusicOnInteraction);

    // Start menu
    const startMenu = document.getElementById("start-menu");
    startMenu.style.display = "block";

    document.getElementById("start-btn").addEventListener("click", () => {
        startSequence(playerName);
        thisPlayer = state.players[0];
        startSequenceClient();
    });
});


