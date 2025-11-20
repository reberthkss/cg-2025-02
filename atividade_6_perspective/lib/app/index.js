// Vertex shader source code
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelViewMatrix * vec4(a_position,1.0);
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
        gl_FragColor = vec4(v_color,1.0);
    }
`;

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

function main() {
    const canvas = document.getElementById('orthoGl')
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    let cubeVertices = [];

    const ColorBuffer = gl.createBuffer();
    let cubeColors = [];

    const modelViewMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelViewMatrix')
    const viewingMatrixUniformLocation = gl.getUniformLocation(program, 'u_viewingMatrix')
    const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix')

    let coordinateAxes = defineCoordinateAxes();
    let coordinateAxesColors = defineCoordinateAxesColors();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let modelViewMatrix = m4.identity();

    let P0 = [2.0, 2.0, 2.0];
    let Pref = [0.0, 0.0, 0.0];
    let V = [0.0, 1.0, 0.0];

    let viewingMatrix = m4.setViewingMatrix(P0, Pref, V)

    let xw_min = -1.0;
    let xw_max = 1.0;
    let yw_min = -1.0;
    let yw_max = 1.0;
    let z_near = -1.0;
    let z_far = -20.0;

    let projectionMatrix = m4.setPerspectiveProjectionMatrix(xw_min, xw_max, yw_min, yw_max, z_near, z_far);

    let theta = 0.0;
    let tx = 0.0;
    let ty = 0.0;
    let tz = 0.0;
    let tx_offset = 0.05;

    cubeColors = setCubeColors();
    cubeVertices = setCubeVertices(1)

    let xzSquareVertices = setXZSquareVertices();
    let xzSquareColors = setXZSquareColors();

    let p0x = 2.0;
    let p0y = 2.0;
    let p0z = 2.0;

    let prefX = 0.0;
    let prefY = 0.0;
    let prefZ = 0.0;

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        P0 = [p0x, p0y, p0z];
        Pref = [prefX, prefY, prefZ];
        V = [0.0, 1.0, 0.0];
        viewingMatrix = m4.setViewingMatrix(P0, Pref, V);
        projectionMatrix = m4.setPerspectiveProjectionMatrix(xw_min, xw_max, yw_min, yw_max, z_near, z_far);
        drawXZSquare(VertexBuffer, ColorBuffer, xzSquareVertices, xzSquareColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz);
        drawCube(VertexBuffer, ColorBuffer, cubeVertices, cubeColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz);
        drawCoordinateAxes(VertexBuffer, ColorBuffer, coordinateAxes, coordinateAxesColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation);

        requestAnimationFrame(render);
    }

    window.addEventListener('keydown', function(event) {
        const key = event.key;

        switch (key) {
            case 'ArrowLeft': {
                p0x -= 0.1;
                break;
            }
            case 'ArrowRight': {
                p0x += 0.1;
                break;
            }
            case 'ArrowUp': {
                p0y += 0.1;
                break;
            }
            case 'ArrowDown': {
                p0y -= 0.1;
                break;
            }
            case 'w': {
                z_near -= 0.1;
                break;
            }
            case 's': {
                z_near += 0.1;
                break;
            }
            case 'a': {
                prefX -= 0.1;
                break;
            }
            case 'd': {
                prefX += 0.1;
                break;
            }
        }
    })

    render();
}

window.addEventListener('load', main);