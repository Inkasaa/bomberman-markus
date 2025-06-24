import { inputs } from "../shared/inputs.js";

export function listenPlayerInputs() {
    document.addEventListener("keydown", (event) => {
        if (event.key === " ") { // drop bomb with space
            inputs.bomb = true;
        }
    });

    document.addEventListener('keydown', (event) => move(event));
    document.addEventListener('keyup', (event) => stop(event));
}


function move(event) {
    switch (event.key) {
        case "ArrowLeft":
            inputs.left = true;
            break;
        case "ArrowRight":
            inputs.right = true;
            break;
        case "ArrowUp":
            inputs.up = true;
            break;
        case "ArrowDown":
            inputs.down = true;
            break;
    };

    /* if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
        console.log("moving", event.key)
    } */

};

function stop(event) {
    switch (event.key) {
        case "ArrowLeft":
            inputs.left = false;
            break;
        case "ArrowRight":
            inputs.right = false;
            break;
        case "ArrowUp":
            inputs.up = false;
            break;
        case "ArrowDown":
            inputs.down = false;
            break;
    };
};