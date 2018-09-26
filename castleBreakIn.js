import {game, Sprite} from "./sgc/sgc.js";
game.setBackground("grass.png");

class Wall extends Sprite {
    constructor(x, y, name, image) {
        super();
        this.x = x;
        this.y = y;
        this.name = name;
        this.setImage(image);
        this.accelerateOnBounce = false;
    }
}

new Wall(0, 0, "a spooky castle wall", "castle.png");
let leftWall = new Wall(0, 200, "Left side wall", "wall.png");
let rightWall = new Wall(game.displayWidth - 48, 200, "Right side wall", "wall.png");

class Princess extends Sprite {
    constructor() {
        super();
        this.name = "Princess Ann";
        this.setImage("ann.png");
        this.height = 48;
        this.width = 48;
        this.x = game.displayWidth / 2 - this.width / 2;
        this.y = game.displayHeight - this.height;
        this.speedWhenWalking = 150;
        this.lives = 3;
        this.accelerateOnBounce = false;
        this.defineAnimation("left", 9, 11);
        this.defineAnimation("right", 3, 5);
    }
    handleLeftArrowKey() {
        this.playAnimation("left");
        this.angle = 180;
        this.speed = this.speedWhenWalking;
    }
    handleRightArrowKey() {
        this.playAnimation("right");
        this.angle = 0;
        this.speed = this.speedWhenWalking;
    }
    handleGameLoop() {
        this.speed = 0;
        this.x = Math.max(this.width, this.x);
        this.x = Math.min(game.displayWidth - rightWall.width - this.width, this.x);
    }
    handleCollision(othersprite) {
    /*  Horizontally, Ann's image file is about one-third blank, one-third Ann, and one-third blank.
        Vertically, there is very little blank space. Ann's head is about one-fourth the height.
        The other sprite (Ball) should change angle if:
        1. it hits the middle horizontal third of the image, which is not blank, AND
        2. it hits the upper fourth, which is Ann's head. */
        let horizontalOffset = this.x - othersprite.x;
        let verticalOffset = this.y - othersprite.y;
        if (Math.abs(horizontalOffset) < this.width / 3
                && verticalOffset > this.height / 4) {
            // The new angle depends on the horizontal difference between sprites.
            othersprite.angle = 90 + 2 * horizontalOffset;
        }
        return false;
    }
    handleFirstGameLoop() {
        // Set up a text area to display the number of lives remaining.
        this.livesDisplay = game.createTextArea(game.displayWidth - 48 * 3, 20);
        this.updateLivesDisplay();
    }
    updateLivesDisplay() {
        game.writeToTextArea(this.livesDisplay, "Lives = " + this.lives);
    }
    LoseALife() {
        this.lives = this.lives - 1;
        this.updateLivesDisplay();
        if (this.lives > 0) {
            let ball = new Ball();
        }
        if (this.lives <= 0) {
            game.end("The mysterious stranger has escaped"
            + "\nPrincess Ann for now!"
            + "\n\nBetter luck next time.");
        }
    }
    addALife() {
        this.lives = this.lives + 1;
        this.updateLivesDisplay();
    }
}

let ann = new Princess();

class Ball extends Sprite {
    constructor() {
        super();
        this.x = game.displayWidth / 2 - this.width / 2;
        this.y = game.displayHeight / 2;
        this.height = 48;
        this.width = 48;
        this.name = "Soccer ball";
        this.setImage("ball.png");
        this.defineAnimation("spin", 0, 11);
        this.playAnimation("spin");
        this.speed = 1;
        this.angle = 50 + Math.random() * 80;
        Ball.ballsInPlay = Ball.ballsInPlay + 1;
    }
    handleGameLoop() {
        if (this.speed < 200) {
            this.speed = this.speed + 2;
        }
    }
    handleBoundaryContact() {
        game.removeSprite(this);
        Ball.ballsInPlay = Ball.ballsInPlay - 1;
        if (Ball.ballsInPlay === 0) {
            ann.LoseALife();
        }
    }
}

Ball.ballsInPlay = 0;

new Ball();

class Block extends Sprite {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.name = "A magic stone block";
        this.setImage("block1.png");
        this.accelerateOnBounce = false;
        Block.blocksToDestroy = Block.blocksToDestroy + 1;
    }
    handleCollision() {
        game.removeSprite(this);
        Block.blocksToDestroy = Block.blocksToDestroy - 1;
        if (Block.blocksToDestroy <= 0) {
            game.end("Congratulations!"
            + "\n\nPrincess Ann can continue her pursuit"
            + "\nof the mysterious stranger!");
        }
        return true;
    }
}

Block.blocksToDestroy = 0;

for (let i = 0; i < 5; i = i + 1) {
    new Block(200 + i * 48, 200);
}

class ExtraLifeBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.setImage("block2.png");
        Block.blocksToDestroy = Block.blocksToDestroy - 1;
    }
    handleCollision() {
        ann.addALife();
        return true;
    }
} 

new ExtraLifeBlock(200, 250);

class ExtraBallBlock extends Block {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.setImage("block3.png");
    }
    handleCollision() {
        super.handleCollision(); // call function in superclass
        new Ball(); // extend superclass behavior
        return true;
    }
} 

new ExtraBallBlock(300, 250);