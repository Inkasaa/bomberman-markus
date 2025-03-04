export class Wall {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = document.createElement("div");
        this.element.classList.add("wall")

        this.element.style.position = "absolute";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.getElementById("game-container").appendChild(this.element);
    }

    checkCollision(playerX, playerY, playerSize) {

        if (playerX + playerSize < this.x || playerX > this.x + this.size || playerY + playerSize < this.y || playerY > this.y + this.size) {
            // No collision: player is safely outside on at least one side, return input values
            return [playerX, playerY]
        } else {
            // find shortest direction out of collision
                const diffs = {
                    x1: this.x - (playerX + playerSize),  // this left to player right
                    x2: (this.x + this.size) - playerX,   // this right to player left
                    y1: this.y - (playerY + playerSize),  // this top to player bottom
                    y2: (this.y + this.size) - playerY    // this bottom to player top
                }
    
                // get key and value of item with lowest abs value
                let [lowestItems] = Object.entries(diffs).sort(([, v1], [, v2]) => Math.abs(v1) - Math.abs(v2))

                // Return player next to wall
                if (lowestItems[0].startsWith('x')) {
                    return [playerX + lowestItems[1], playerY]
                } else {
                    return [playerX, playerY + lowestItems[1]]
                }
        }
    }
}
