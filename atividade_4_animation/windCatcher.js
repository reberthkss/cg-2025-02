const windCatcherVertexShader = glsl`
    attribute vec2 a_position;
    uniform vec3 a_color;
    uniform mat3 u_matrix;
    varying vec4 v_color;
    void main() {
        gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
        v_color = vec4(a_color, 1.0);
    }
`;
const windCatcherFragmentShader = glsl`
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function windCatcherSemiCircleVertices(center_x, center_y, rotationAngle) {
    const vertices = [];

    // Center point of the semicircle
    vertices.push(center_x, center_y);

    // Calculate vertices for semicircle (180 degrees)
    const radius = 0.3;
    const numSides = 17; // Metade dos pontos para semicírculo

    for (let i = 0; i <= numSides; i++) {
        const angle = i * Math.PI / numSides;
        
        const originalX = radius * Math.cos(angle);
        const originalY = radius * Math.sin(angle);
        
        const rotatedX = originalX * Math.cos(rotationAngle) - originalY * Math.sin(rotationAngle);
        const rotatedY = originalX * Math.sin(rotationAngle) + originalY * Math.cos(rotationAngle);
        
        const x = center_x + rotatedX;
        const y = center_y + rotatedY;
        
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function drawEdge(gl, positionLocation, vertexBuffer, x, y, rotation) {

    var windCatcherSemiCircle = windCatcherSemiCircleVertices(x, y, rotation);

    drawVertices(gl, windCatcherSemiCircle, positionLocation, vertexBuffer);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 19); 

} 

const windCatcher = () => {
    const canvas = document.getElementById("glWindCatcher");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    const windVertexShader = createShader(gl, gl.VERTEX_SHADER, windCatcherVertexShader);
    const windFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, windCatcherFragmentShader);

    const program = createProgram(gl, windVertexShader, windFragmentShader);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'a_color');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    const VertexBuffer = gl.createBuffer();

    var matrix = MATRIX_TRANSFORMATION.identity();
    var rotation = Math.PI /2
    var rotationRatio = 0.1;

    gl.uniform3fv(colorLocation, [0.2, 0.8, 1.0]);
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    const drawScene = () => {
        matrix = MATRIX_TRANSFORMATION.identity();
        matrix = MATRIX_TRANSFORMATION.rotate(matrix, rotation);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        // Edge 1
        drawEdge(gl, positionLocation, VertexBuffer, 0.05, 0.1, Math.PI /2);

        // Edge 2
        drawEdge(gl, positionLocation, VertexBuffer, -0.25, -0.29, Math.PI *1.5);

        // Edge 3
        drawEdge(gl, positionLocation, VertexBuffer, 0.25, 0, Math.PI *1);

        // Edge 4
        drawEdge(gl, positionLocation, VertexBuffer, -0.4, 0, Math.PI *1);

        rotation += rotationRatio;
        requestAnimationFrame(drawScene);
    }

    drawScene();
}


window.addEventListener('load', windCatcher);