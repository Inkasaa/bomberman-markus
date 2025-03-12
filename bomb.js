import { bombs, bombTime, mult, gridStep, halfStep, levelMap, weakWalls, flames, timedEvents, powerUpMap, explosion, wallBreak, placeBomb, tickingBomb } from "./game.js";
import { Timer } from "./timer.js";

let flameCounter = 0;
let timedCount = 0;

function isEdge(row, col) {
    return (row < 0 || row > 10 || col < 0 || col > 12);
};

function isWall(row, col) {
    return (
        row >= 0 && row <= 10 &&
        col >= 0 && col <= 12 &&
        levelMap[row][col] &&
        typeof levelMap[row][col] == 'string' &&
        (
            levelMap[row][col].startsWith('weakWall') ||
            levelMap[row][col] == 'solidWall'
        )
    );
};

function isBomb(row, col) {
    return (
        row >= 0 && row <= 10 &&
        col >= 0 && col <= 12 &&
        levelMap[row][col] &&
        Array.isArray(levelMap[row][col]) &&
        levelMap[row][col][0] == 'bomb'
    );
}

function isPowerUp(row, col) {
    return (
        row >= 0 && row <= 10 &&
        col >= 0 && col <= 12 &&
        powerUpMap[row][col] &&
        Array.isArray(powerUpMap[row][col]) &&
        (powerUpMap[row][col][0].startsWith('bombUp') || powerUpMap[row][col][0].startsWith('flameUp'))
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

    flameCounter++
    flames.set(`flameH${flameCounter}`, flame)   // to map of flames

    const countNow = timedCount;
    const timedFlame = new Timer(() => {
        flame.remove();
        flames.delete(`flameH${flameCounter}`);
        timedEvents.delete(`flameH${countNow}`)
    }, 500);
    timedEvents.set(`flameH${countNow}`, timedFlame)
    timedCount++;
}

function verticalFlame(size, x, y) {
    let flame = document.createElement('div');
    flame.classList.add("flame");
    flame.style.width = `${halfStep}px`;
    flame.style.height = `${gridStep}px`;
    flame.style.left = `${x + (size / 2) - (halfStep / 2)}px`;
    flame.style.top = `${y + (size / 2) - halfStep}px`;
    document.getElementById("game-container").appendChild(flame);

    flameCounter++
    flames.set(`flameV${flameCounter}`, flame)   // to map of flames

    const countNow = timedCount;
    const timedFlame = new Timer(() => {
        flame.remove();
        flames.delete(`flameV${flameCounter}`);
        timedEvents.delete(`flameV${countNow}`);
    }, 500);
    timedEvents.set(`flameV${countNow}`, timedFlame);
    timedCount++;
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
        levelMap[this.mapRow][this.mapCol] = ['bomb', this];  // store reference to level map

        // Play sound when bomb is dropped
        placeBomb.play();

        // Start ticking sound
        tickingBomb.play();

        this.countNow = timedCount;
        const timedBomb = new Timer(() => {
            this.explode();
            timedEvents.delete(`bomb${this.countNow}`);
        }, bombTime);
        timedEvents.set(`bomb${this.countNow}`, timedBomb);
        timedCount++;
    };

    // explodeEarly removes the original timer and triggers the explosion
    explodeEarly() {
        if (timedEvents.has(`bomb${this.countNow}`)) {
            timedEvents.get(`bomb${this.countNow}`).cancel();
            timedEvents.delete(`bomb${this.countNow}`);
        }
        this.explode();
    }

    explode() {
        this.element.style.backgroundColor = "orange";
        explosion.play();

        // Stop ticking sound when bomb explodes
        tickingBomb.pause();
        tickingBomb.currentTime = 0; // Reset for next use

        // Check if any weak walls will be destroyed
        let willBreakWall = false;
        for (let i = 1; i <= this.power; i++) {
            if (isWeakWall(this.mapRow, this.mapCol + i) ||
                isWeakWall(this.mapRow, this.mapCol - i) ||
                isWeakWall(this.mapRow + i, this.mapCol) ||
                isWeakWall(this.mapRow - i, this.mapCol)) {
                willBreakWall = true;
                break; // No need to check further once we know a wall will break
            }
        }
        if (willBreakWall) {
            setTimeout(() => wallBreak.play(), 100); // Play wall break sound once if any weak wall is hit
        }

        // Draw flames of explosion in the middle
        horizontalFlame(this.size, this.x, this.y);
        verticalFlame(this.size, this.x, this.y);

        // Draw more flames in four directions 
        let [colPlus, colMinus, rowPlus, rowMinus] = [true, true, true, true];
        for (let i = 1; i <= this.power; i++) {

            // In four directions: Stop flames at walls, destroy weak walls, explode other bombs
            if (colPlus) {
                let foundWall = false;
                if (isWall(this.mapRow, this.mapCol + i)) {
                    this.tryToDestroy(this.mapRow, this.mapCol + i);
                    colPlus = false;
                    foundWall = true;
                };
                if (isBomb(this.mapRow, this.mapCol + i)) {
                    const bomb = levelMap[this.mapRow][this.mapCol + i][1];
                    levelMap[this.mapRow][this.mapCol + i] = '';
                    bomb.explodeEarly();
                }
                if (!foundWall && isPowerUp(this.mapRow, this.mapCol + i)) {
                    const powerUp = powerUpMap[this.mapRow][this.mapCol + i][1];
                    powerUp.burn();
                    colPlus = false;
                }
                if (isEdge(this.mapRow, this.mapCol + i)){
                    colPlus = false;
                }
            };
            if (colMinus) {
                let foundWall = false;
                if (isWall(this.mapRow, this.mapCol - i)) {
                    this.tryToDestroy(this.mapRow, this.mapCol - i);
                    colMinus = false;
                    foundWall = true;
                };
                if (isBomb(this.mapRow, this.mapCol - i)) {
                    const bomb = levelMap[this.mapRow][this.mapCol - i][1];
                    levelMap[this.mapRow][this.mapCol - i] = '';
                    bomb.explodeEarly();
                }
                if (!foundWall && isPowerUp(this.mapRow, this.mapCol - i)) {
                    const powerUp = powerUpMap[this.mapRow][this.mapCol - i][1];
                    powerUp.burn();
                    colMinus = false;
                }
                if (isEdge(this.mapRow, this.mapCol - i)){
                    colMinus = false;
                }
            };
            if (rowPlus) {
                let foundWall = false;
                if (isWall(this.mapRow + i, this.mapCol)) {
                    this.tryToDestroy(this.mapRow + i, this.mapCol);
                    rowPlus = false;
                    foundWall = true;
                };
                if (isBomb(this.mapRow + i, this.mapCol)) {
                    const bomb = levelMap[this.mapRow + i][this.mapCol][1];
                    levelMap[this.mapRow + i][this.mapCol] = '';
                    bomb.explodeEarly();
                }
                if (!foundWall && isPowerUp(this.mapRow + i, this.mapCol)) {
                    const powerUp = powerUpMap[this.mapRow + i][this.mapCol][1];
                    powerUp.burn();
                    rowPlus = false;
                }
                if (isEdge(this.mapRow + i, this.mapCol)){
                    rowPlus = false;
                }
            };
            if (rowMinus) {
                let foundWall = false;
                if (isWall(this.mapRow - i, this.mapCol)) {
                    this.tryToDestroy(this.mapRow - i, this.mapCol);
                    rowMinus = false;
                    foundWall = true;
                };
                if (isBomb(this.mapRow - i, this.mapCol)) {
                    const bomb = levelMap[this.mapRow - i][this.mapCol][1]
                    levelMap[this.mapRow - i][this.mapCol] = '';
                    bomb.explodeEarly();
                }
                if (!foundWall && isPowerUp(this.mapRow - i, this.mapCol)) {
                    const powerUp = powerUpMap[this.mapRow - i][this.mapCol][1];
                    powerUp.burn();
                    rowMinus = false;
                }
                if (isEdge(this.mapRow - i, this.mapCol)){
                    rowMinus = false;
                }
            };

            // draw flames if still allowed
            if (colPlus) horizontalFlame(this.size, this.x + gridStep * i, this.y);
            if (colMinus) horizontalFlame(this.size, this.x - gridStep * i, this.y);
            if (rowPlus) verticalFlame(this.size, this.x, this.y + gridStep * i);
            if (rowMinus) verticalFlame(this.size, this.x, this.y - gridStep * i);
        }

        // delay deleting bomb for a bit
        const timedExplotion = new Timer(() => {
            this.element.remove();
            bombs.delete(`bomb${this.mapCol}${this.mapRow}`);
            timedEvents.delete(`explosion${this.countNow}`);
            levelMap[this.mapRow][this.mapCol] = '';
        }, 500);
        timedEvents.set(`explosion${this.countNow}`, timedExplotion);
        timedCount++;
    };

    tryToDestroy(row, col) {
        let name = levelMap[row][col];
        if (name.startsWith('weakWall')) {
            weakWalls.get(name).collapse();

            const timedDeleteWall = new Timer(() => {
                weakWalls.delete(name);
                levelMap[row][col] = "";
                timedEvents.delete(`deleteWall${this.countNow}`)
            }, 500);

            timedEvents.set(`deleteWall${this.countNow}`, timedDeleteWall);
            timedCount++;
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

// Helper function to check for weak walls
function isWeakWall(row, col) {
    return (
        row >= 0 && row <= 10 &&
        col >= 0 && col <= 12 &&
        levelMap[row][col] &&
        typeof levelMap[row][col] === 'string' &&
        levelMap[row][col].startsWith('weakWall')
    );
}