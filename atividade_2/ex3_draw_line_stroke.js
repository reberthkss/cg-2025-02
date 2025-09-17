function drawTriangle() {
    const canvas = document.getElementById('glExercise3');
    const gl = canvas.getContext('webgl');
    const bodyElement = document.querySelector("body");
    let drawMode = 'r'; // r to line, t to triangle
    let styleMode = 'e' // e to stroke, k to color
    let lineStroke = 1.0;
    let linePoints = [];

    let trianglePoints = [];

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    gl.enable(gl.PROGRAM_POINT_SIZE);


    // Vertex shader program
    const vertexShaderSource = `
        attribute vec2 a_position;
        uniform float point_size;

        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = point_size;
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
    const pointSizeLocation = gl.getUniformLocation(program, 'point_size');

    const initialColor = [0.0, 0.0, 1.0]; // Blue color
    gl.uniform3fv(colorLocation, initialColor);
    gl.uniform1f(pointSizeLocation, lineStroke);

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Enable the attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Clearing the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    function toClipSpace(x, y) {
        return [
            (x / canvas.width) * 2 - 1,
            (y / canvas.height) * -2 + 1
        ];
    }

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (drawMode === 'r') {
            if (trianglePoints.length === 0) {
                trianglePoints.push([x, y]);
                return;
            } else {
                trianglePoints.push([x, y]);

                linePoints = bresenham(trianglePoints[0], trianglePoints[1]);
                drawPoints();

                trianglePoints = [];
            }
        } else if (drawMode === 't') {
            trianglePoints.push([x, y]);

            if (trianglePoints.length === 3) {
                linePoints = [];
                linePoints = linePoints.concat(bresenham(trianglePoints[0], trianglePoints[1]));
                linePoints = linePoints.concat(bresenham(trianglePoints[1], trianglePoints[2]));
                linePoints = linePoints.concat(bresenham(trianglePoints[2], trianglePoints[0]));

                drawPoints();

                trianglePoints = [];
            }
        }
    });

    function drawPoints() {
        const clipSpaceLinePoints = [];
        for (const point of linePoints) {
            clipSpaceLinePoints.push(...toClipSpace(point[0], point[1]));
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(clipSpaceLinePoints), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, linePoints.length);
    }

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

        const strokeMap = {
            '0': 1.0,
            '1': 2.0,
            '2': 3.0,
            '3': 4.0,
            '4': 5.0,
            '5': 6.0,
            '6': 7.0,
            '7': 8.0,
            '8': 9.0,
            '9': 10.0
        }

        if (styleMode === 'k') {
            if (event.key in colorMap) {
                const newColor = colorMap[event.key];
                gl.uniform3fv(colorLocation, newColor);

                gl.drawArrays(gl.POINTS, 0, linePoints.length);
            }
        } else {
            if (event.key in strokeMap) {
                const newSize = strokeMap[event.key];
                gl.uniform1f(pointSizeLocation, newSize);

                gl.drawArrays(gl.POINTS, 0, linePoints.length);
            }
        }

        const key = event.key.toLowerCase();

        if (key == 'r' || key == 't') {
            drawMode = key;
            console.log(`Draw mode changed to: ${drawMode === 'r' ? 'Line' : 'Triangle'}`);

            trianglePoints = [];

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        if (key == 'e' || key == 'k') {
            styleMode = key;
            console.log(`Style mode changed to: ${styleMode === 'e' ? 'Stroke' : 'Fill'}`);
        }
    }, false);
}

window.addEventListener('load', drawTriangle);