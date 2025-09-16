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


const windCatcherVertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;
const windCatcherFragmentShader = `
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
        // Apenas metade do círculo (0 a PI radianos = 0 a 180 graus)
        const angle = i * Math.PI / numSides;
        
        // Calcular posição original
        const originalX = radius * Math.cos(angle);
        const originalY = radius * Math.sin(angle);
        
        // Aplicar rotação
        const rotatedX = originalX * Math.cos(rotationAngle) - originalY * Math.sin(rotationAngle);
        const rotatedY = originalX * Math.sin(rotationAngle) + originalY * Math.cos(rotationAngle);
        
        // Adicionar ao centro
        const x = center_x + rotatedX;
        const y = center_y + rotatedY;
        
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function windCatcherSemiCircleColor(sides) {
    const colorVertices = [];

    for (let i = 0; i <= sides; i++) {
        colorVertices.push(0.2, 0.8, 1.0); // Azul claro para semicírculo
    }
    return new Float32Array(colorVertices);
}

function drawEdge(gl, positionLocation, colorLocation, vertexBuffer, colorBuffer, x, y, rotation) {

    var rotationAngle = Math.PI /2; 
    var windCatcherSemiCircle = windCatcherSemiCircleVertices(x, y, rotation);
    var edgeColor = windCatcherSemiCircleColor(19);

    drawVertices(gl, windCatcherSemiCircle, positionLocation, vertexBuffer);
    drawColors(gl, edgeColor, colorLocation, colorBuffer);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 19); 

} 

const windCatcher = () => {
    const canvas = document.getElementById("glWindCatcher");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, windCatcherVertexShader);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, windCatcherFragmentShader);

    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    // // Edge 1
    drawEdge(gl, positionLocation, colorLocation, ColorBuffer, VertexBuffer, 0.05, 0.1, Math.PI /2);

    // Edge 2
    drawEdge(gl, positionLocation, colorLocation, ColorBuffer, VertexBuffer, -0.025, -0.3, Math.PI *1.5);

    // Edge 3
    drawEdge(gl, positionLocation, colorLocation, ColorBuffer, VertexBuffer, 0.25, 0, Math.PI *1);

    // Edge 4
    drawEdge(gl, positionLocation, colorLocation, ColorBuffer, VertexBuffer, -0.25, 0, Math.PI *1);

    


}


window.addEventListener('load', windCatcher);