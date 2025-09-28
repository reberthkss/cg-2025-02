const flowerVertexShader = glsl`
    attribute vec2 a_position;
    uniform vec3 a_color;
    uniform mat3 u_matrix;
    varying vec4 v_color;
    void main() {
        gl_Position = vec4((u_matrix*vec3(a_position, 1)).xy, 0.0, 1.0);
        v_color = vec4(a_color, 1.0);
    }
`;
const flowerFragmentShader = glsl`
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

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
    const body = document.querySelector('body');

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
    const colorLocation = gl.getUniformLocation(program, 'a_color');
    const matrixLocation = gl.getUniformLocation(program, "u_matrix")
    const flowerPrimaryColor = [1.0, 1.0, 0.0]
    const flowerSecondaryColor = [1.0, 0.4, 0.8]

    const VertexBuffer = gl.createBuffer();


    // Desenhar as pétalas PRIMEIRO (para ficarem atrás do centro)
    const numPetals = 6;
    
    var matrix = MATRIX_TRANSFORMATION.identity();
    var flowerRotation = Math.PI;
    var rotationRatio = 0.01;

    body.addEventListener('keydown', (event) => {
        event.preventDefault();

        switch(event.key) {
            case 'ArrowLeft':
                rotationRatio = -rotationRatio;
                break;
            case 'ArrowRight':
                rotationRatio = Math.abs(rotationRatio);
                break;
        }
    
    });

    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    
    
    drawScene = () => {
        gl.uniform3fv(colorLocation, flowerSecondaryColor);
        for (let i = 0; i < numPetals; i++) {
            const petalAngle = (i * 2 * Math.PI) / numPetals;
            const petalVertices = flowerPetal(0, 0, petalAngle);
            
            drawVertices(gl, petalVertices, positionLocation, VertexBuffer);
            matrix = MATRIX_TRANSFORMATION.identity();
            matrix = MATRIX_TRANSFORMATION.rotate(matrix, flowerRotation);
            gl.uniformMatrix3fv(matrixLocation, false, matrix);
            
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 22); // 1 centro + 21 pontos da borda
        }
        
        gl.uniform3fv(colorLocation, flowerPrimaryColor);

        // Desenhar o centro da flor POR ÚLTIMO (para ficar na frente)
        const flowerCenterVertices = flowerCenter(0, 0);

        drawVertices(gl, flowerCenterVertices, positionLocation, VertexBuffer);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 37); // 1 centro + 36 pontos da borda

        flowerRotation += rotationRatio;

        requestAnimationFrame(drawScene);
    }

    drawScene();
}

window.addEventListener('load', flowers);