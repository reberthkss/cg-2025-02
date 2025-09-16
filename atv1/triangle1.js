// Vertex shader source code
const vertexShaderSource1 = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

// Fragment shader source code
const fragmentShaderSource1 = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }
`;

function createShader1(gl, type, source) {
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

function createProgram1(gl, vertexShader, fragmentShader) {
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

function main1() {
    const canvas = document.getElementById('glCanvas1');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    // Create shaders
    const vertexShader = createShader1(gl, gl.VERTEX_SHADER, vertexShaderSource1);
    const fragmentShader = createShader1(gl, gl.FRAGMENT_SHADER, fragmentShaderSource1);
    
    // Create program
    const program = createProgram1(gl, vertexShader, fragmentShader);
    
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
    
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Start the application when the page loads
window.addEventListener('load', main1);