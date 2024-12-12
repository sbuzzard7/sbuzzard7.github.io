
import Cactus from "./Cactus.js";

export default class CactiController {

    CACTUS_INTERVAL_MIN = 800;
    CACTUS_INTERVAL_MAX = 5000;

    nextCactusInterval = null;
    cacti = [];

    constructor(ctx, enemyImages, scaleRatio, speed) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.enemyImages = enemyImages;
        this.scaleRatio = scaleRatio;
        this.speed = speed;

        this.setNextCactusTime();
    }

    setNextCactusTime() {
        const num = this.getRandomNumber(this.CACTUS_INTERVAL_MIN, this.CACTUS_INTERVAL_MAX);

        this.nextCactusInterval = num;
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createCactus() {
        const index = this.getRandomNumber(0, this.enemyImages.length - 1);
        const enemyImage = this.enemyImages[index];
        const x = this.canvas.width * 1.5;
        const y = this.canvas.height - enemyImage.height -170 *this.scaleRatio;
        const cactus = new Cactus(this.ctx, x, y, enemyImage.width, enemyImage.height, enemyImage.image);

        this.cacti.push(cactus);
    }

    update(gameSpeed, frameTimeDelta) {
        if(this.nextCactusInterval <= 0) {
            this.createCactus();
            this.setNextCactusTime();
        }
        this.nextCactusInterval -= frameTimeDelta;

        this.cacti.forEach((cactus) => {
            cactus.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
        });

        this.cacti = this.cacti.filter((cactus) => cactus.x > -cactus.width);

    }

    draw() {
        this.cacti.forEach((cactus) => cactus.draw());
    }

    collideWith(sprite) {
        return this.cacti.some((cactus) => cactus.collideWith(sprite));
    }

    reset() {
        this.cacti = [];
    }
}