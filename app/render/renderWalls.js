import { Timer } from "../timer.js";
import { timedEvents } from "./game.js";

function generalWallAttributes(domWall, wall) {
        domWall.classList.add("wall")
        domWall.style.position = "absolute";
        domWall.style.width = `${wall.size}px`;
        domWall.style.height = `${wall.size}px`;
        domWall.style.left = `${wall.x}px`;
        domWall.style.top = `${wall.y}px`;
}

export function drawSolidWalls(walls) {
    walls.forEach(wall => {
        const domWall = document.createElement("div");
        domWall.classList.add(`level-${wall.level}`, "solid");
        generalWallAttributes(domWall, wall)

        document.getElementById("game-container").appendChild(domWall);
    });
}

export function drawWeakWalls(walls) {
    walls.forEach(wall => {
        const domWall = document.createElement("div");
        domWall.classList.add(`level-${wall.level}`, "weak");
        domWall.id = wall.id;
        generalWallAttributes(domWall, wall)
        document.getElementById("game-container").appendChild(domWall);
    });
}

let timedCount = 0;

export function collapseWeakWall(id){
        const targetWall = document.getElementById(id);

        const countNow = timedCount;
        const timedCollapse = new Timer(() => {
            targetWall.remove();
            timedEvents.delete(`collapse${countNow}`)
        }, 500);
        timedEvents.set(`collapse${countNow}`, timedCollapse)
        timedCount++;
        targetWall.classList.add('burning');        
}