const robotVertexShader = glsl`
    attribute vec2 a_position;
    uniform mat3 u_matrix;
    uniform vec3 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = vec4((u_matrix*vec3(a_position,1)).xy, 0.0, 1.0);
        v_color = vec4(a_color, 1.0);
    }
`;
const robotFragmentShader = glsl`
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
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

const main = () => {
    const body = document.querySelector('body');
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
    const colorLocation = gl.getUniformLocation(program, 'a_color');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    // Coordinates
    var robotHeadCoordinates = [-0.5, -0.5]
    var robotOverHeadCoordinates = [-0.2, 0.5]
    var robotLeftEyeCoordinates = [-0.4, 0.0]
    var robotRightEyeCoordinates = [0.1, 0.0]
    var robotLipsCoordinates = [-0.4, -0.4]

    // Translation Coordinates
    var robot_tx = 0.0
    var robot_ty = 0.0


    var robotPrimaryColor = [1.0, 0.0, 0.0]
    var robotSecondaryColor = [0.0, 0.0, 1.0]

    body.addEventListener('keydown', (event) => {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowUp':
                if (robot_ty < 0.3) robot_ty += 0.01
                break;
            case 'ArrowDown':
                if (robot_ty > -0.5) robot_ty -= 0.01
                break;
            case 'ArrowLeft':
                if (robot_tx > -0.5) robot_tx -= 0.01
                break;
            case 'ArrowRight':
                if (robot_tx < 0.5) robot_tx += 0.01
                break;
        }
    })

    const drawScene = () => {
        // HEAD
        robotHead = setSquareVertices(
            robotHeadCoordinates[0], robotHeadCoordinates[1], 1, 1
        )
        gl.uniform3fv(colorLocation, robotPrimaryColor);
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, robot_tx, robot_ty);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        drawVertices(gl, robotHead, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  
        
        // OVERHEAD
        robotOverHead = setSquareVertices(
            robotOverHeadCoordinates[0],
            robotOverHeadCoordinates[1],
            0.4, 0.2
        )
        drawVertices(gl, robotOverHead, positionLocation, VertexBuffer);
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, robot_tx, robot_ty);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);    

        // LEFT EYE
        gl.uniform3fv(colorLocation, robotSecondaryColor)
        robotLeftEye = setSquareVertices(
            robotLeftEyeCoordinates[0],
            robotLeftEyeCoordinates[1],
            0.3, 0.2
        )
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, robot_tx, robot_ty);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        drawVertices(gl, robotLeftEye, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  

        // RIGHT EYE
        robotRightEye = setSquareVertices(
            robotRightEyeCoordinates[0],
            robotRightEyeCoordinates[1],
            0.3, 0.2
        )
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, robot_tx, robot_ty);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        drawVertices(gl, robotRightEye, positionLocation, VertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);   
        
        // LIPS
        robotLips = setSquareVertices(
            robotLipsCoordinates[0],
            robotLipsCoordinates[1],
            0.8, 0.2
        )
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.translate(matrix, robot_tx, robot_ty);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        drawVertices(gl, robotLips, positionLocation, VertexBuffer);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(drawScene)
    }

    drawScene();
    
}

window.addEventListener('load', main);