export default class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	getCoords() {
		return [this.x, this.y];
	}
}