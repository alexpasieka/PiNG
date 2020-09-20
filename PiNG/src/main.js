import Utilities from './utilities.js'
import Point from './classes/Point.js'
import Level from './classes/Level.js'
import Ball from './classes/Ball.js'
import Cup from './classes/Cup.js'
import Obstacle from './classes/Obstacle.js'
import { Howl } from 'howler';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
// flips the canvas' y-axis
ctx.transform(1, 0, 0, -1, 0, canvas.height);

const nextButton = document.querySelector('#next');
const replayButton = document.querySelector('#replay');
const resetButton = document.querySelector('#reset');
const title = document.querySelector('#title');
const score = document.querySelector('#score');
const overlay = document.querySelector('#canvasOverlay');
const startOver = document.querySelector('#startOver');
const intro = document.querySelector('#titleScreen');

const ballRadius = 12;

let level1 = new Level(
	new Ball(new Point(100, 200), ballRadius),
	new Cup(new Point(600, 0), 75, 75),
	[]
);
let level2 = new Level(
	new Ball(new Point(100, 200), ballRadius),
	new Cup(new Point(600, 0), 75, 75),
	[new Obstacle(new Point(300, 0), 100, 300)]
);
let level3 = new Level(
	new Ball(new Point(100, 200), ballRadius),
	new Cup(new Point(600, 0), 75, 75),
	[new Obstacle(new Point(300, 0), 100, 300, new Point(400, 0), 100)]
);
let level4 = new Level(
	new Ball(new Point(100, 200), ballRadius),
	new Cup(new Point(600, 0), 75, 75),
	[new Obstacle(new Point(200, 100), 50, 50, new Point(200, 300), 100),
	 new Obstacle(new Point(500, 300), 50, 50, new Point(500, 100), 100)]
);
let level5 = new Level(
	new Ball(new Point(100, 200), ballRadius),
	new Cup(new Point(600, 0), 75, 75),
	[new Obstacle(new Point(300, 200), 100, 300, new Point(300, 400), 100),
	 new Obstacle(new Point(300, -200), 100, 300, new Point(300, 0), 100)]
);

let levels = [];
levels.push(level1);
levels.push(level2);
levels.push(level3);
levels.push(level4);
levels.push(level5);

let currentLevel = null;

window.onmousedown = e => {
	if(currentLevel) {
		currentLevel.mousePos = Utilities.getMousePos(e, canvas);
		// getting distance between mouse and ball center
		let distance = Math.sqrt(Math.pow(currentLevel.ball.x - currentLevel.mousePos.x, 2) + Math.pow(currentLevel.ball.y - currentLevel.mousePos.y, 2));
		if (distance < currentLevel.ball.radius) {
			currentLevel.dragging = true;
		}
	}
};
window.onmousemove = e => {
	if(currentLevel) {
		if (currentLevel.dragging) {
			currentLevel.mousePos = Utilities.getMousePos(e, canvas);
		}
	}
};

window.onmouseup = e => {
	// you can only shoot the ball once
	if(currentLevel) {
		if (currentLevel.dragging && !currentLevel.released) {
			intro.classList.add('minimized');
			resetButton.classList.remove('hidden');
			currentLevel.mousePos = Utilities.getMousePos(e, canvas);

			// velocity equals the vector dragged by the player
			let velocity = { x: currentLevel.ball.x - currentLevel.mousePos.x, y: currentLevel.ball.y - currentLevel.mousePos.y };
			// scaling down the velocity vector
			velocity.x /= 5;
			velocity.y /= 5;

			currentLevel.ball.shootBall(velocity);
			currentLevel.dragging = false;
			currentLevel.released = true;
		}
	}
};
currentLevel = levels[0];

nextButton.onclick = nextLevel;
replayButton.onclick = restart;
resetButton.onclick = restart;
startOver.onclick = beginning;

let music = new Howl({
	src: ['src/music.mp3'],
	loop: true
});
music.play();

window.onload = update;

function update() {
	requestAnimationFrame(update);
	if(currentLevel) {
		switch(currentLevel.update(ctx, canvas)) {
			case 'win':
				clearTimeout(currentLevel.gameOverTimer);
				if(levels.indexOf(currentLevel)+1 < levels.length) {
					nextButton.classList.remove('hidden');
				}
				else {
					startOver.classList.remove('hidden');
				}
				overlay.classList.add('paused');
				title.classList.add('win');
				title.innerHTML = 'YOU WIN';
				score.innerHTML = 'Bounces: ' + (currentLevel.ball.bounces-1);
				break;
			case 'lose':
				clearTimeout(currentLevel.gameOverTimer);
				replayButton.classList.remove('hidden');
				overlay.classList.add('paused');
				title.classList.add('lose');
				title.innerHTML = 'YOU LOSE';
				break;
			default: break;
		}
	}
}

function nextLevel() {
	replayButton.classList.add('hidden');
	nextButton.classList.add('hidden');
	overlay.classList.remove('paused');
	title.classList.remove('win');
	title.innerHTML = '';
	score.innerHTML = '';
	let index = levels.indexOf(currentLevel)+1;
	if(index < levels.length) {
		currentLevel = levels[index];
	}
}

function restart() {
	replayButton.classList.add('hidden');
	nextButton.classList.add('hidden');
	startOver.classList.add('hidden');
	overlay.classList.remove('paused');
	title.innerHTML = '';
	score.innerHTML = '';
	currentLevel.initState();
}

function beginning() {
	replayButton.classList.add('hidden');
	nextButton.classList.add('hidden');
	startOver.classList.add('hidden');
	overlay.classList.remove('paused');
	title.classList.remove('win');
	title.innerHTML = '';
	score.innerHTML = '';
	for(let level of levels) {
		level.initState();
	}
	currentLevel = levels[0];
}
