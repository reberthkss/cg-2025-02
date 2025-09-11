function createShader(gl, type, source) {
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

function createProgram(gl, vertexShader, fragmentShader) {
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

const drawVertices = (gl, vertices, positionLocation, vertexBuffer) => {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

const drawColors = (gl, colors, colorLocation, colorBuffer) => {
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
}

const main = () => {
    const canvas = document.getElementById('glCanvasRobot');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("Could not initialize WebGL");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, robotVertexShader);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, robotFragmentShader);

    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    robot_head = new Float32Array([
        -0.5, -0.5,
         0.5, 0.5,
         0.5,  -0.5,
        -0.5,  0.5,
        -0.5, -0.5,
        0.5, 0.5
    ]);

    robot_head_color = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
    ]);

    drawVertices(gl, robot_head, positionLocation, VertexBuffer);
    drawColors(gl, robot_head_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);    

    robotOverHead = new Float32Array([
        -0.20, 0.50,
        0.20, 0.75,
        0.2, 0.5,
        -0.2, 0.75,
        -0.2, 0.5,
        0.2, 0.75
    ]);

    drawVertices(gl, robotOverHead, positionLocation, VertexBuffer);
    drawColors(gl, robot_head_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);    

    robotLeftEye = new Float32Array([
        -0.4, -0.0,
        -0.1, 0.2,
        -0.1, -0.0,
        -0.4, -0.0,
        -0.4, 0.2,
        -0.1, 0.2,
    ])

    robotSecondaryColor = new Float32Array([
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
    ])

    drawVertices(gl, robotLeftEye, positionLocation, VertexBuffer);
    drawColors(gl, robotSecondaryColor, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);    

    robotRightEye = new Float32Array([
        0.1, 0.0,
        0.4, 0.2,
        0.4, 0.0,
        0.1, 0.0,
        0.1, 0.2,
        0.4, 0.2,
    ])

    drawVertices(gl, robotRightEye, positionLocation, VertexBuffer);
    drawColors(gl, robotSecondaryColor, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);   
    
    robotLips = new Float32Array([
        -0.4, -0.4,
        0.4, -0.2,
        0.4, -0.4,
        -0.4, -0.4,
        -0.4, -0.2,
        0.4, -0.2
    ])

    drawVertices(gl, robotLips, positionLocation, VertexBuffer);
    drawColors(gl, robotSecondaryColor, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);    

}

const robotVertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;
const robotFragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

window.addEventListener('load', main);