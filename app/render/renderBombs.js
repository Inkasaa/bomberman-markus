const gameContainer = document.getElementById("game-container");

export function drawBombs(bombs) {
    bombs.forEach(bomb => {
        const domBomb = document.createElement('div');

        domBomb.id = bomb.name;
        domBomb.classList.add("bomb");
        if (bomb.glowing) {
            domBomb.classList.add("glowing");
        }
        domBomb.style.width = `${bomb.size}px`;
        domBomb.style.height = `${bomb.size}px`;
        domBomb.style.left = `${bomb.x}px`;
        domBomb.style.top = `${bomb.y}px`;

        domBomb.style.display = "block";
        gameContainer.appendChild(domBomb);
    });
}

export function clearBombs(bombs) {
    bombs.forEach(bomb => {
        document.getElementById(bomb.name).remove();    // black version
        document.getElementById(bomb.name).remove();    // orange version
    })
}