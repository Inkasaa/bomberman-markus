const imagePaths = [
    "/images/finish.svg",
    "/images/loser1.gif",
    "/images/loser2.gif",
    "/images/burn.svg",
    "/images/background03.jpg",
    "/images/bluegrass.jpg",
    "/images/nalleRight3.png",
    "/images/nalleLeft3.png",
    "/images/nalleDead.png",
    "images/enemy.png",
    "/images/solidwall.svg",
    "/images/weakwall02.svg",
    "/images/burningwall.svg",
    "/images/bomb.svg",
    "/images/bomborange.svg",
    "/images/flamehor.svg",
    "/images/flameendsh.svg",
    "/images/flamevert.svg",
    "/images/flameendsv.svg",
    "/images/bombup.svg",
    "/images/flameup.svg",
    "/images/finishgrey.svg",
    "/images/victory2.svg",
];

const soundPaths = [
    "sfx/menuMusic.mp3",
    "sfx/playerWalking.mp3",
    "sfx/playerDeath.mp3",
    "sfx/playerDeath2.mp3",
    "sfx/playerBombDeath.mp3",
    "sfx/enemyDeath.mp3",
    "sfx/explosion.mp3",
    "sfx/placeBomb.mp3",
    "sfx/tickingBomb.mp3",
    "sfx/wallBreak.mp3",
    "sfx/flameUp.mp3",
    "sfx/bombUp.mp3",
    "sfx/finishLevel.mp3",
    "sfx/sad-trombone.mp3",
    "sfx/sinister-laugh.mp3",
    "sfx/congratulations.mp3",
    "sfx/cheering-and-clapping-crowd.mp3",
    "sfx/level1music.mp3",
    "sfx/level2music.mp3",
    "sfx/level3music.mp3",
    "sfx/level4music.mp3",
    "sfx/level5music.mp3",
    "sfx/enemyWalking.mp3",
];

export const loadedImages = {};
export function preloadImages(callback) {
    let assetsLoaded = 0;

    imagePaths.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            assetsLoaded++;
            if (assetsLoaded === imagePaths.length) {
                callback(); // Run callback after all loaded
            }
        };
        loadedImages[src] = img;
    });
}

export const loadedSounds = {};
export function preloadSounds(callback) {
    let soundsLoaded = 0;

    soundPaths.forEach((src) => {
        const audio = new Audio(src);
        audio.oncanplaythrough = () => {
            soundsLoaded++;
            if (soundsLoaded === soundPaths.length) {
                callback(); // Run callback after all loaded
            }
        };
        loadedSounds[src] = audio;
    });
}

