import { resizeGameContainer, setUpGame } from "./initialize.js";
import { Wall } from "./walls.js";
import { setGridSize } from "./bomb.js";

export let bounds;
export let mult = 1.0;
export const walls = [];
export const bombTime = 2000;
let player;
let lastFrameTime = 0;


// Prevent default behavior for arrow keys to avoid page scrolling
window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
});

function makeWalls() {
    const size = bounds.width / 13;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const x = bounds.width / 13 * (1 + i * 2);
            const y = bounds.height / 11 * (1 + j * 2);
            walls.push(new Wall(x, y, size));
        }
    }
}

addEventListener("DOMContentLoaded", function () {
    bounds = resizeGameContainer();
    setGridSize();
    player = setUpGame(bounds);    
    makeWalls();
    lastFrameTime = this.performance.now() // initialize to current timestamp

    gameLoop();

    function gameLoop(timestamp) {
        let deltaTime = (timestamp - lastFrameTime) / 16.7; // use deltaTime to normalize speed for different refresh rates
        lastFrameTime = timestamp;

        player.movePlayer(deltaTime);
        // requestAnimationFrame() always runs callback with 'timestamp' (milliseconds since the page loaded)
        requestAnimationFrame(gameLoop);
    }
});
