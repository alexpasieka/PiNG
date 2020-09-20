import Utilities from '../utilities.js'
import Point from './Point.js'
import Ball from './Ball.js'
import Line from './Line.js'

export default class Level {
	constructor(ball, cup, obstacles, background = 'blue') {
		this.initBall = new Ball(new Point(ball.x, ball.y), ball.radius, ball.color);
		this.ball = ball;
		this.cup = cup;
		this.obstacles = obstacles;
		this.background = background;
		this.released = false;
		this.dragging = false;
		this.line = null;
		this.mousePos = null;
		this.gameOverTimer = null;
		this.paused = false;
		this.outcome = false;
	}

	initState() {
		this.ball = new Ball(new Point(this.initBall.x, this.initBall.y), this.initBall.radius, this.initBall.color);
		this.released = false;
		this.dragging = false;
		this.line = null;
		this.mousePos = null;
		this.gameOverTimer = null;
		this.paused = false;
		this.outcome = false;
	}

	draw(ctx) {
		for(let obstacle of this.obstacles) {
			obstacle.draw(ctx);
		}
		this.ball.draw(ctx);
		this.cup.draw(ctx);
	}

	update(ctx, canvas) {
		if(!this.paused) {
			// clearing the canvas
			ctx.fillStyle = this.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for (let obstacle of this.obstacles) {
				obstacle.move();
			}

			this.ball.move();
			this.ball.getBounds();
			if (this.obstacles) {
				for (let obstacle of this.obstacles) {
					obstacle.draw(ctx);
					this.ball.checkCollision(obstacle);
				}
			}
			this.ball.groundBounce(canvas);

			if (this.released) {
				this.ball.applyGravity(0.8);
			}

			Utilities.clampMagnitude(this.ball.velocity, 40);
			this.ball.draw(ctx);
			this.cup.draw(ctx);

			// drawing the velocity vector line
			if (this.dragging && !this.released) {
				this.line = new Line(this.ball, this.mousePos);
				this.line.draw(ctx);
			}

			if(this.released) {
				if (Math.abs(this.ball.velocity.x) < 0.45 && Math.abs(this.ball.velocity.y) < 0.45) {
					if(!this.gameOverTimer){
						this.gameOverTimer = setTimeout(this.lose, 1000, ctx, canvas, this);
					}
				}
				else {
					clearTimeout(this.gameOverTimer);
					this.gameOverTimer = null;
				}
			}

			if (this.ball.checkCollision(this.cup) === 'top') {
				this.winScreen();
			}
		}
		else {
			return this.outcome;
		}
	}

	winScreen() {
		this.paused = true;
		this.outcome = 'win';
	}

	lose(ctx, canvas, level) {
		level.paused = true;
		level.outcome = 'lose';
	}
}