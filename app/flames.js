import { gridStep, halfStep } from "./render/game.js";

const gameContainer = document.getElementById("game-container");

export class Flame {
    constructor(x, y, width, height, dir, name) {
        this.x = x;
        this.y = y;
        this.active = false;
        this.direction = dir;   // H/V or L/R/U/D - for horizontal, vertical or left, right, up, down
        this.name = name;
        this.width = width;
        this.height = height;
    }
}

export class FlameH {
    constructor(bombsize, x, y) {
        this.x = x;
        this.y = y;
        this.active = false;

        this.elements = [];
        for (let i = 0; i < 2; i++) {
            let flame = document.createElement('div');
            flame.classList.add("flame");
            flame.classList.add("horizontal");
            if (i == 0) flame.classList.add("ends");
            flame.style.width = `${gridStep}px`;
            flame.style.height = `${halfStep}px`;
            flame.style.display = "none";

            this.elements.push(flame);
            gameContainer.appendChild(flame);
        }
    };
};

export class FlameV {
    constructor(bombsize, x, y) {
        this.x = x;
        this.y = y;
        this.active = false;

        this.elements = [];
        for (let i = 0; i < 2; i++) {
            let flame = document.createElement('div');
            flame.classList.add("flame");
            flame.classList.add("vertical");
            if (i == 0) flame.classList.add("ends");
            flame.style.width = `${halfStep}px`;
            flame.style.height = `${gridStep}px`;
            flame.style.display = "none";

            this.elements.push(flame);
            gameContainer.appendChild(flame);
        }
    };
};
