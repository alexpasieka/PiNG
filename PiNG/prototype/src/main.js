const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
// flips the canvas' y-axis
ctx.transform(1, 0, 0, -1, 0, canvas.height);

const ballRadius = 12;
const lineWidth = 5;

let isMouseDown = false;
let dropBall = false;

// drop ball button
let dropBallButton = document.querySelector('#drop');
dropBallButton.onclick = function() {
	dropBall = true;
	ball.x = 100;
	ball.y = 400;
	ball.velocity = {x:0,y:0};
};

// clear platforms button
let clearPlatformsButton = document.querySelector('#clear');
clearPlatformsButton.onclick = function() { platforms = [] };

class Ball {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = ballRadius;
		this.velocity = {x: 0, y: 0};
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

	move() {
		// Wall collision
		if (this.bounds.left + this.velocity.x <= 0) {
			this.x = this.radius;
			// Bounce
			this.velocity.x *= -0.7;
		}
		else if (this.bounds.right + this.velocity.x >= canvas.width) {
			this.x = canvas.width - this.radius;
			// Bounce
			this.velocity.x *= -0.7;
		}
		else {
			this.x += this.velocity.x;
		}

		// Floor collision
		if (this.bounds.bottom + this.velocity.y <= 0) {
			this.y = this.radius;
			// Bounce
			this.velocity.y *= -0.7;
			// Friction
			this.velocity.x *= 0.99;
		}
		else {
			this.y += this.velocity.y;
		}
	}

	checkCollision(line) {

		// Use AABB to prevent collision with line beyond it's segment
		//console.log(intersect(this.x, this.y, this.x+ this.velocity.x,this.y+ this.velocity.y,line.p1.x,line.p1.y,line.p2.x,line.p2.y));
    let doesIntersect = get_line_intersection(this.x, this.y, this.x+ this.velocity.x,this.y+ this.velocity.y,line.p1.x,line.p1.y,line.p2.x,line.p2.y)

		if(((Math.max(line.p1.y, line.p2.y) > this.bounds.bottom) &&
			(Math.min(line.p1.y, line.p2.y) < this.bounds.top) &&
			(Math.max(line.p1.x, line.p2.x) > this.bounds.left) &&
			(Math.min(line.p1.x, line.p2.x) < this.bounds.right)) ||
			doesIntersect
		) {
			// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
			let distance = Math.abs((line.p2.y-line.p1.y)*this.x-(line.p2.x-line.p1.x)*this.y+line.p2.x*line.p1.y-line.p2.y*line.p1.x)/Math.sqrt(Math.pow((line.p2.y-line.p1.y), 2) + Math.pow((line.p2.y-line.p1.y), 2));
			if(distance <= this.radius || doesIntersect) {
				// https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
				let cs = Math.cos(line.angle);
				let sn = Math.sin(line.angle);

				// Changing the angle of the velocity vector while maintaining its magnitude
				let px = this.velocity.x * cs - this.velocity.y * sn;
				let py = this.velocity.x * sn + this.velocity.y * cs;

				this.velocity.x = px;
				this.velocity.y = py;
			}

		}

	}

	draw() {
		ctx.fillStyle = 'white';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
}

class Platform {
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		this.slope = (p2.y - p1.y) / (p2.x - p2.y);
		this.getAngle();
	}

	getAngle() {
		// Angle is calculated differently based on the order of the points and the quadrant of the angle
		if (this.p1.x < this.p2.x && this.p1.y < this.p2.y) {
			this.angle = Math.PI + Math.atan2(this.p2.y, this.p1.x);
		}
		else if (this.p1.x < this.p2.x && this.p1.y > this.p2.y) {
			this.angle = Math.PI - Math.atan2(this.p2.y, this.p1.x);
		}
		else if (this.p1.x > this.p2.x && this.p1.y > this.p2.y) {
			this.angle = Math.PI + Math.atan2(this.p1.y, this.p2.x);
		}
		else {
			this.angle = Math.PI - Math.atan2(this.p1.y, this.p2.x);
		}
	}

	draw() {
		ctx.strokeStyle = 'white';
		ctx.lineWidth = lineWidth;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(this.p1.x, this.p1.y);
		ctx.lineTo(this.p2.x, this.p2.y);
		ctx.stroke();
	}
}

// ping pong ball
let ball = new Ball(100, 400);
let newPlatform = null;
let platforms = [];

const getMousePos = e => {
	// Gets the mouse position relative to the canvas (flipped Y)
	return {
		x: e.pageX - parseInt(canvas.offsetLeft),
		y: canvas.height - e.pageY + parseInt(canvas.offsetTop)
	}
};

window.onmousedown = e => {
	isMouseDown = true;
	let mousePos = getMousePos(e);
	newPlatform = new Platform(mousePos, mousePos);
};

window.onmousemove = e => {
	if (isMouseDown) {
		newPlatform.p2 = getMousePos(e);
	}
};

window.onmouseup = () => {
	isMouseDown = false;
	platforms.push(newPlatform);
	newPlatform = null;
};

window.onload = update;

function update() {
	requestAnimationFrame(update);

	// clearing the canvas
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (dropBall) {
		ball.applyGravity(0.8);
	}
	ball.getBounds();
	ball.move();
	ball.draw();

	if (newPlatform) {
		newPlatform.draw();
	}

	if (platforms) {
		for (let platform of platforms) {
			platform.draw();
			ball.checkCollision(platform);
		}
	}
}


// https://gist.github.com/lengstrom/8499382
function intersect(x1, y1, x2, y2, x3, y3, x4, y4){
	let a1, a2, b1, b2, c1, c2;
	let r1, r2 , r3, r4;
	let denom, offset, num;

	// Compute a1, b1, c1, where line joining points 1 and 2
	// is "a1 x + b1 y + c1 = 0".
	a1 = y2 - y1;
	b1 = x1 - x2;
	c1 = (x2 * y1) - (x1 * y2);

	// Compute r3 and r4.
	r3 = ((a1 * x3) + (b1 * y3) + c1);
	r4 = ((a1 * x4) + (b1 * y4) + c1);

	// Check signs of r3 and r4. If both point 3 and point 4 lie on
	// same side of line 1, the line segments do not intersect.
	if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)){
		return false; //return that they do not intersect
	}

	// Compute a2, b2, c2
	a2 = y4 - y3;
	b2 = x3 - x4;
	c2 = (x4 * y3) - (x3 * y4);


	// Compute r1 and r2
	r1 = (a2 * x1) + (b2 * y1) + c2;
	r2 = (a2 * x2) + (b2 * y2) + c2;

	// Check signs of r1 and r2. If both point 1 and point 2 lie
	// on same side of second line segment, the line segments do
	// not intersect.
	if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))){
		return false; //return that they do not intersect
	}

	//Line segments intersect: compute intersection point.
	denom = (a1 * b2) - (a2 * b1);

	if (denom === 0) {
		return true; //collinear
	}

	// lines_intersect
	return true; //lines intersect, return true
}

function sameSign(a,b){
	return Math.sign(a) === Math.sign(b);
}

// https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
function get_line_intersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y)
{
	let s1_x, s1_y, s2_x, s2_y;
	s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
	s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;

	let s, t;
	s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
	{
		return {
			x: p0_x + (t * s1_x),
			y: p0_y + (t * s1_y)
		};
	}

	return false; // No collision
}