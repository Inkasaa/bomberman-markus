import { Bomb } from "./bomb.js";
import { bombTime, bombs, bounds, enemies, finish, flames, nextLevel, powerups, solidWalls, timedEvents, weakWalls, walkingSound, playerDeath, playerDeath2, playerBombDeath, flameUp, bombUp, finishLevel, levelMap, updateLivesInfo, gridStep } from "./game.js";
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

        this.lives = 5;
        this.alive = true;
        this.bombAmount = 1;
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
        this.isMoving = false;
    };

    dropBomb() {
        const row = Math.floor((this.y + this.size / 2) / gridStep);
        const col = Math.floor((this.x + this.size / 2) / gridStep);

        if (this.alive && this.bombAmount > 0 && !levelMap[row][col]) {
            levelMap[row][col] = 'bomb';
            new Bomb(row, col, this.bombPower, 'player');
            this.bombAmount--;

            let countNow = timedCount;
            const timedBombsBack = new Timer(() => {
                levelMap[row][col] = '';
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
        updateLivesInfo(this.lives);

        // Stop walking sound when player dies
        walkingSound.pause();
        walkingSound.currentTime = 0;
        levelMap[0][0] = 'player';  // make sure enemies don't walk over player

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
                //document.getElementById("game-over-menu").style.display = "block";
                const gameOverMenu = document.getElementById("game-over-menu");
                const gifs = ["images/loser1.gif", "images/loser2.gif"];
                const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
                gameOverMenu.style.background = `rgba(0, 0, 0, 0.8) url("${randomGif}") no-repeat center center`;
                gameOverMenu.style.backgroundSize = "cover";
                gameOverMenu.style.display = "block";
            };
            timedEvents.delete(`resurrection${countNow}`)
        }, 2000);

        // Block enemies for 1 second after resurrection
        const timedEnemyBlock = new Timer(() => {
            if (this.lives > 0) {
                levelMap[0][0] = '';
            }
            timedEvents.delete(`enemyBlock${countNow}`)
        }, 3000);

        timedEvents.set(`resurrection${countNow}`, timedResurrection)
        timedEvents.set(`enemyBlock${countNow}`, timedEnemyBlock)
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

            // Walking sound logic
            const wasMoving = this.isMoving;
            this.isMoving = this.left || this.right || this.up || this.down;
            if (this.isMoving && !wasMoving) {
                walkingSound.play(); 
            } else if (!this.isMoving && wasMoving) {
                walkingSound.pause(); 
                walkingSound.currentTime = 0;
            }

            // Fatal, power-up and finish collisions after movement 

            // flames hit
            let playerBounds = this.element.getBoundingClientRect();
            for (const flame of flames.values()) {
                if (checkHit(playerBounds, flame)) {
                    playerBombDeath.play();
                    this.die();
                    break;
                };
            };

            // enemies hit
            for (const enemy of enemies.values()) {
                if (checkHit(playerBounds, enemy.element)) {
                    if (window.deathSound === 0) {
                        playerDeath.play();
                        window.deathSound = 1;
                     } else {
                        playerDeath2.play();
                        window.deathSound = 0;
                    }
                    this.die();
                    break;
                };
            };

            // power-ups hit
            for (const pow of powerups.values()) {
                if (checkHit(playerBounds, pow.element)) {
                    if (pow.powerType === "bomb") {
                        this.bombAmount++;
                        flameUp.play();
                    }
                    if (pow.powerType === "flame") {
                        this.bombPower++;
                        bombUp.play()
                    }
                    pow.pickUp();
                    break;
                };
            };

            // finish hit
            if (finish.active && finish.checkCollision(newX, newY, this.size)) {
                this.alive = false;
                finishLevel.play();
                const timedNextLevel = new Timer(() => {                    
                    nextLevel();
                    timedEvents.delete(`finishingTheLevel`);
                }, 4000);
                timedEvents.set(`finishingTheLevel`, timedNextLevel);
                timedCount++;
                finish.active = false;
            };
        };
    };
};

function checkHit(playerBounds, other) {
    const otherBounds = other.getBoundingClientRect();

    // No hit (false) if player is safely outside on at least one side
    return !(playerBounds.right < otherBounds.left ||
        playerBounds.left > otherBounds.right ||
        playerBounds.bottom < otherBounds.top ||
        playerBounds.top > otherBounds.bottom);
};