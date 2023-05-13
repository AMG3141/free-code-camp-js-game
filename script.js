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
		}
	}

	class Obstacle {
		constructor(game) {
			this.game = game;
			this.collisionX = Math.random() * this.game.width;
			this.collisionY = Math.random() * this.game.height;
			this.collisionRadius = 100;
		}

		draw(context) {
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
			this.player = new Player(this);
			this.numberOfObstacles = 5;
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

		init() {
			// Brute force algorithm to pack the circles such that they don't overlap, and have appropriate spacing between each other and the edges
			let attempts = 0;
			while ()
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