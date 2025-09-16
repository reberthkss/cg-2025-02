// Vertex shader source code
const vertexShaderSource2 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource2 = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShader2(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram2(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function main2() {
    const canvas = document.getElementById('glCanvas2');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Create shaders
    const vertexShader = createShader2(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    const fragmentShader = createShader2(gl, gl.FRAGMENT_SHADER, fragmentShaderSource2);

    // Create program
    const program = createProgram2(gl, vertexShader, fragmentShader);

    // Define triangle vertices (in clip space coordinates)
    const vertices = new Float32Array([
         0.0,  0.5,
        -0.5, -0.5,
         0.5, -0.5
    ]);

    // Create buffer and bind vertex data
    const VertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get attribute location
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    const colors = new Float32Array([
         1.0, 0.0, 0.0,
         0.0, 1.0, 0.0,
         0.0, 0.0, 1.0
    ]);

    // Create buffer and bind vertex data
    const ColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Get attribute location
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    // Set viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use shader program
    gl.useProgram(program);

    // Enable and set up the position attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable and set up the color attribute
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Start the application when the page loads
window.addEventListener('load', main2);