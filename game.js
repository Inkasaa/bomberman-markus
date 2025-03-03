addEventListener("DOMContentLoaded", function () {
    const gameContainer = document.getElementById("game-container");
    let bounds;

    let mult = 1.0; // multiplier from size
    let player;
    let leftDown = false;
    let rightDown = false;
    let upDown = false;
    let downDown = false;

    let playerX = 0;
    let playerY = 0;
    let playerSize = 0;
    let moveSpeed = 10;

    function resizeGameContainer() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // wide or narrow window?
        if (width / height > 4 / 3) {
            gameContainer.style.height = height * 0.8 + "px";
            gameContainer.style.width = height * 0.8 * (4 / 3) + "px";
        } else {
            gameContainer.style.height = width * 0.8 * (3 / 4) + "px";
            gameContainer.style.width = width * 0.8 + "px";
        }

        bounds = gameContainer.getBoundingClientRect();
        gameContainer.style.left = (width - bounds.width) / 2 + 'px';
        gameContainer.style.top = (height - bounds.height) / 2 + 'px';
    }

    function setUpGame() {
        //update multiplier
        mult = gameContainer.getBoundingClientRect().width / 1000;
        moveSpeed = 10 * mult; // Set moveSpeed based on multiplier

        playerSize = 100 * mult;

        const player0 = document.createElement('div');
        player0.id = "player";
        
        // Initialize player position to center of container
        playerX = (gameContainer.clientWidth - playerSize) / 2;
        playerY = (gameContainer.clientHeight - playerSize) / 2;
        
        player0.style.width = playerSize + 'px';
        player0.style.height = playerSize + 'px';
        player0.style.borderRadius = playerSize / 2 + 'px';
        player0.style.position = 'absolute';

        player0.style.transform = `translate(${playerX}px, ${playerY}px)`;

        player = player0;
        gameContainer.appendChild(player0);

        bounds = gameContainer.getBoundingClientRect();
    }

    resizeGameContainer();
    setUpGame();
    
    // Prevent default behavior for arrow keys to avoid page scrolling
    window.addEventListener("keydown", function(e) {
        if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keydown', move);
    document.addEventListener('keyup', stop);

    gameLoop();

    function gameLoop() {
        nextPosition();
        updatePlayerPosition();
        requestAnimationFrame(gameLoop);
    }

    function nextPosition() {
        // Calculate diagonal movement slowdown factor
        let slowDown = 1;
        if ((leftDown || rightDown) && (upDown || downDown)) {
            slowDown = 0.707; // Approximately 1/sqrt(2)
        }
        
        // Calculate new position
        let newX = playerX;
        let newY = playerY;
        
        if (leftDown) newX -= moveSpeed * slowDown;
        if (rightDown) newX += moveSpeed * slowDown;
        if (upDown) newY -= moveSpeed * slowDown;
        if (downDown) newY += moveSpeed * slowDown;
        
        // Ensure player stays within container bounds
        playerX = Math.max(0, Math.min(newX, bounds.width - playerSize));
        playerY = Math.max(0, Math.min(newY, bounds.height - playerSize));
    }

    function updatePlayerPosition() {
        // Use transform for smoothness
        player.style.transform = `translate(${playerX}px, ${playerY}px)`;
    }

    function move(event) {
        switch (event.key) {
            case "ArrowLeft":
                leftDown = true;
                break;
            case "ArrowRight":
                rightDown = true;
                break;
            case "ArrowUp":
                upDown = true;
                break;
            case "ArrowDown":
                downDown = true;
                break;
        }
    }

    function stop(event) {
        switch (event.key) {
            case "ArrowLeft":
                leftDown = false;
                break;
            case "ArrowRight":
                rightDown = false;
                break;
            case "ArrowUp":
                upDown = false;
                break;
            case "ArrowDown":
                downDown = false;
                break;
        }
    }
});