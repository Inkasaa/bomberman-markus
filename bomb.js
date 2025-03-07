import { bombs, bombTime, mult, gridStep, halfStep, nameMap, weakWalls } from "./game.js";

function isWall(row, col) {
    return (
        row >= 0 && row <= 10 &&
        col >= 0 && col <= 12 &&
        nameMap[row][col] &&
        (
            nameMap[row][col].startsWith('weakWall') ||
            nameMap[row][col] == 'solidWall'
        )
    );
}

function horizontalFlame(size, x, y) {
    let flame = document.createElement('div');
    flame.classList.add("flame");
    flame.style.width = `${gridStep}px`;
    flame.style.height = `${halfStep}px`;
    flame.style.left = `${x + (size / 2) - halfStep}px`;
    flame.style.top = `${y + (size / 2) - (halfStep / 2)}px`;
    document.getElementById("game-container").appendChild(flame);
    setTimeout(() => { flame.remove() }, 500);
}

function verticalFlame(size, x, y) {
    let flame = document.createElement('div');
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
        this.mapCol = Math.floor(x / gridStep);
        this.mapRow = Math.floor(y / gridStep);
        this.x = this.mapCol * gridStep + halfStep - size / 2;
        this.y = this.mapRow * gridStep + halfStep - size / 2;
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
        bombs.set(`bomb${this.mapCol}${this.mapRow}`, this);  // add bomb to map for collision checks

        setTimeout(() => this.explode(), bombTime); // Explode after 2 seconds
    };

    explode() {
        this.element.style.backgroundColor = "orange";

        // Draw flames of explosion
        horizontalFlame(this.size, this.x, this.y);
        verticalFlame(this.size, this.x, this.y);

        let [colPlus, colMinus, rowPlus, rowMinus] = [true, true, true, true];

        for (let i = 1; i <= this.power; i++) {

            /* TO DO
            if gridspot is occupied by:
            - level edge: don't draw, stop
            x solid wall: don't draw, stop
            x weak wall: don't draw, stop, destroy wall
            - item: don't draw, stop, destroy item
            - bomb: ?, explode bomb (timeout to zero)

            - enemy: draw, continue, kill enemy
            - player: draw, continue, kill player

            Edges, walls, items and bombs could be saved on a 2d array and checked that way quite fast.
            Something like:
            if (level[3][11] == 'wallSolid' || level[3][11] == 'wallDest' || level[3][11] == 'item') {
                // stop drawing this direction, somehow destroy if necessary
            }

            Player and enemies would be handled in their collision detections
            */

            // Stop flames where they hit walls and destroy weak walls
            if (colPlus && isWall(this.mapRow, this.mapCol + i)) {
                this.tryToDestroy(this.mapRow, this.mapCol + i);
                colPlus = false;
            };
            if (colMinus && isWall(this.mapRow, this.mapCol - i)) {
                this.tryToDestroy(this.mapRow, this.mapCol - i);
                colMinus = false;
            };
            if (rowPlus && isWall(this.mapRow + i, this.mapCol)) {
                this.tryToDestroy(this.mapRow + i, this.mapCol);
                rowPlus = false;
            };
            if (rowMinus && isWall(this.mapRow - i, this.mapCol)) {
                this.tryToDestroy(this.mapRow - i, this.mapCol);
                rowMinus = false;
            };

            if (colPlus) horizontalFlame(this.size, this.x + gridStep * i, this.y);
            if (colMinus) horizontalFlame(this.size, this.x - gridStep * i, this.y);
            if (rowPlus) verticalFlame(this.size, this.x, this.y + gridStep * i);
            if (rowMinus) verticalFlame(this.size, this.x, this.y - gridStep * i);
        }

        // Create explosion effect
        setTimeout(() => {
            // Remove bomb after explosion effect
            this.element.remove();
            bombs.delete(`bomb${this.mapCol}${this.mapRow}`)
        }, 500);
    };

    tryToDestroy(row, col) {
        let name = nameMap[row][col];
        if (name.startsWith('weakWall')) {
            weakWalls.get(name).collapse();
            setTimeout(() => {
                weakWalls.delete(name);
                nameMap[row][col] = "";
            }, 500);
        };
    };

    checkCollision(playerX, playerY, playerSize) {
        if (playerX + playerSize < this.x || playerX > this.x + this.size || playerY + playerSize < this.y || playerY > this.y + this.size) {
            // No collision: player is safely outside on at least one side, return input values
            return [playerX, playerY];
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
            };
        };
    };
}
