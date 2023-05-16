import { Larva } from "./Larva.js";

class Egg {
	constructor(game) {
		this.game = game;
		this.collisionRadius = 40;
		this.margin = this.collisionRadius * 2;
		this.collisionX = this.margin +  Math.random() * (this.game.width - this.margin * 2);
		this.collisionY = this.game.topMargin + Math.random() * (this.game.height - this.game.topMargin - this.margin);
		this.image = document.getElementById("egg");
		this.spriteWidth = 110;
		this.spriteHeight =135;
		this.width = this.spriteWidth;
		this.height = this.spriteHeight;
		this.spriteX;
		this.spriteY;
		this.hatchTimer = 0;
		this.hatchInterval = 5000;
		this.markedForDeletion = false;
	}

	draw(context) {
		context.drawImage(this.image, this.spriteX, this.spriteY);
		if (this.game.debug) {
			context.beginPath();
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
			context.save();
			context.globalAlpha = 0.5;
			context.fill();
			context.restore();
			context.stroke();
			context.fillText((this.hatchTimer * 0.001).toFixed(0), this.collisionX, this.collisionY - this.collisionRadius * 3);
		}
	}

	update(deltaTime) {
		this.spriteX = this.collisionX - this.width / 2;
		this.spriteY = this.collisionY - this.height / 2 - 30;

		let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies]; // ... is spread operator (expands the elements in the array)
		collisionObjects.forEach(collisionObject => {
			let [ collision, distance, sumOfRadii, dx, dy ] = this.game.checkCollision(this, collisionObject);
			if (collision) {
				const unit_x = dx / distance;
				const unit_y = dy / distance;
				this.collisionX = collisionObject.collisionX + (sumOfRadii + 1) * unit_x;
				this.collisionY = collisionObject.collisionY + (sumOfRadii + 1) * unit_y;
			}
		});

		// Hatching logic
		if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
			this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
			this.markedForDeletion = true;
			this.game.removeGameObjects();
		} else {
			this.hatchTimer += deltaTime;
		}
	}
}

export { Egg };