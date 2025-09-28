const carVertexShader = glsl`
    attribute vec2 a_position;
    uniform vec3 a_color;
    uniform mat3 u_matrix;
    varying vec4 v_color;
    void main() {
        gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
        v_color = vec4(a_color, 1.0);
    }
`;
const carFragmentShader = glsl`
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

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
    const colorLocation = gl.getUniformLocation(program, 'a_color');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    const VertexBuffer = gl.createBuffer();

    var carWheelColor = [1.0, 1.0, 1.0];
    var carBodyColor = [1.0, 0.0, 0.0];
    var carWindowColor = [0.0, 1.0, 0.0];
    var carTranslateX = 0.0;
    var carTranslateY = 0.0;
    var matrix = MATRIX_TRANSFORMATION.identity();
    var carTranslateXRatio = 0.01;

    const drawScene = () => {
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, carTranslateX, carTranslateY);
        car_body = setSquareVertices(-0.8, -0.5, 1.5, 1);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        gl.uniform3fv(colorLocation, carBodyColor);
        drawVertices(gl, car_body, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);   
        
        car_right_window = setSquareVertices(0.0, 0.0, 0.5, 0.4);
        gl.uniform3fv(colorLocation, carWindowColor);
        drawVertices(gl, car_right_window, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  

        car_left_window = setSquareVertices(-0.5, 0.0, 0.3, 0.4);
        gl.uniform3fv(colorLocation, carWindowColor);
        drawVertices(gl, car_left_window, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  

        car_wheel_1 = carWheelVertice(-0.5, -0.5);
        gl.uniform3fv(colorLocation, carWheelColor);
        drawVertices(gl, car_wheel_1, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); 

        car_wheel_2 = carWheelVertice(0.4, -0.5);
        drawVertices(gl, car_wheel_2, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); 
        carTranslateX += carTranslateXRatio;

        if (carTranslateX > 0.3) {
            carTranslateXRatio = -carTranslateXRatio;
        }

        if (carTranslateX < -0.20) {
            carTranslateXRatio = Math.abs(carTranslateXRatio)
        }

        requestAnimationFrame(drawScene);
    }
    
    drawScene();
}

window.addEventListener('load', car);