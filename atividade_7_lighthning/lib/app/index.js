// Vertex shader source code
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute vec3 a_normal;
    
    varying vec3 v_color;
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;
    

    uniform vec3 u_lightPosition;
    uniform vec3 u_viewPosition;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelViewMatrix * vec4(a_position,1.0);
        v_normal = mat3(u_modelViewMatrix) * a_normal;
        vec3 surfacePosition = (u_modelViewMatrix * vec4(a_position, 1)).xyz;
        v_surfaceToLight = u_lightPosition - surfacePosition;
        v_surfaceToView = u_viewPosition - surfacePosition;
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;

    
    void main() {
      vec3 ambientReflection = v_color;
      vec3 diffuseReflection = v_color;
      vec3 specularReflection = vec3(1.0,1.0,1.0);

      gl_FragColor = vec4(diffuseReflection, 1);

      vec3 normal = normalize(v_normal);
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

      float light = dot(surfaceToLightDirection,normal);
      float specular = 0.0;
      if (light > 0.0) {
        specular = pow(dot(normal, halfVector), 250.0);
      }

      gl_FragColor.rgb = 0.4*ambientReflection + 0.6*light*diffuseReflection;
      gl_FragColor.rgb += specular*specularReflection;
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
    const canvas = document.getElementById('lightningGl')
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
    const normalLocation = gl.getAttribLocation(program, 'a_normal');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    let cubeVertices = [];

    const ColorBuffer = gl.createBuffer();
    let cubeColors = [];

    const NormalBuffer = gl.createBuffer();
    let cubeNormals = [];

    const modelViewMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelViewMatrix')
    const viewingMatrixUniformLocation = gl.getUniformLocation(program, 'u_viewingMatrix')
    const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix')

    const lightPositionUniformLocation = gl.getUniformLocation(program, 'u_lightPosition')
    const viewPositionUniformLocation = gl.getUniformLocation(program, 'u_viewPosition')

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

    gl.uniform3fv(viewPositionUniformLocation, new Float32Array(P0));
    gl.uniform3fv(lightPositionUniformLocation, new Float32Array([0.0,0.0,1.0]));

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
    cubeNormals = setCubeNormals();

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
        drawCube(VertexBuffer, ColorBuffer, NormalBuffer, cubeVertices, cubeColors, cubeNormals, gl, positionLocation, colorLocation, normalLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz, P0, viewPositionUniformLocation, lightPositionUniformLocation);
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