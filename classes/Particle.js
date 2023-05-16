class Particle {
	constructor(game, x, y, colour) {
		this.game = game;
		this.collisionX = x;
		this.collisionY = y;
		this.colour = colour;
		this.radius = Math.floor(Math.random() * 10 + 5);
		this.speedX = Math.random() * 6 - 3;
		this.speedY = Math.random() * 2 + 0.5;
		this.angle = 0;
		this.va = Math.random() * 0.1 + 0.01;
		this.markedForDeletion = false;
	}

	draw(context) {
		context.save();

		context.fillStyle = this.colour;
		context.beginPath();
		context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
		context.fill();
		context.stroke();

		context.restore();
	}
}

export { Particle };