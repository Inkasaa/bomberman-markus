import { startValues, xy } from "./game.js";

const gameContainer = document.getElementById("game-container");

export function resizeGameContainer() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // wide or narrow window?
    if (width / height > 4 / 3) {
        gameContainer.style.height = height * 0.8 + "px";
        gameContainer.style.width = height * 0.8 * (4 / 3) + "px";
    } else {
        gameContainer.style.height = width * 0.8 * (3 / 4) + "px";
        gameContainer.style.width = width * 0.8 + "px";
    }

    startValues['bounds'] = gameContainer.getBoundingClientRect();
    gameContainer.style.left = (width - startValues['bounds'].width) / 2 + 'px';
    gameContainer.style.top = (height - startValues['bounds'].height) / 2 + 'px';
}

export function setUpGame() {
    //update multiplier
    startValues['multiplier'] = gameContainer.getBoundingClientRect().width / 1000;
    startValues['moveSpeed'] = 10 * startValues['multiplier']; // Set moveSpeed based on multiplier

    startValues['playerSize'] = 100 * startValues['multiplier'];

    const player0 = document.createElement('div');
    player0.id = "player";

    // Initialize player position to center of container
    xy.playerX = (gameContainer.clientWidth - startValues['playerSize']) / 2;
    xy.playerY = (gameContainer.clientHeight - startValues['playerSize']) / 2;

    player0.style.width = startValues['playerSize'] + 'px';
    player0.style.height = startValues['playerSize'] + 'px';
    player0.style.borderRadius = startValues['playerSize'] / 2 + 'px';
    player0.style.position = 'absolute';

    player0.style.transform = `translate(${xy.playerX}px, ${xy.playerY}px)`;

    startValues['player'] = player0;
    gameContainer.appendChild(player0);

    startValues['bounds'] = gameContainer.getBoundingClientRect();
}