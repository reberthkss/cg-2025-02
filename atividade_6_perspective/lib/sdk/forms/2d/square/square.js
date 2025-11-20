class Square {
    constructor(x, y, weight, height, color) {
        this.gl = gl;
        this.vertices = new Float32Array([
            x, y + height,
            x + weight, y + height,
            x + weight, y,
            x, y,
            x + weight, y,
            x, y + height
        ]);
    }

    getVertices() {
        return this.vertices;
    }
}
