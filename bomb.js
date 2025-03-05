import { bombTime, mult } from "./game.js";
export let gridStep = 0;
export let halfStep = 0;

export function setGridSize() {
    const gameContainer = document.getElementById("game-container");
    gridStep = gameContainer.getBoundingClientRect().width / 13;
    halfStep = gridStep / 2;
}

function horizontalFlame(size, x, y) {
    let flame = document.createElement('div')
    flame.classList.add("flame");
    flame.style.width = `${gridStep}px`;
    flame.style.height = `${halfStep}px`;
    flame.style.left = `${x + (size / 2) - halfStep}px`;
    flame.style.top = `${y + (size / 2) - (halfStep / 2)}px`;
    document.getElementById("game-container").appendChild(flame);
    setTimeout(() => { flame.remove() }, 500);
}

function verticalFlame(size, x, y) {
    let flame = document.createElement('div')
    flame.classList.add("flame");
    flame.style.width = `${halfStep}px`;
    flame.style.height = `${gridStep}px`;
    flame.style.left = `${x + (size / 2) - (halfStep / 2)}px`;
    flame.style.top = `${y + (size / 2) - halfStep}px`;
    document.getElementById("game-container").appendChild(flame);
    setTimeout(() => { flame.remove() }, 500);
}

export class Bomb {
    constructor(x, y, power) {
        const size = mult * 50;
        // Align dropped bomb to grid
        this.x = (Math.floor(x / gridStep)) * gridStep + halfStep - size / 2;
        this.y = (Math.floor(y / gridStep)) * gridStep + halfStep - size / 2;

        this.size = size;
        this.power = power;

        this.element = document.createElement("div");
        this.element.classList.add("bomb")
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        document.getElementById("game-container").appendChild(this.element);

        setTimeout(() => this.explode(), bombTime); // Explode after 2 seconds
    }

    explode() {
        this.element.style.backgroundColor = "orange";

        // Draw flames of explosion
        horizontalFlame(this.size, this.x, this.y);
        verticalFlame(this.size, this.x, this.y);
        for (let i = 1; i <= this.power; i++) {

            /* TO DO
            if gridspot is occupied by:
            - level edge: don't draw, stop
            - solid wall: don't draw, stop
            - destructible wall: don't draw, stop, destroy wall
            - item: don't draw, stop, destroy item
            - bomb: don't draw, explode bomb (timeout to zero)

            - enemy: draw, continue, kill enemy
            - player: draw, continue, kill player

            Edges, walls, items and bombs could be saved on a 2d array and checked that way quite fast.
            Something like:
            if (level[3][11] == 'wallSolid' || level[3][11] == 'wallDest' || level[3][11] == 'item') {
                // stop drawing this direction, somehow destroy if necessary
            }

            Player and enemies would be handled in their collision detections
            */

            horizontalFlame(this.size, this.x + gridStep * i, this.y);
            horizontalFlame(this.size, this.x - gridStep * i, this.y);
            verticalFlame(this.size, this.x, this.y + gridStep * i);
            verticalFlame(this.size, this.x, this.y - gridStep * i);
        }



        // Create explosion effect
        setTimeout(() => {
            this.element.remove(); // Remove bomb after explosion effect
        }, 500);

        // Check for obstacles to destroy
        /*         obstacles.forEach((obstacle, index) => {
                    if (this.checkCollision(obstacle.x, obstacle.y, obstacle.size)) {
                        obstacle.element.remove(); // Remove the obstacle visually
                        obstacles.splice(index, 1); // Remove it from the array
                    }
                }); */
    }

    checkCollision(objX, objY, objSize) {
        return (
            // Let's not use radius for this.
            Math.abs(this.x - objX) < this.explosionRadius &&
            Math.abs(this.y - objY) < this.explosionRadius
        );
    }
}
