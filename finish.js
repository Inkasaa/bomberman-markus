import { enemies, finish } from "./game.js";

export class Finish {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = document.createElement("div");
        this.element.classList.add("finish")

        this.active = false;

        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.getElementById("game-container").appendChild(this.element);
    };

    checkCollision(playerX, playerY, playerSize) {
        // is player is fully inside finish square
        return (
            playerX > this.x &&
            playerX + playerSize < this.x + this.size &&
            playerY > this.y &&
            playerY + playerSize < this.y + this.size
        )
    };

    makeActive() {
        this.active = true;
        this.element.style.backgroundImage = `url("images/finish.svg")`;
    }
};

export function tryToActivateFinish() {
    if (enemies.size == 0) {
        finish.makeActive();
    }
};