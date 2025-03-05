import { Bomb } from "./bomb.js";
import { bombTime, bounds, walls } from "./game.js";

export class Player {
    constructor(size, speed, x, y) {
        this.size = size;
        this.speed = speed
        this.x = x;
        this.y = y;

        this.element = document.createElement('div');
        this.element.id = "player";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.borderRadius = `${size / 5}px`;
        this.element.style.position = 'absolute';
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        document.getElementById("game-container").appendChild(this.element);

        // listen for bomb drop button
        this.bombs = 3;  // bombs limit
        this.bombPower = 1;
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
    }

    dropBomb() {
        if (this.bombs > 0) {
            new Bomb(this.x + this.size / 2, this.y + this.size / 2, this.bombPower)
            this.bombs--
            setTimeout(() => this.bombs++, bombTime)
        }
    }

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
        }
    }

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
        }
    }

    movePlayer(deltaTime) {
        // diagonal movement slowdown factor
        let slowDown = 1;
        if ((this.left || this.right) && (this.up || this.down)) {
            slowDown = 0.707;
        }

        // normalize speed for different framerates
        let moveDistance = this.speed * slowDown * deltaTime;

        // calculate new position
        let newX = this.x;
        let newY = this.y;
        if (this.left) newX -= moveDistance;
        if (this.right) newX += moveDistance;
        if (this.up) newY -= moveDistance;
        if (this.down) newY += moveDistance;        

        // find walls player collides with
        const collidingWalls = []
        for (const wall of walls) {
            if (wall.checkCollision(newX, newY, this.size).toString() != [newX, newY].toString()) {
                collidingWalls.push(wall);
                if (collidingWalls.length === 2) break; // Can't collide with more than two walls
            }
        }

        // update new coordinates based on possible collision
        if (collidingWalls.length === 1) {
            [this.x, this.y] = collidingWalls[0].checkCollision(newX, newY, this.size)
        } else if (collidingWalls.length === 2) {
            [newX, newY] = collidingWalls[0].checkCollision(newX, newY, this.size)
            [this.x, this.y] = collidingWalls[1].checkCollision(newX, newY, this.size)
        } else {
            // may still collide with outer boundaries
            // max: don't go negative (past left or top), min: don't go past right or bottom 
            this.x = Math.max(0, Math.min(newX, bounds.width - this.size));
            this.y = Math.max(0, Math.min(newY, bounds.height - this.size));
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}
