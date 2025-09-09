// Vertex shader source code
const vertexShaderSourceFan = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

// Fragment shader source code
const fragmentShaderSourceFan = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green color
    }
`;

function createShaderFan(gl, type, source) {
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

function createProgramFan(gl, vertexShader, fragmentShader) {
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

function pentagonVertices() {
    const vertices = [];

    // Center point of the pentagon
    vertices.push(0.0, 0.0);

    // Calculate pentagon vertices
    const radius = 0.6;
    const numSides = 5;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function mainFan() {
    const canvas = document.getElementById('glCanvasFan');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderFan(gl, gl.VERTEX_SHADER, vertexShaderSourceFan);
    const fragmentShader = createShaderFan(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceFan);
    
    const program = createProgramFan(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    let vertices = [];
    
    const buffer = gl.createBuffer();
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.enableVertexAttribArray(positionLocation);
    vertices = pentagonVertices();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);
}

window.addEventListener('load', mainFan);