// gets the mouse position relative to the canvas (flipped Y)
const getMousePos = (e, canvas) => {
	return {
		x: e.pageX - parseInt(canvas.offsetLeft),
		y: canvas.height - e.pageY + parseInt(canvas.offsetTop)
	}
};

// clamps magnitude of velocity vector
const getMagnitude = vector => Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
const clampMagnitude = (vector, max) => {
	let magnitude = getMagnitude(vector);
	if (magnitude > max) {
		let scalar = max / magnitude;
		vector.x *= scalar;
		vector.y *= scalar;
	}
};
export default { getMousePos, clampMagnitude };