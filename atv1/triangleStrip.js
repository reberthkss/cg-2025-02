// GL_TRIANGLE_STRIP Example - Connected triangles forming a wavy ribbon
const vertexShaderSourceTStrip = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceTStrip = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); // Orange color
    }
`;

function createShaderTStrip(gl, type, source) {
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

function createProgramTStrip(gl, vertexShader, fragmentShader) {
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

function mainTStrip() {
    const canvas = document.getElementById('glCanvasTStrip');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderTStrip(gl, gl.VERTEX_SHADER, vertexShaderSourceTStrip);
    const fragmentShader = createShaderTStrip(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceTStrip);
    const program = createProgramTStrip(gl, vertexShader, fragmentShader);
    
    // Define vertices for triangle strip (creates connected triangles)
    // Triangles formed: (0,1,2), (1,2,3), (2,3,4), (3,4,5)
    const vertices = new Float32Array([
        -0.8,  0.2,  // 0: Top-left
        -0.8, -0.2,  // 1: Bottom-left
        -0.4,  0.4,  // 2: Top-center-left
        -0.4, -0.4,  // 3: Bottom-center-left
         0.0,  0.2,  // 4: Top-center
         0.0, -0.2,  // 5: Bottom-center
         0.4,  0.4,  // 6: Top-center-right
         0.4, -0.4,  // 7: Bottom-center-right
         0.8,  0.2,  // 8: Top-right
         0.8, -0.2   // 9: Bottom-right
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
    
    // Draw triangle strip (each new vertex creates a triangle with previous 2)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10); // 10 vertices = 8 connected triangles
}

window.addEventListener('load', mainTStrip);