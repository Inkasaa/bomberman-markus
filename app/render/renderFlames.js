import { Timer } from "../timer.js";
import { timedEvents } from "./game.js";
import { gridStep, halfStep } from "./game.js";

let timedCount = 0;

export function drawHorizontalFlames(flames) {

    flames.forEach(() => {
        const domFlame = document.createElement('div');
        domFlame.classList.add("horizontal");
        if (i == 0) domFlame.classList.add("ends");
        domFlame.style.width = `${gridStep}px`;
        domFlame.style.height = `${halfStep}px`;
        domFlame.style.display = "none";
        gameContainer.appendChild(domFlame);

        const countNow = timedCount;
        const timedBurn = new Timer(() => {
            domFlame.remove();
            timedEvents.delete(`flameH${countNow}`)
        }, 500);
        timedEvents.set(`flameH${countNow}`, timedBurn)
        timedCount++;
    });
};

export function drawVerticalFlames(flames) { }


export function drawLeftFlameEnd(flame) { }
export function drawRightFlameEnd(flame) { }
export function drawUpFlameEnd(flame) { }
export function drawDownFlameEnd(flame) { }

