import { gridStep, timedEvents } from "./game.js";
import { Timer } from "./timer.js";

class Wall {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = document.createElement("div");
        this.element.classList.add("wall")

        this.element.style.position = "absolute";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.getElementById("game-container").appendChild(this.element);
    };

    checkCollision(playerX, playerY, playerSize, slowDown = 1, collisions = 2) {
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
            let fromSmallest = Object.entries(diffs).sort(([, v1], [, v2]) => Math.abs(v1) - Math.abs(v2));

            // smoothly slip around corner
            if (
                slowDown == 1 &&    // one button down
                collisions == 1 &&  // one wall hit
                fromSmallest[1] &&
                Math.abs(fromSmallest[1][1]) < gridStep * 0.25 &&   // second smallest value is small = close to corner
                fromSmallest[0][0].startsWith('x') != fromSmallest[1][0].startsWith('x')
            ) {

                if (fromSmallest[0][0].startsWith('x')) {
                    return [playerX + fromSmallest[0][1] * 1.1, playerY + fromSmallest[1][1] * 1.1];
                } else {
                    return [playerX + fromSmallest[1][1] * 1.1, playerY + fromSmallest[0][1] * 1.1];
                }
            }


            let lowestItems = fromSmallest[0];

            // modify inputs to place player just outside wall
            if (lowestItems[0].startsWith('x')) {
                return [playerX + lowestItems[1], playerY];
            } else {
                return [playerX, playerY + lowestItems[1]];
            };
        };
    };
};

export class SolidWall extends Wall {
    constructor(x, y, size) {
        super(x, y, size);
        this.wallType = "solid";
        this.element.classList.add("solid");
    };
};

let timedCount = 0;

export class WeakWall extends Wall {
    constructor(x, y, size) {
        super(x, y, size);
        this.wallType = "weak";
        this.element.classList.add("weak");
    };

    collapse() {
        //this.element.style.background = 'orange';
        this.element.style.backgroundImage = 'url("/images/burningwall.svg")';
        //wallBreak.play();

        const countNow = timedCount;
        const timedCollapse = new Timer(() => {
            this.element.remove();
            timedEvents.delete(`collapse${countNow}`)
        }, 500);
        timedEvents.set(`collapse${countNow}`, timedCollapse)
        timedCount++;
    };
};
