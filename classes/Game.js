import { Egg } from "./Egg.js";
import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Obstacle } from "./Obstacle.js";

class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.topMargin = 260;
		this.debug = false;

		this.score = 0;
		this.lostHatchlings = 0;
		this.winningScore = 30;
		this.gameOver = false;

		this.player = new Player(this);
		this.numberOfObstacles = 10;
		this.obstacles = [];
		this.maxEggs = 5;
		this.eggs = [];
		this.gameObjects = [];
		this.enemies = [];
		this.hatchlings = [];
		this.particles = [];

		this.fps = 70;
		this.timer = 0;
		this.interval = 1000 / this.fps;
		this.eggTimer = 0;
		this.eggInterval = 500;

		this.mouse = {
			x: this.width / 2,
			y: this.height / 2,
			pressed: false
		}

		canvas.addEventListener("mousedown", (e) => { // arrow function used so that this keyword comes from parent scope
			this.mouse.x = e.offsetX; // offsetX/Y: coordinate on the target node
			this.mouse.y = e.offsetY;
			this.mouse.pressed = true;
		});

		canvas.addEventListener("mouseup", (e) => { // arrow function used so that this keyword comes from parent scope
			this.mouse.x = e.offsetX; // offsetX/Y: coordinate on the target node
			this.mouse.y = e.offsetY;
			this.mouse.pressed = false;
		});

		canvas.addEventListener("mousemove", (e) => { // arrow function used so that this keyword comes from parent scope
			if (this.mouse.pressed) {
				this.mouse.x = e.offsetX; // offsetX/Y: coordinate on the target node
				this.mouse.y = e.offsetY;
			}
		});

		window.addEventListener("keydown", e => {
			if (e.key == "d") this.debug = !this.debug;
			else if (e.key == "r") this.restart()
		});
	}
	
	render(context, deltaTime) {
		if (this.timer > this.interval) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			this.gameObjects = [ ...this.eggs, ...this.obstacles, this.player, ...this.enemies, ...this.hatchlings, ...this.particles ];

			// Sort the game objects by their vertical position
			this.gameObjects.sort((a, b) => {
				return a.collisionY - b.collisionY;
			});
			
			this.gameObjects.forEach(object => {
				object.draw(context);
				object.update(deltaTime);
			});

			this.timer = 0;
		}

		this.timer += deltaTime;

		if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
			this.addEgg()
			this.eggTimer = 0;
		} else {
			this.eggTimer += deltaTime;
		}

		// Draw status text
		context.save();
		
		context.textAlign = "left";
		context.fillText("Score: " + this.score, 25, 50);
		if (this.debug) {
			context.fillText("Lost: " + + this.lostHatchlings, 25, 100);
		}

		context.restore();

		// Win / lose message
		if (this.score >= this.winningScore) {
			this.gameOver = true;
			context.save()

			context.fillStyle = "rgba(0,0,0,0.5)";
			context.fillRect(0, 0, this.width, this.height);

			context.fillStyle = "white";
			context.textAlign = "centre";

			context.shadowOffsetX = 4;
			context.shadowOffetY = 4;
			context.shadowColor = "black";
			let message1;
			let message2;

			if (this.lostHatchlings <= 5) {
				// Win
				message1 = "Bullseye!!!"
				message2 = "You bullied the bullies!";
			} else {
				// Lose
				message1 = "Bullocks!";
				message2 = "You lost " + this.lostHatchlings + " hatchlings, don't be a pushover!";
			}

			context.font = "130px Bangers";
			context.fillText(message1, this.width / 2, this.height / 2 - 20);
			context.font = "40px Bangers";
			context.fillText(message2, this.width / 2, this.height / 2 + 30);
			context.fillText("Final score " + this.score + ". Press 'R' to butt heads again!", this.width / 2, this.height / 2 + 80);

			context.restore();
		}
	}

	checkCollision(a, b) {
		const dx = a.collisionX - b.collisionX;
		const dy = a.collisionY - b.collisionY;
		const distance = Math.hypot(dx, dy); // if something doesn't work, maybe check this (he says should be dy first but i think it shouldn't matter)
		const sumOfRadii = a.collisionRadius + b.collisionRadius;
		
		return [ distance < sumOfRadii, distance, sumOfRadii, dx, dy];
	}

	addEgg() {
		this.eggs.push(new Egg(this));
	}

	addEnemy() {
		this.enemies.push(new Enemy(this));
	}

	removeGameObjects() {
		this.eggs = this.eggs.filter(egg => !egg.markedForDeletion);
		this.hatchlings = this.hatchlings.filter(larva => !larva.markedForDeletion);
		this.particles = this.particles.filter(particle => !particle.markedForDeletion);
	}

	restart() {
		this.player.restart();
		this.obstacles = [];
		this.eggs = [];
		this.gameObjects = [];
		this.enemies = [];
		this.hatchlings = [];
		this.particles = [];
		this.mouse = {
			x: this.width * 0.5,
			y: this.height * 0.5,
			pressed: false
		}
		this.score = 0;
		this.lostHatchlings = 0;
		this.gameOver = false;
		this.init();
	}

	init() {
		for (let i = 0; i < 5; i++ ) {
			this.addEnemy();
		}

		// Brute force algorithm to pack the circles such that they don't overlap, and have appropriate spacing between each other and the edges
		let attempts = 0;
		while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
			let testObstacle = new Obstacle(this);
			let overlap = false;

			this.obstacles.forEach(obstacle => {
				const dx = testObstacle.collisionX - obstacle.collisionX;
				const dy = testObstacle.collisionY - obstacle.collisionY;
				const distance = Math.hypot(dy, dx);
				const distanceBuffer = 100;
				const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;

				if (distance < sumOfRadii) {
					overlap = true;
				}
			});

			// have a look at about 45 minutes into the video, still really don't understand quite whats going on here...
			const margin = testObstacle.collisionRadius * 2;
			if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin) {
				this.obstacles.push(testObstacle);
			}

			attempts++;
		}
	}
}

export { Game };