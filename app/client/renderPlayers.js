const gameContainer = document.getElementById("game-container");
const domPlayers = new Map();

// first draw, adding dom elements
export function addPlayers(players) {
    players.forEach(player => {
        const domPlayer = document.createElement("div");

        domPlayer.id = player.name;
        domPlayer.classList.add("player");
        domPlayer.style.width = `${player.size}px`;
        domPlayer.style.height = `${player.size}px`;
        domPlayer.style.position = 'absolute';
        domPlayer.style.transform = `translate(${player.x}px, ${player.y}px)`;

        gameContainer.appendChild(domPlayer);
        domPlayers.set(player.name, domPlayer);
    });
}

export function updatePlayers(players) {

    players.forEach(player => {
        const p = domPlayers.get(player.name);     

        p.style.transform = `translate(${player.x}px, ${player.y}px)`;
        if (!player.vulnerable) {
            p.classList.add("invulnerable");
        } else {
            p.classList.remove("invulnerable")
        }

        if (player.left) {
            p.classList.add("left");
        } else {
            p.classList.remove("left")
        }

        if (player.dead) {
            p.classList.add("dead");
        } else {
            p.classList.remove("dead")
        }        
    })
}

export function removePlayers(players) {
    players.forEach(player => {
        domPlayers.delete(player.name);
    })
}