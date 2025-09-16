// GL_POINTS Example - Points with different sizes using attributes
const vertexShaderSourcePoints = `
    attribute vec4 a_position;
    attribute float a_pointSize;
    void main() {
        gl_Position = a_position;
        gl_PointSize = a_pointSize;
    }
`;

const fragmentShaderSourcePoints = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
    }
`;

function createShaderPoints(gl, type, source) {
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

function createProgramPoints(gl, vertexShader, fragmentShader) {
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

function mainPoints() {
    const canvas = document.getElementById('glCanvasPoints');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderPoints(gl, gl.VERTEX_SHADER, vertexShaderSourcePoints);
    const fragmentShader = createShaderPoints(gl, gl.FRAGMENT_SHADER, fragmentShaderSourcePoints);
    const program = createProgramPoints(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    // Define point positions
    const pointPositions = [
        -0.7,  0.6,   // Top-left
        -0.2,  0.8,   // Top-center
         0.3,  0.4,   // Top-right
        -0.8,  0.0,   // Middle-left
         0.0,  0.0,   // Center
         0.6, -0.2,   // Middle-right
        -0.4, -0.6,   // Bottom-left
         0.1, -0.8,   // Bottom-center
         0.7, -0.5    // Bottom-right
    ];
    
    // Different point sizes to demonstrate
    const pointSizes = [5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0];
    
    // Create and bind position buffer
    const positionBuffer = gl.createBuffer();
    
    
    // Create and bind point size buffer
    const sizeBuffer = gl.createBuffer();
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const pointSizeLocation = gl.getAttribLocation(program, 'a_pointSize');
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Set up position attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Set up point size attribute
    gl.enableVertexAttribArray(pointSizeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointSizes), gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointSizeLocation, 1, gl.FLOAT, false, 0, 0);
    
    // Draw all points in a single draw call - much more efficient!
    gl.drawArrays(gl.POINTS, 0, 9);
}

window.addEventListener('load', mainPoints);