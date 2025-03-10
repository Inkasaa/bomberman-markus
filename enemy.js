import { Bomb } from "./bomb.js";
import { bombTime, bombs, bounds, flames, gridStep, levelMap, restartGame, solidWalls, timedEvents, weakWalls } from "./game.js";
import { Timer } from "./timer.js";

let timedCount = 0;
let enemyCount = 0;

export class Enemy {
    constructor(size, speed, x, y) {
        this.size = size;
        this.speed = speed;
        this.startX = x;
        this.startY = y;
        this.x = x + (size / 4);
        this.y = y + (size / 4);

        this.element = document.createElement('div');
        this.element.id = `enemy${enemyCount}`;
        this.element.classList.add("enemy");
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.borderRadius = `${size / 5}px`;
        //this.element.style.position = 'absolute';
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        document.getElementById("game-container").appendChild(this.element);

        let col = Math.floor((x + size) / gridStep);
        let row = Math.floor((y + size) / gridStep);

        // coordinates for enemy: past, present and future
        this.prevMove;
        this.curr = [row, col];
        this.next;
        this.direction;

        /*         let directions = ["left", "right", "up", "down"];
                this.direction = directions[Math.floor(Math.random() * 4)];
                console.log("first direction is:", this.direction) */
    };

    die() {
        this.element.style.background = 'red';
        const countNow = timedCount;
        const timedDeath = new Timer(() => {
            this.element.delete();
            timedEvents.delete(`enemyDeath${countNow}`)
        }, 2000);
        timedEvents.set(`enemyDeath${countNow}`, timedDeath)
        timedCount++;
    };



    moveEnemy(deltaTime) {

        let moveDistance = this.speed * deltaTime;

        function isEmpty(row, col) {
            return (
                row >= 0 && row <= 10 &&
                col >= 0 && col <= 12 &&
                !levelMap[row][col]
            );
        }

        // next position
        if (this.direction == "left") this.x -= moveDistance;
        if (this.direction == "right") this.x += moveDistance;
        if (this.direction == "up") this.y -= moveDistance;
        if (this.direction == "down") this.y += moveDistance;


        // recalculate direction when moved to another cell
        if (!this.prevMove || this.curr[0] != Math.floor(this.y / gridStep) || this.curr[1] != Math.floor(this.x  / gridStep)) {

            // find directions with empty cells
            let availableDirs = []
            if (isEmpty(this.curr[0] - 1, this.curr[1])) availableDirs.push("left")
            if (isEmpty(this.curr[0] + 1, this.curr[1])) availableDirs.push("right")
            if (isEmpty(this.curr[0], this.curr[1] - 1)) availableDirs.push("up")
            if (isEmpty(this.curr[0], this.curr[1] + 1)) availableDirs.push("down")

            // don't go back the same way
            if (this.prevMove && availableDirs > 1) {
                for (let i = 0; i < availableDirs.length; i++) {
                    if (availableDirs[i] == "left" && this.prevMove == "right") {
                        availableDirs.splice(i, 1);
                        break;
                    };
                    if (availableDirs[i] == "right" && this.prevMove == "left") {
                        availableDirs.splice(i, 1);
                        break;
                    };
                    if (availableDirs[i] == "up" && this.prevMove == "down") {
                        availableDirs.splice(i, 1);
                        break;
                    };
                    if (availableDirs[i] == "down" && this.prevMove == "up") {
                        availableDirs.splice(i, 1);
                        break;
                    };
                };
            };

            if (availableDirs) {
                if (this.direction) this.prevMove = this.direction;
                this.direction = availableDirs[Math.floor(Math.random() * availableDirs.length)];
                this.curr = [Math.floor(this.y / gridStep), Math.floor(this.x / gridStep)]
            }
        };

        // apply movement
        if (this.direction) this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

        // flames hit
        let enemyBounds = this.element.getBoundingClientRect()
        for (const flame of flames.values()) {
            if (checkHit(enemyBounds, flame)) {
                this.die();
                break;
            };
        };

    };
};

function checkHit(enemyBounds, flame) {
    const flameBounds = flame.getBoundingClientRect();

    // No hit (false) if enemy is safely outside on at least one side
    return !(enemyBounds.right < flameBounds.left ||
        enemyBounds.left > flameBounds.right ||
        enemyBounds.bottom < flameBounds.top ||
        enemyBounds.top > flameBounds.bottom);
};