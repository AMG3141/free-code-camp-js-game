window.addEventListener("load", function() {
	// Set the canvas size to be the same as the image size to prevent distortion
	const canvas = document.getElementById("canvas1");
	const ctx = canvas.getContext("2d")
	canvas.width = 1280;
	canvas.height = 720;

	ctx.fillStyle = "white";
	ctx.lineWidth = 3;
	ctx.strokeStyle = "white";

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
		}

		draw(context) {
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

		update() {
			this.dx = this.game.mouse.x - this.collisionX;
			this.dy = this.game.mouse.y - this.collisionY;
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

			// Check for collisions with all obstacles
			this.game.obstacles.forEach(obstacle => {
				if (this.game.checkCollision(this, obstacle)) {
					console.log("collision");
				}
			});
		}
	}

	class Obstacle {
		constructor(game) {
			this.game = game;
			this.collisionX = Math.random() * this.game.width;
			this.collisionY = Math.random() * this.game.height;
			this.collisionRadius = 60;

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
			context.beginPath();
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
			context.save();
			context.globalAlpha = 0.5;
			context.fill();
			context.restore();
			context.stroke();
		}
	}

	class Game {
		constructor(canvas) {
			this.canvas = canvas;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.topMargin = 260;
			this.player = new Player(this);
			this.numberOfObstacles = 10;
			this.obstacles = [];
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

		}
		
		render(context) {
			this.player.draw(context);
			this.player.update();
			this.obstacles.forEach(obstacle => obstacle.draw(context))
		}

		checkCollision(a, b) {
			const dx = a.collisionX - b.collisionX;
			const dy = a.collisionY - b.collisionY;
			const distance = Math.hypot(dx, dy); // if something doesn't work, maybe check this (he says should be dy first but i think it shouldn't matter)
			const sumOfRadii = a.collisionRadius + b.collisionRadius;
			
			return distance < sumOfRadii;
		}

		init() {
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
	console.log(game);

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx);
		requestAnimationFrame(animate);
	}

	animate();
});