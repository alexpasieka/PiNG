export default class Line {
	constructor(p1, p2, color) {
		this.p1 = p1;
		this.p2 = p2;
		this.color = color;
	}

	draw(ctx) {
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(this.p1.x, this.p1.y);
		ctx.lineTo(this.p2.x, this.p2.y);
		ctx.closePath();
		ctx.stroke();
	}
};