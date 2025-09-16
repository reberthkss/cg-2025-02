// GL_LINE_STRIP Example - Connected lines forming a zigzag
const vertexShaderSourceStrip = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceStrip = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0); // Cyan color
    }
`;

function createShaderStrip(gl, type, source) {
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

function createProgramStrip(gl, vertexShader, fragmentShader) {
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

function mainStrip() {
    const canvas = document.getElementById('glCanvasStrip');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderStrip(gl, gl.VERTEX_SHADER, vertexShaderSourceStrip);
    const fragmentShader = createShaderStrip(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceStrip);
    const program = createProgramStrip(gl, vertexShader, fragmentShader);
    
    // Define vertices for connected lines (zigzag pattern)
    const vertices = new Float32Array([
        -0.8, -0.5,  // Start point (bottom-left)
        -0.4,  0.5,  // Up
         0.0, -0.5,  // Down
         0.4,  0.5,  // Up
         0.8, -0.5   // Down (end point)
    ]);
    
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
    
    // Draw connected lines
    gl.drawArrays(gl.LINE_STRIP, 0, 5); // 5 vertices = 4 connected lines
}

window.addEventListener('load', mainStrip);