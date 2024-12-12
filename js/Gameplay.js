import Player from './Player.js'
import Ground from './Ground.js'
import CactiConroller from './CactiController.js';
import Score from './Score.js';


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = .45 
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 850;
const GAME_HEIGHT = 500;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 850;
const GROUND_HEIGHT = 500;
const GROUND_AND_CACTUS_SPEED = 0.5;

const CACTI_CONFIG = [
    {width: 50, height: 50, image:"images/enemy1.png"},
    {width: 50, height: 50, image:"images/enemy2.png"},
    {width: 50, height: 50, image:"images/enemy3.png"},
    {width: 50, height: 50, image:"images/enemy4.png"},
    {width: 50, height: 50, image:"images/enemy5.png"},
]

//GAME OBJECTS
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function createSprites() {
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
    const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

    player = new Player(ctx, playerWidthInGame, playerHeightInGame, minJumpHeightInGame, maxJumpHeightInGame, scaleRatio)

    ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_AND_CACTUS_SPEED, scaleRatio)

    const enemyImages = CACTI_CONFIG.map(enemy => {
        const image = new Image();
        image.src = enemy.image;
        return {
            image:image,
            width: enemy.width * scaleRatio,
            height: enemy.height * scaleRatio,
        };
    });

    cactiController = new CactiConroller(ctx, enemyImages, scaleRatio, GROUND_AND_CACTUS_SPEED);

    score = new Score(ctx, scaleRatio);
}

function setScreen() {
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio - 50;
    createSprites();
}

setScreen();

// Timeout for Safari mobile rotation
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
    screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
    const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    
    const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    
    // seeing if window is wider than the game width
    if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
        return screenWidth / GAME_WIDTH;
    }
    else {
        return screenHeight / GAME_HEIGHT;
    }
}

function showGameOver() {
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "white";
    const x = canvas.width / 4.5;
    const y = canvas.height / 3;
    ctx.fillText("GAME OVER", x, y);
}

function setupGameReset() {
    if(!hasAddedEventListenersForRestart) {
        hasAddedEventListenersForRestart = true;

        setTimeout(() => {
            window.addEventListener("keyup", reset, {once:true});
            window.addEventListener("touchstart", reset, {once:true});
        }, 1000);
    }
}

function reset() {
    hasAddedEventListenersForRestart = false;
    gameOver = false;
    waitingToStart = false;
    ground.reset();
    cactiController.reset();
    score.reset();
    gameSpeed = GAME_SPEED_START;
}

function showStartGameText() {
    const fontSize = 40 *scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 3;
    const x = canvas.width / 14;
    const y = canvas.height / 3;
    ctx.fillText("Tap Screen or Press Space to Start", x, y);
}

function updateGameSpeed(frameTimeDelta) {
    gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
    
    if(previousTime == null) {
        previousTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }

    const frameTimeDelta = currentTime - previousTime;
    previousTime = currentTime;

    clearScreen();

    if(!gameOver && !waitingToStart) {
        //Update game objects
        ground.update(gameSpeed, frameTimeDelta);
        cactiController.update(gameSpeed, frameTimeDelta)
        player.update(gameSpeed, frameTimeDelta);
        score.update(frameTimeDelta);
        updateGameSpeed(frameTimeDelta);
    }

    if(!gameOver && cactiController.collideWith(player)) {
        gameOver = true;
        setupGameReset();
        score.setHighScore()
    }

    // Draw game objects
    ground.draw();
    cactiController.draw();
    player.draw();
    score.draw();

    if(gameOver) {
        showGameOver();
    }

    if(waitingToStart) {
        showStartGameText();
    }


    requestAnimationFrame(gameLoop);

}

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, {once:true});
window.addEventListener("touchstart", reset, {once:true});
