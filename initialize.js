import { gridStep, halfStep, nameMap, solidWalls, weakWalls } from "./game.js";
import { Player } from "./player.js";
import { SolidWall, WeakWall } from "./walls.js";

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

export function getGridSize() {
    const gameContainer = document.getElementById("game-container");
    const gridStep = gameContainer.getBoundingClientRect().width / 13;
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

export function levelMap() {
    // 11 rows and 13 columns
    let map = new Array(11);
    for (let i = 0; i < map.length; i++)  map[i] = new Array(13);
    return map;
}

export function makeWalls() {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const mapX = (1 + i * 2);
            const mapY = (1 + j * 2);
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            const newSolid = new SolidWall(x, y, gridStep)
            solidWalls.push(newSolid);
            nameMap[mapY][mapX] = 'solidWall'
        }
    }


    while (weakWalls.size < 50) {
        const mapX = Math.floor(Math.random() * 13);
        const mapY = Math.floor(Math.random() * 11);

        // don't replace content or put anything in the top left and bottom right corners
        if (nameMap[mapY][mapX] || (mapX < 2 && mapY < 2) || (mapX > 10 && mapY > 9)) {
            continue
        }

        const x = gridStep * mapX;
        const y = gridStep * mapY;
        const name = `weakWall${mapX.toString().padStart(2, '0')}${mapY.toString().padStart(2, '0')}`
        const newWeak = new WeakWall(x, y, gridStep)        
        weakWalls.set(name, newWeak);
        nameMap[mapY][mapX] = name
    }
}
