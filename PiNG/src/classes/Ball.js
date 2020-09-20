import Point from './Point.js'
import {Howl} from "howler";

export default class Ball {
	constructor(origin, radius, color = 'white') {
		this.x = origin.x;
		this.y = origin.y;
		this.radius = radius;
		this.color = color;
		this.velocity = { x: 0, y: 0 };
		this.prevBall = this;

		this.bounce = new Howl({
			src: ['src/bounce.wav']
		});
		this.bounces = 0;
	}

	shootBall(velocity) {
		this.velocity.x = velocity.x;
		this.velocity.y = velocity.y;
	}

	getBounds() {
		this.bounds = {
			top: this.y + this.radius,
			right: this.x + this.radius,
			bottom: this.y - this.radius,
			left: this.x - this.radius
		};
	}

	applyGravity(gravity) {
		this.velocity.y -= gravity;
	}

	groundBounce(canvas) {
		// wall collision
		if (this.bounds.left + this.velocity.x <= 0) {
			if (Math.abs(this.velocity.x) > .8) { this.bounce.play() }
			this.x = this.radius;
			// bounce
			this.velocity.x *= -0.9;
			this.velocity.y *= 0.99;
			this.bounces++;
		}
		else if (this.bounds.right + this.velocity.x >= canvas.width) {
			if (Math.abs(this.velocity.x) > .8) { this.bounce.play() }
			this.x = canvas.width - this.radius;
			// bounce
			this.velocity.x *= -0.9;
			this.velocity.y *= 0.99;
			this.bounces++;
		}

		// floor collision
		if (this.bounds.bottom + this.velocity.y <= 0) {
			if (Math.abs(this.velocity.y) > .8) { this.bounce.play() }
			this.y = this.radius;
			// bounce
			this.velocity.y *= -0.9;
			// friction
			this.velocity.x *= 0.99;
			this.bounces++;
		}
	}

	checkCollision(obstacle) {
		if (
			this.bounds.right > obstacle.origin.x &&
			this.bounds.left < obstacle.origin.x + obstacle.width &&
			this.bounds.top > obstacle.origin.y &&
			this.bounds.bottom < obstacle.origin.y + obstacle.height
		) {
			return this.handleBounce(this, obstacle);
		}
		else {
			let x = this.prevBall.x + this.prevBall.velocity.x / 2;
			let y = this.prevBall.y + this.prevBall.velocity.y / 2;

			let ball = new Ball(new Point(x, y), this.radius, this.color);
			if (
				this.bounds.right > obstacle.origin.x &&
				this.bounds.left < obstacle.origin.x + obstacle.width &&
				this.bounds.top > obstacle.origin.y &&
				this.bounds.bottom < obstacle.origin.y + obstacle.height
			) {
				return this.handleBounce(ball, obstacle);
			}
		}
		return false;
	}

	handleBounce(ball, obstacle)	{
		this.bounce.play();
		// Code from: https://gamedev.stackexchange.com/questions/29786/a-simple-2d-rectangle-collision-algorithm-that-also-determines-which-sides-that

		let w = 0.5 * (ball.radius * 2 + obstacle.width);
		let h = 0.5 * (ball.radius * 2 + obstacle.height);
		let dx = ball.x - (obstacle.origin.x + obstacle.width / 2);
		let dy = ball.y - (obstacle.origin.y + obstacle.height / 2);

		if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
			this.bounces++;
			/* collision! */
			let wy = w * dy;
			let hx = h * dx;

			if (wy > hx) {
				/* collision at the top */
				if (wy > -hx) {
					this.velocity.y = -this.velocity.y * 0.9;
					this.velocity.x *= 0.99;
					this.y = obstacle.origin.y + obstacle.height + this.radius;
					this.getBounds();
					return 'top';
				}
				/* on the left */
				else {
					this.velocity.x = -this.velocity.x * 0.9;
					this.velocity.y *= 0.99;
					this.x = obstacle.origin.x - this.radius;
					this.getBounds();
					return 'left';
				}
			}
			else {
				/* on the right */
				if (wy > -hx) {
					this.velocity.x = -this.velocity.x * 0.9;
					this.velocity.y *= 0.99;
					this.x = obstacle.origin.x + obstacle.width + this.radius;
					this.getBounds();
					return 'right';
				}
				/* at the bottom */
				else {
					this.velocity.y = -this.velocity.y * 0.9;
					this.velocity.x *= 0.99;
					this.y = obstacle.origin.y - this.radius;
					this.getBounds();
					return 'bottom';
				}
			}
		}
	}

	move() {
		this.prevBall = new Ball(new Point(this.x, this.y),this.radius,this.color);
		this.prevBall.velocity = this.velocity;

		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
}