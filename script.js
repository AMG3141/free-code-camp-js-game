window.addEventListener("load", function() {
	// Set the canvas size to be the same as the image size to prevent distortion
	const canvas = document.getElementById("canvas1");
	const ctx = canvas.getContext("2d")
	canvas.width = 1280;
	canvas.height = 720;

	ctx.fillStyle = "white";
	ctx.lineWidth = 3;
	ctx.strokeStyle = "black";
	ctx.font = "40px Bangers";
	ctx.textAlign = "center";

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

	class Obstacle {
		constructor(game) {
			this.game = game;
			this.collisionX = Math.random() * this.game.width;
			this.collisionY = Math.random() * this.game.height;
			this.collisionRadius = 40;

			this.image = document.getElementById("obstacles")
			this.spriteWidth = 250;
			this.spriteHeight = 250;

			this.width = this.spriteWidth; // useful for scaling
			this.height = this.spriteHeight; // useful for scaling
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 70;

			this.frameX = Math.floor(Math.random() * 4);
			this.frameY = Math.floor(Math.random() * 3);
		}

		draw(context) {
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);//(file, sourcex, sy, swidth, sheight, destinationx, dy, dwidth, dheight)
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

		}
	}

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

	class Enemy {
		constructor(game) {
			this.game = game;
			this.collisionRadius = 30;
			this.speedX = Math.random() * 3 + 0.5;
			this.image = document.getElementById("toads")
			this.spriteWidth = 140;
			this.spriteHeight = 260;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;
			this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
			this.collisionY = this.game.topMargin + Math.random() * (this.game.height - this.game.topMargin);
			this.spriteX;
			this.spriteY;
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 4);
		}

		draw(context) {
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

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
			this.spriteX = this.collisionX - this.width / 2;
			this.spriteY = this.collisionY - this.height + 40;
			this.collisionX -= this.speedX;

			if (this.spriteX + this.width < 0 && !this.game.gameOver) {
				this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
				this.collisionY = this.game.topMargin + Math.random() * (this.game.height - this.game.topMargin);
				this.frameY = Math.floor(Math.random() * 4);
			}

			let collisionObjects = [this.game.player, ...this.game.obstacles]; // ... is spread operator (expands the elements in the array)
			collisionObjects.forEach(collisionObject => {
				let [ collision, distance, sumOfRadii, dx, dy ] = this.game.checkCollision(this, collisionObject);
				if (collision) {
					const unit_x = dx / distance;
					const unit_y = dy / distance;
					this.collisionX = collisionObject.collisionX + (sumOfRadii + 1) * unit_x;
					this.collisionY = collisionObject.collisionY + (sumOfRadii + 1) * unit_y;
				}
			});
		}
	}

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

	class Firefly extends Particle {
		update() {
			this.angle += this.va;
			this.collisionX += Math.cos(this.angle) * this.speedX;
			this.collisionY -= this.speedY;
			if (this.collisionY < 0 - this.radius) {
				this.markedForDeletion = true;
				this.game.removeGameObjects();
			}
		}
	}

	class Spark extends Particle {
		update() {
			this.angle += this.va * 0.5;
			this.collisionX -= Math.sin(this.angle) * this.speedX;
			this.collisionY -= Math.cos(this.angle) * this.speedY;
			if (this.radius > 0.1) this.radius -= 0.05;
			if (this.radius < 0.2) {
				this.markedForDeletion = true;
				this.game.removeGameObjects();
			}
		}
	}

	class Game {
		constructor(canvas) {
			this.canvas = canvas;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.topMargin = 260;
			this.debug = true;

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

	const game = new Game(canvas);
	game.init();

	let lastTime = 0;


	function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		game.render(ctx, deltaTime);
		requestAnimationFrame(animate);
	}

	animate(0);
});