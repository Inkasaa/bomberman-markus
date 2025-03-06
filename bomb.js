import { bombs, bombTime, mult, gridStep, halfStep } from "./game.js";

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
    constructor(x, y, power, name) {
        const size = mult * 50;

        // Align dropped bomb to grid
        this.mapX = Math.floor(x / gridStep);
        this.mapY = Math.floor(y / gridStep);
        this.x = this.mapX * gridStep + halfStep - size / 2;
        this.y = this.mapY * gridStep + halfStep - size / 2;
        this.size = size;

        this.owner = name;
        this.power = power;

        this.element = document.createElement("div");
        this.element.classList.add("bomb");
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.bounds = this.element.getBoundingClientRect();

        document.getElementById("game-container").appendChild(this.element);
        bombs.set(`bomb${this.mapX}${this.mapY}`, this);  // add bomb to map for collision checks

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
            // Remove bomb after explosion effect
            this.element.remove();
            bombs.delete(`bomb${this.mapX}${this.mapY}`)
        }, 500);
    }

    checkCollision(playerX, playerY, playerSize) {
        if (playerX + playerSize < this.x || playerX > this.x + this.size || playerY + playerSize < this.y || playerY > this.y + this.size) {
            // No collision: player is safely outside on at least one side, return input values
            return [playerX, playerY]
        } else {
            // find shortest direction out of collision
            const diffs = {
                x1: this.x - (playerX + playerSize),  // this left to player right
                x2: (this.x + this.size) - playerX,   // this right to player left
                y1: this.y - (playerY + playerSize),  // this top to player bottom
                y2: (this.y + this.size) - playerY    // this bottom to player top
            };

            // get key and value of item with lowest abs value
            let [lowestItems] = Object.entries(diffs).sort(([, v1], [, v2]) => Math.abs(v1) - Math.abs(v2));

            // modify inputs to place player just outside wall
            if (lowestItems[0].startsWith('x')) {
                return [playerX + lowestItems[1], playerY];
            } else {
                return [playerX, playerY + lowestItems[1]];
            }
        }
    }
}
