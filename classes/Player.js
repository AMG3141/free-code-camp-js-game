class Player {
	constructor(game) {
		this.game = game;
		this.collisionX = this.game.width / 2;
		this.collisionY = this.game.height / 2;
		this.collisionRadius = 30;

		this.speedX = 0;
		this.speedY = 0;
		this.dx = 0;
		this.dy = 0;
		this.speedModifier = 5;

		this.image = document.getElementById("bull");
		this.spriteWidth = 255;
		this.spriteHeight = 256;
		this.width = this.spriteWidth;
		this.height = this.spriteHeight;
		this.spriteX;
		this.spriteY;
		this.frameX = 0;
		this.frameY = 0;
	}

	restart() {
		this.collisionX = this.game.width / 2;
		this.collisionY = this.game.height / 2;
		this.spriteX = this.collisionX - this.width / 2;
		this.spriteY = this.collisionY - this.height / 2 - 100;
	}

	draw(context) {
		if (this.frameX == 59) this.frameX = 0;
		context.drawImage(this.image, this.frameX++ * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight)

		if (this.game.debug) {
			context.beginPath();
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
			context.save();
			context.globalAlpha = 0.5;
			context.fill();
			context.restore();
			context.stroke();

			context.beginPath();
			context.moveTo(this.collisionX, this.collisionY); // define starting x and y coords of line
			context.lineTo(this.game.mouse.x, this.game.mouse.y); // define ending x and y coords of line
			context.stroke();
		}
	}

	update() {
		this.dx = this.game.mouse.x - this.collisionX;
		this.dy = this.game.mouse.y - this.collisionY;

		// Angle of bull
		const angle = Math.atan2(this.dy, this.dx);
		if (angle < -2.74 || angle > 2.74) this.frameY = 6;
		else if (angle < -1.96) this.frameY = 7;
		else if (angle < -1.17) this.frameY = 0;
		else if (angle < -0.39) this.frameY = 1;
		else if (angle < 0.39) this.frameY = 2;
		else if (angle < 1.17) this.frameY = 3;
		else if (angle < 1.96) this.frameY = 4;
		else if (angle < 2.74) this.frameY = 5;

		const distance = Math.hypot(this.dy, this.dx);
		if (distance > this.speedModifier) { // To stop the shaking when it should be still
			this.speedX = this.dx / distance || 0;
			this.speedY = this.dy / distance || 0;
		} else {
			this.speedX = 0;
			this.speedY = 0;
		}
		
		this.collisionX += this.speedX * this.speedModifier;
		this.collisionY += this.speedY * this.speedModifier;
		this.spriteX = this.collisionX - this.width / 2;
		this.spriteY = this.collisionY - this.height / 2 - 100;

		// Horizontal collision boundaries
		if (this.collisionX < 0 + this.collisionRadius) this.collisionX = 0 + this.collisionRadius;
		if (this.collisionY > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius;

		// Vertical collision boundaries
		if (this.collisionY < 0 + this.game.topMargin + this.collisionRadius) this.collisionY = 0 + this.game.topMargin + this.collisionRadius;
		if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius; 

		// Check for collisions with all obstacles
		this.game.obstacles.forEach(obstacle => {
			// [ distance < sumOfRadii, distance, sumOfRadii, dx, dy]
			let [ collision, distance, sumOfRadii, dx, dy ] = this.game.checkCollision(this, obstacle);
			if (collision) {
				const unit_x = dx / distance;
				const unit_y = dy / distance;
				this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
				this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
			}
		});
	}
}

export { Player };