import Point from './Point.js'
import Line from './Line.js'

export default class Cup {
	constructor(origin, width, height) {
		this.origin = origin;
		this.width = width;
		this.height = height;
		this.velocity = new Point(0, 0);
		this.calcSides();
	}

	calcSides() {
		this.sides = {
			right: new Line(new Point(this.origin.x + this. width, this.origin.y + this.height),
				new Point(this.origin.x + this.width, this.origin.y)),
			bottom: new Line(new Point(this.origin.x + this.width, this.origin.y), this.origin),
			left: new Line(this.origin, new Point(this.origin.x, this.origin.y + this.height))
		}
	}

	move() {
		this.origin.x += this.velocity.x;
		this.origin.y += this.velocity.y;
		this.calcSides();
	}

	draw(ctx) {
		let cupSprite = new Image();
		cupSprite.src = 'cup.png';
		ctx.drawImage(cupSprite, this.origin.x, this.origin.y);
	}
}