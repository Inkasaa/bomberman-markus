import { Bomb } from "./bomb.js";
import { bombTime, bombs, bounds, flames, restartGame, solidWalls, timedEvents, weakWalls } from "./game.js";
import { Timer } from "./timer.js";

let timedCount = 0;

export class Player {
    constructor(size, speed, x, y) {
        this.size = size;
        this.speed = speed;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;

        this.lives = 3;
        this.alive = true;
        this.bombAmount = 3;
        this.bombPower = 2;

        this.element = document.createElement('div');
        this.element.id = "player";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.borderRadius = `${size / 5}px`;
        this.element.style.position = 'absolute';
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        document.getElementById("game-container").appendChild(this.element);

        // listen for bomb drop button
        document.addEventListener("keydown", (event) => {
            if (event.key === " ") { // drop bomb with space
                this.dropBomb();
            }
        });

        // listen for direction controls
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        // bind move() and stop() to this instance (instead of document) with arrow functions
        document.addEventListener('keydown', (event) => this.move(event));
        document.addEventListener('keyup', (event) => this.stop(event));
    };

    dropBomb() {
        if (this.bombAmount > 0) {
            new Bomb(this.x + this.size / 2, this.y + this.size / 2, this.bombPower, 'player');
            this.bombAmount--;

            let countNow = timedCount;
            const timedBombsBack = new Timer(() => {
                this.bombAmount++;
                timedEvents.delete(`bombsback${countNow}`);
            }, bombTime);
            timedEvents.set(`bombsback${countNow}`, timedBombsBack)
            timedCount++;
        };
    };

    move(event) {
        switch (event.key) {
            case "ArrowLeft":
                this.left = true;
                break;
            case "ArrowRight":
                this.right = true;
                break;
            case "ArrowUp":
                this.up = true;
                break;
            case "ArrowDown":
                this.down = true;
                break;
        };
    };

    stop(event) {
        switch (event.key) {
            case "ArrowLeft":
                this.left = false;
                break;
            case "ArrowRight":
                this.right = false;
                break;
            case "ArrowUp":
                this.up = false;
                break;
            case "ArrowDown":
                this.down = false;
                break;
        };
    };

    die() {
        const oldBR = this.element.style.background;
        //const oldBR = getComputedStyle(this.element).backgroundColor; // alternative
        this.element.style.background = 'red';
        this.alive = false;
        this.lives--;

        const countNow = timedCount;
        const timedResurrection = new Timer(() => {

            if (this.lives > 0) {
                this.x = this.startX;
                this.y = this.startY;
                this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
                this.element.style.background = oldBR;
                this.alive = true;
                // update counter too
            } else {
                alert("Game Over");
                restartGame();
            };

            timedEvents.delete(`resurrection${countNow}`)            
        }, 2000);
        timedEvents.set(`resurrection${countNow}`, timedResurrection)
        timedCount++;
    };



    movePlayer(deltaTime) {
        if (this.alive) {

            // diagonal movement slowdown factor
            let slowDown = 1;
            if ((this.left || this.right) && (this.up || this.down)) {
                slowDown = 0.707;
            };

            // normalize speed for diagonal movement and different framerates
            let moveDistance = this.speed * slowDown * deltaTime;

            // calculate next position
            let newX = this.x;
            let newY = this.y;
            if (this.left) newX -= moveDistance;
            if (this.right) newX += moveDistance;
            if (this.up) newY -= moveDistance;
            if (this.down) newY += moveDistance;

            // solid wall collisions
            const collidingWalls = [];
            for (const wall of solidWalls) {
                if (wall.checkCollision(newX, newY, this.size).toString() != [newX, newY].toString()) {
                    collidingWalls.push(wall);
                    if (collidingWalls.length == 1) break; // Can't collide with more than one solid wall
                };
            };

            // weak wall collisions
            for (const wall of weakWalls.values()) {
                if (wall.checkCollision(newX, newY, this.size).toString() != [newX, newY].toString()) {
                    collidingWalls.push(wall);
                    if (collidingWalls.length === 3) break; // Can't collide with more than three walls
                };
            };

            // adjust next coordinates based on collisions to walls
            for (const wall of collidingWalls) {
                [newX, newY] = wall.checkCollision(newX, newY, this.size);
            };

            // bomb collisions
            const collidingBombs = [];
            for (const bomb of bombs.values()) {
                if (bomb.checkCollision(newX, newY, this.size).toString() != [newX, newY].toString()) {
                    collidingBombs.push(bomb);
                } else {
                    // erase owner when player no longer on top of bomb
                    bomb.owner = '';
                };
            };

            // adjust next coordinates based on collisions to bombs
            for (const bomb of collidingBombs) {
                // No collision if bomb has owner
                if (!bomb.owner) {
                    [newX, newY] = bomb.checkCollision(newX, newY, this.size);
                };
            };

            // set coordinates based on possible collisions to area boundaries
            this.x = Math.max(0, Math.min(newX, bounds.width - this.size));
            this.y = Math.max(0, Math.min(newY, bounds.height - this.size));

            // apply movement
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

            // flames hit
            let playerBounds = this.element.getBoundingClientRect()
            for (const flame of flames.values()) {
                if (checkHit(playerBounds, flame)) {
                    this.die();
                    break;
                };
            };
        };
    };
};

function checkHit(playerBounds, flame) {
    const flameBounds = flame.getBoundingClientRect();

    // No hit (false) if player is safely outside on at least one side
    return !(playerBounds.right < flameBounds.left ||
        playerBounds.left > flameBounds.right ||
        playerBounds.bottom < flameBounds.top ||
        playerBounds.top > flameBounds.bottom);
};