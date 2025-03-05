import { Bomb } from "./bomb.js";
import { state } from "./state.js";

export class Player {
    constructor(size, x, y) {
        this.x = x;
        this.y = y;
        this.size = size;

        this.element = document.createElement('div');
        this.element.id = "player";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.borderRadius = `${size / 5}px`;
        this.element.style.position = 'absolute';
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        document.getElementById("game-container").appendChild(this.element);

        this.bombs = 3  // bombs limit
        document.addEventListener("keydown", (event) => {
            if (event.key === " ") { // drop bomb with space
                this.dropBomb();
            }
        });
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }

    dropBomb() {
        if (this.bombs > 0) {
            new Bomb(this.x + this.size / 2, this.y + this.size / 2)
            this.bombs--
            setTimeout(() => this.bombs++, state.bombTime)
        }
    }
}
