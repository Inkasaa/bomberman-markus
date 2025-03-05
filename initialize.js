export function resizeGameContainer() {
    const gameContainer = document.getElementById("game-container");

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // wide or narrow window? single screen Bomberman level is 13 * 11 squares
    if (windowWidth / windowHeight > 13 / 11) {
        gameContainer.style.height = windowHeight * 0.8 + "px";
        gameContainer.style.width = windowHeight * 0.8 * (13 / 11) + "px";
    } else {
        gameContainer.style.height = windowWidth * 0.8 * (11 / 13) + "px";
        gameContainer.style.width = windowWidth * 0.8 + "px";
    }

    const bounds = gameContainer.getBoundingClientRect();
    gameContainer.style.left = (windowWidth - bounds.width) / 2 + 'px';
    gameContainer.style.top = (windowHeight - bounds.height) / 2 + 'px';

    return bounds
}

export function setUpGame(bounds) {
    const gameContainer = document.getElementById("game-container");

    //update multiplier
    const multiplier = bounds.width / 1000;
    const speed = 7 * multiplier;

    const playerSize = 55 * multiplier;

    const player0 = document.createElement('div');
    player0.id = "player";

    // Initialize player position to center of container
    const playerX = (bounds.width - playerSize) / 2;
    const playerY = (bounds.height - playerSize) / 2;

    player0.style.width = playerSize + 'px';
    player0.style.height = playerSize + 'px';
    player0.style.borderRadius = playerSize / 5 + 'px';
    player0.style.position = 'absolute';

    player0.style.transform = `translate(${playerX}px, ${playerY}px)`;

    const player = player0;
    gameContainer.appendChild(player0);

    return [playerSize, speed, multiplier, player, playerX, playerY]
}
