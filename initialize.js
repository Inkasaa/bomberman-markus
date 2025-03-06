import { gridStep, halfStep } from "./game.js";
import { Player } from "./player.js";
import { Wall } from "./walls.js";

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

export function setGridSize() {
    const gameContainer = document.getElementById("game-container");
    const  gridStep = gameContainer.getBoundingClientRect().width / 13;
    const halfStep = gridStep / 2;
    return [gridStep, halfStep]
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

    return [multiplier, player]
}

export function makeWalls() {
    const walls = []
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const x = gridStep * (1 + i * 2);
            const y = gridStep * (1 + j * 2);
            walls.push(new Wall(x, y, gridStep));
        }
    }
    return walls
}
