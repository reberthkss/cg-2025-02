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

function carWheelVertice(center_x, center_y) {
    const vertices = [];

    // Center point of the flower
    vertices.push(center_x, center_y);

    // Calculate flower vertices
    const radius = 0.2;
    const numSides = 35;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = center_x + radius * Math.cos(angle);
        const y = center_y + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}


function carWheelColor(sides) {
    const colorVertices = [];

    for (let i = 0; i <= sides; i++) {
        colorVertices.push(1.0, 1.0, 1.0); // Yellow (valores entre 0.0 e 1.0)
    }
    return new Float32Array(colorVertices);
}

const car = () => {
    const canvas = document.getElementById('glCanvasCar');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("Could not initialize WebGL");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, carVertexShader);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, carFragmentShader);

    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    car_body = new Float32Array([
        -0.8, -0.5,
         0.8, 0.5,
         0.8,  -0.5,
        -0.8,  -0.5,
        -0.8, 0.5,
        0.8, 0.5
    ]);

    car_color = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
    ]);

    drawVertices(gl, car_body, positionLocation, VertexBuffer);
    drawColors(gl, car_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);   
    
    car_right_window = new Float32Array([
        0.0, 0.0,
        0.4, 0.4,
        0.4, 0.0,
        0.0, 0.0,
        0.0, 0.4,
        0.4, 0.4
    ])

    car_window_color = new Float32Array([
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
    ]);

    drawVertices(gl, car_right_window, positionLocation, VertexBuffer);
    drawColors(gl, car_window_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);  

    car_left_window = new Float32Array([
        -0.5, 0.0,
        -0.2, 0.4,
        -0.2, 0.0,
        -0.5, 0.0,
        -0.5, 0.4,
        -0.2, 0.4
    ])

    drawVertices(gl, car_left_window, positionLocation, VertexBuffer);
    drawColors(gl, car_window_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);  


    car_wheel_1 = carWheelVertice(-0.5, -0.5);
    car_wheel_color = carWheelColor(36);

    drawVertices(gl, car_wheel_1, positionLocation, VertexBuffer);
    drawColors(gl, car_wheel_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); 

    car_wheel_2 = carWheelVertice(0.4, -0.5);

    drawVertices(gl, car_wheel_2, positionLocation, VertexBuffer);
    drawColors(gl, car_wheel_color, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); 

}

const carVertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;
const carFragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

window.addEventListener('load', car);