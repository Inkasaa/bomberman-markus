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
        generalWallAttributes(domWall, wall)

        document.getElementById("game-container").appendChild(domWall);
    });
}
