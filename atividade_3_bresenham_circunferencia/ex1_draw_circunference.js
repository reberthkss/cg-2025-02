function drawCircle() {
    const canvas = document.getElementById('glExercise1');
    const gl = canvas.getContext('webgl');
    const bodyElement = document.querySelector("body");
    let circlePoints = [];
    let radius  = 50;

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Vertex shader program
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = 1.0;
        }
    `;

    // Fragment shader program
    const fragmentShaderSource = `
        precision mediump float;
        uniform vec3 u_color;
        void main() {
            gl_FragColor = vec4(u_color, 1.0);
        }
    `;

    // Create shaders
    const vertexShader = createShaderLines(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShaderLines(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create program
    const program = createProgramLines(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Look up attribute location
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');

    const initialColor = [0.0, 0.0, 1.0]; // Blue color
    gl.uniform3fv(colorLocation, initialColor);

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Enable the attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Clearing the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Function to convert pixel coordinates to clip space
    function toClipSpace(x, y) {
        return [
            (x / canvas.width) * 2 - 1,
            (y / canvas.height) * -2 + 1
        ];
    }

    // Mouse click event
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        circlePoints = bresenhamCircle(x, y, radius);

        const clipSpaceCirclePoints = [];
        for (const point of circlePoints) {
            clipSpaceCirclePoints.push(...toClipSpace(point[0], point[1]));
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(clipSpaceCirclePoints), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, circlePoints.length);

    });

    // Keyboard event for changing the line color
    bodyElement.addEventListener('keydown', (event) => {
        const colorMap = {
            '0': [1.0, 1.0, 1.0], // White
            '1': [1.0, 0.0, 0.0], // Red
            '2': [0.0, 1.0, 0.0], // Green
            '3': [0.0, 0.0, 1.0], // Blue
            '4': [1.0, 1.0, 0.0], // Yellow
            '5': [1.0, 0.0, 1.0], // Magenta
            '6': [0.0, 1.0, 1.0], // Cyan
            '7': [1.0, 0.5, 0.0], // Orange
            '8': [0.5, 0.0, 1.0], // Purple
            '9': [0.5, 0.5, 0.5]  // Gray
        }
        
        if (event.key in colorMap) {
            const newColor = colorMap[event.key];
            gl.uniform3fv(colorLocation, newColor);

            gl.drawArrays(gl.POINTS, 0, circlePoints.length);
        }
    }, false);
}

window.addEventListener('load', drawCircle);