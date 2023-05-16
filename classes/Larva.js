import { Firefly } from "./Firefly.js";
import { Spark } from "./Spark.js";

class Larva {
	constructor(game, x, y) {
		this.game = game;
		this.collisionX = x;
		this.collisionY = y;
		this.collisionRadius = 30;
		this.image = document.getElementById("larva");
		this.spriteWidth = 150;
		this.spriteHeight = 150;
		this.width = this.spriteWidth;
		this.height = this.spriteHeight;
		this.spriteX;
		this.spriteY;
		this.speedY = 1 + Math.random();
		this.frameX = 0;
		this.frameY = Math.floor(Math.random() * 2);
	}

	draw(context) {
		context.drawImage(this.image, this.frameX, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

		if (this.game.debug) {
			context.beginPath();
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
			context.save();
			context.globalAlpha = 0.5;
			context.fill();
			context.restore();
			context.stroke();
		}
	}

	update() {
		this.collisionY -= this.speedY;
		this.spriteX = this.collisionX - this.width / 2;
		this.spriteY = this.collisionY - this.height / 2 - 40;

		// Safety
		if (this.collisionY < this.game.topMargin) {
			this.markedForDeletion = true;
			this.game.removeGameObjects();
			if (!this.game.gameOver) this.game.score++;

			for (let i = 0; i < 3; i++) {
				this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, "yellow"));
			}
		}

		// Collisions with player and objects
		let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.eggs]; // ... is spread operator (expands the elements in the array)
		collisionObjects.forEach(collisionObject => {
			let [ collision, distance, sumOfRadii, dx, dy ] = this.game.checkCollision(this, collisionObject);
			if (collision) {
				const unit_x = dx / distance;
				const unit_y = dy / distance;
				this.collisionX = collisionObject.collisionX + (sumOfRadii + 1) * unit_x;
				this.collisionY = collisionObject.collisionY + (sumOfRadii + 1) * unit_y;
			}
		});

		// Collisions with enemies
		this.game.enemies.forEach(enemy => {
			if (this.game.checkCollision(this, enemy)[0]) {
				this.markedForDeletion = true;
				this.game.removeGameObjects();
				if (!this.game.gameOver) this.game.lostHatchlings++;
				for (let i = 0; i < 5; i++) {
					this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, "blue"));
				}
			}
		});
	}
}

export { Larva };