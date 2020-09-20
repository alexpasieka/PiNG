import Point from './Point.js'
import Line from './Line.js'

export default class Obstacle {
	constructor(origin, width, height, destination = null, scalar = 1, color = 'black') {
		this.origin = origin;
		this.width = width;
		this.height = height;
		this.color = color;
		this.destination = destination;
		this.initOrigin = {
			x: this.origin.x,
			y: this.origin.y
		}
		if(destination) {
			this.velocity = {
				x: (destination.x - origin.x) / scalar,
				y: (destination.y - origin.y) / scalar,
			}
		}
		this.calcSides();
	}

	calcSides() {
		this.sides = {
			top: new Line(new Point(this.origin.x, this.origin.y + this.height),
				new Point(this.origin.x + this.width, this.origin.y + this.height)),
			right: new Line(new Point(this.origin.x + this. width, this.origin.y + this.height),
				new Point(this.origin.x + this.width, this.origin.y)),
			bottom: new Line(new Point(this.origin.x + this.width, this.origin.y), this.origin),
			left: new Line(this.origin, new Point(this.origin.x, this.origin.y + this.height))
		}
	}

	move() {
		if (this.destination) {
			this.origin.x += this.velocity.x;
			this.origin.y += this.velocity.y;
			if (
				(this.origin.x === this.destination.x && this.origin.y === this.destination.y) ||
				(this.origin.x === this.initOrigin.x && this.origin.y === this.initOrigin.y)
			) {
				this.velocity.x = -this.velocity.x;
				this.velocity.y = -this.velocity.y;
			}
		}
		this.calcSides();
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(...this.origin.getCoords(), this.width, this.height);
	}
}