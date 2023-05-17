import { Game } from "./classes/Game.js";

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