// GL_LINE_LOOP Example - Closed polygon outline (hexagon)
const vertexShaderSourceLoop = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceLoop = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // Yellow color
    }
`;

function createShaderLoop(gl, type, source) {
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

function createProgramLoop(gl, vertexShader, fragmentShader) {
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

function mainLoop() {
    const canvas = document.getElementById('glCanvasLoop');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderLoop(gl, gl.VERTEX_SHADER, vertexShaderSourceLoop);
    const fragmentShader = createShaderLoop(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceLoop);
    const program = createProgramLoop(gl, vertexShader, fragmentShader);
    
    // Define vertices for hexagon outline
    const vertices = hexagonVertices();
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Draw closed loop (automatically connects last vertex to first)
    gl.drawArrays(gl.LINE_LOOP, 0, 6); // 6 vertices = hexagon outline
}

function hexagonVertices() {
    const vertices = [];
    const radius = 0.6;
    const numSides = 6;
    
    for (let i = 0; i < numSides; i++) {
        const angle = (i * 2 * Math.PI) / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x, y);
    }
    
    return new Float32Array(vertices);
}

window.addEventListener('load', mainLoop);