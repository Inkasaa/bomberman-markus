import { finish } from "./server/game.js";
import { state } from "./shared/state.js";
import { mult } from "./shared/config.js";

export class Finish {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.element = document.createElement("div");
        this.element.classList.add("finish")

        this.active = false;

        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.getElementById("game-container").appendChild(this.element);
    };

    checkCollision(playerX, playerY, playerSize) {
        // is player is fully inside finish square, with some generosity added
        return (
            playerX + (5 * mult) >= this.x &&
            playerX + playerSize - (5 * mult) <= this.x + this.size &&
            playerY + (5 * mult) >= this.y &&
            playerY + playerSize - (5 * mult) <= this.y + this.size
        )
    };

    makeActive() {
        this.active = true;
        this.element.style.backgroundImage = `url("app/client/images/finish.svg")`;
    }
};

export function tryToActivateFinish() {
    if (state.enemies.size == 0) {
        finish.makeActive();        
    }
};

export function playFinishAnimation() {
    const finishImages = [
        'client/images/finish8.png',
        'client/images/finish7.png',
        'client/images/finish6.png',
        'client/images/finish5.png',
        'client/images/finish4.png',
        'client/images/finish3.png',
        'client/images/finish2.png',
        'client/images/finish1.png',
    ];

    let currentImageIndex = 0;
    const totalImages = finishImages.length;

    // Set initial image for the animation
    finish.element.style.backgroundImage = `url('${finishImages[currentImageIndex]}')`;

    // Set a timeout for how long you want the animation to run (e.g., 4 seconds)
    const animationDuration = 6000; // 6 seconds for the animation
    const startTime = Date.now(); // Record the start time

    // Create a timer to switch images in the animation sequence
    const animationInterval = setInterval(() => {
        currentImageIndex++;

        if (currentImageIndex < totalImages) {
            finish.element.style.backgroundImage = `url('${finishImages[currentImageIndex]}')`;
        } else {
            // Reset back to the first image to loop
            currentImageIndex = 0;
            finish.element.style.backgroundImage = `url('${finishImages[currentImageIndex]}')`;
        }

        // If animation runs for 6 seconds, stop it and revert to the static finish image
        if (Date.now() - startTime >= animationDuration) {
            clearInterval(animationInterval);  // Stop the animation
            finish.element.style.backgroundImage = `url('app/client/images/finishgrey.svg')`;  // Revert back to the static image
        }
    }, 100); // Change image every 100ms
}