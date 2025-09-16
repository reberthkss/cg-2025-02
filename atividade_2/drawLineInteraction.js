function drawLineInteraction(){ 
    const canvas = document.getElementById('glLines');
    const gl = canvas.getContext('webgl');
    let p0 = null;

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
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
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

    // Create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Enable the attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Clear the canvas
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

        if (p0 === null) {
            p0 = [x, y];
            return;
        }

        p1 = [x, y];

        const linePoints = bresenham(p0, p1);

        const clipSpaceLinePoints = [];
        for (const point of linePoints) {
            clipSpaceLinePoints.push(...toClipSpace(point[0], point[1]));
        }

        console.log("Clip space => ", clipSpaceLinePoints)

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(clipSpaceLinePoints), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, linePoints.length);

        p0 = null;
    });
}

window.addEventListener('load', drawLineInteraction);