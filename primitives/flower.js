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

function flowerCenter(center_x, center_y) {
    const vertices = [];

    // Center point of the flower
    vertices.push(center_x, center_y);

    // Calculate flower vertices
    const radius = 0.1;
    const numSides = 35;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = center_x + radius * Math.cos(angle);
        const y = center_y + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function flowerPetal(center_x, center_y, petalAngle) {
    const vertices = [];
    
    // Centro da pétala (um pouco afastado do centro da flor)
    const petalDistance = 0.18;
    const petal_x = center_x + petalDistance * Math.cos(petalAngle);
    const petal_y = center_y + petalDistance * Math.sin(petalAngle);
    
    vertices.push(petal_x, petal_y);

    // Criar um círculo para a pétala
    const petalRadius = 0.08;
    const numSides = 20;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = petal_x + petalRadius * Math.cos(angle);
        const y = petal_y + petalRadius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function flowerPrimaryColor(sides) {
    const colorVertices = [];

    for (let i = 0; i <= sides; i++) {
        colorVertices.push(1.0, 1.0, 0.0); // Yellow (valores entre 0.0 e 1.0)
    }
    return new Float32Array(colorVertices);
}

function flowerSecondaryColor(sides) {
    const colorVertices = [];

    for (let i = 0; i <= sides; i++) {
        colorVertices.push(1.0, 0.4, 0.8); // Pink (valores entre 0.0 e 1.0)
    }
    return new Float32Array(colorVertices);
}


const flowers = () => {
    const canvas = document.getElementById('glCanvasFlower');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("Could not initialize WebGL");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, flowerVertexShader);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, flowerFragmentShader);

    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    // Limpar o canvas PRIMEIRO
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    // Desenhar as pétalas PRIMEIRO (para ficarem atrás do centro)
    const numPetals = 6;
    const petalColor = flowerSecondaryColor(21);
    
    for (let i = 0; i < numPetals; i++) {
        const petalAngle = (i * 2 * Math.PI) / numPetals;
        const petalVertices = flowerPetal(0, 0, petalAngle);
        
        drawVertices(gl, petalVertices, positionLocation, VertexBuffer);
        drawColors(gl, petalColor, colorLocation, ColorBuffer);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 22); // 1 centro + 21 pontos da borda
    }

    // Desenhar o centro da flor POR ÚLTIMO (para ficar na frente)
    const flowerCenterVertices = flowerCenter(0, 0);
    const flowerCenterColor = flowerPrimaryColor(36);

    drawVertices(gl, flowerCenterVertices, positionLocation, VertexBuffer);
    drawColors(gl, flowerCenterColor, colorLocation, ColorBuffer);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); // 1 centro + 36 pontos da borda
}

const flowerVertexShader = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;
const flowerFragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

window.addEventListener('load', flowers);