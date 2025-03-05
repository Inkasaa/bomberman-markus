import { Player } from "./player.js";
import { halfStep } from "./bomb.js";

export function resizeGameContainer() {
    const gameContainer = document.getElementById("game-container");

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // wide or narrow window? single screen Bomberman level is 13 * 11 squares
    if (windowWidth / windowHeight > 13 / 11) {
        gameContainer.style.height = windowHeight * 0.8 + "px";
        gameContainer.style.width = windowHeight * 0.8 * (13 / 11) + "px";
    } else {
        gameContainer.style.height = windowWidth * 0.8 * (11 / 13) + "px";
        gameContainer.style.width = windowWidth * 0.8 + "px";
    }

    const bounds = gameContainer.getBoundingClientRect();
    gameContainer.style.left = (windowWidth - bounds.width) / 2 + 'px';
    gameContainer.style.top = (windowHeight - bounds.height) / 2 + 'px';

    return bounds
}

export function setUpGame(bounds) {
    // multiplier from game-container size scales things (speed, placements) 
    // to different sized windows
    const multiplier = bounds.width / 1000; 

    const playerSpeed = 7 * multiplier;
    const playerSize = 55 * multiplier;    
    const playerX = halfStep - (playerSize / 2); // put player to top left    
    const playerY = halfStep - (playerSize / 2);

    const player = new Player(playerSize, playerSpeed, playerX, playerY);

    return player
}
