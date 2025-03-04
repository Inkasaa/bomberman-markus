import { startValues, xy } from "./game.js";

const gameContainer = document.getElementById("game-container");

export function resizeGameContainer() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // wide or narrow window?
    // single screen Bomberman level has 6*5 unbreakable walls or 7*6 corridors,
    // so proportions should be (6+7)/(6+5) 
    if (width / height > 13 / 11) {
        gameContainer.style.height = height * 0.8 + "px";
        gameContainer.style.width = height * 0.8 * (13 / 11) + "px";
    } else {
        gameContainer.style.height = width * 0.8 * (11 / 13) + "px";
        gameContainer.style.width = width * 0.8 + "px";
    }

    startValues['bounds'] = gameContainer.getBoundingClientRect();
    gameContainer.style.left = (width - startValues['bounds'].width) / 2 + 'px';
    gameContainer.style.top = (height - startValues['bounds'].height) / 2 + 'px';
}

export function setUpGame() {
    //update multiplier
    startValues['multiplier'] = gameContainer.getBoundingClientRect().width / 1000;
    startValues['moveSpeed'] = 7 * startValues['multiplier']; // Set moveSpeed based on multiplier

    startValues['playerSize'] = 55 * startValues['multiplier'];

    const player0 = document.createElement('div');
    player0.id = "player";

    // Initialize player position to center of container
    xy.playerX = (gameContainer.clientWidth - startValues['playerSize']) / 2;
    xy.playerY = (gameContainer.clientHeight - startValues['playerSize']) / 2;

    player0.style.width = startValues['playerSize'] + 'px';
    player0.style.height = startValues['playerSize'] + 'px';
    player0.style.borderRadius = startValues['playerSize'] / 5 + 'px';
    player0.style.position = 'absolute';

    player0.style.transform = `translate(${xy.playerX}px, ${xy.playerY}px)`;

    startValues['player'] = player0;
    gameContainer.appendChild(player0);

    startValues['bounds'] = gameContainer.getBoundingClientRect();
}