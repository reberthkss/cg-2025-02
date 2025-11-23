// Vertex shader source code
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;
    
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec2 v_texcoord;
    
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_inverseTransposeModelMatrix;
    

    uniform vec3 u_lightPosition;
    uniform vec3 u_viewPosition;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelMatrix * vec4(a_position,1.0);
        v_normal = normalize(mat3(u_inverseTransposeModelMatrix) * a_normal);
        vec3 surfacePosition = (u_modelMatrix * vec4(a_position, 1.0)).xyz;
        v_surfaceToLight = u_lightPosition - surfacePosition;
        v_surfaceToView = u_viewPosition - surfacePosition;
        v_texcoord = a_texcoord;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    
    uniform vec3 u_color;
    uniform sampler2D u_texture;
    uniform bool u_useTexture;

    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec2 v_texcoord;

    
    void main() {
      vec3 baseColor = u_useTexture ? texture2D(u_texture, v_texcoord).rgb : u_color;
      vec3 ambientReflection = baseColor;
      vec3 diffuseReflection = baseColor;
      vec3 specularReflection = vec3(1.0,1.0,1.0);

      gl_FragColor = vec4(diffuseReflection, 1.0);

      vec3 normal = normalize(v_normal);
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

      float light = dot(surfaceToLightDirection,normal);
      float specular = 0.0;
      if (light > 0.0) {
        specular = pow(dot(normal, halfVector), 250.0);
      }

      gl_FragColor.rgb = 0.5*ambientReflection + 0.5*light*diffuseReflection;
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

async function loadOBJFromFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const objText = await response.text();
    return parseOBJ(objText);
  } catch (error) {
    console.error('Error loading OBJ file:', error);
    return null;
  }
}

async function loadMTLFromFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mtlText = await response.text();
    return parseMTL(mtlText);
  } catch (error) {
    console.error('Error loading MTL file:', error);
    return null;
  }
}

function parseMTL(text) {
  const materials = {};
  let currentMaterial = null;

  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#') || line === '') continue;

    const parts = line.split(/\s+/);
    const keyword = parts[0];
    const args = parts.slice(1);

    if (keyword === 'newmtl') {
      currentMaterial = args[0];
      materials[currentMaterial] = {
        ambient: [1, 1, 1],
        diffuse: [1, 1, 1],
        specular: [0.5, 0.5, 0.5],
        shininess: 250,
        textureMap: null
      };
    } else if (currentMaterial) {
      if (keyword === 'Ka') {
        materials[currentMaterial].ambient = args.map(parseFloat);
      } else if (keyword === 'Kd') {
        materials[currentMaterial].diffuse = args.map(parseFloat);
      } else if (keyword === 'Ks') {
        materials[currentMaterial].specular = args.map(parseFloat);
      } else if (keyword === 'Ns') {
        materials[currentMaterial].shininess = parseFloat(args[0]);
      } else if (keyword === 'map_Kd') {
        materials[currentMaterial].textureMap = args.join(' ');
      }
    }
  }

  return materials;
}

// Simple OBJ parser (vertex + normal + face)
function parseOBJ(text) {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];

  const tempVertices = [];
  const tempNormals = [];
  const tempTexcoords = [];
  
  let mtlFile = null;

  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#') || line === '') continue;

    const parts = line.split(/\s+/);
    const keyword = parts[0];
    const args = parts.slice(1);

    if (keyword === 'mtllib') {
      mtlFile = args[0];
    } else if (keyword === 'v') {
      tempVertices.push(args.map(parseFloat));
    } else if (keyword === 'vn') {
      tempNormals.push(args.map(parseFloat));
    } else if (keyword === 'vt') {
      tempTexcoords.push(args.map(parseFloat));
    } else if (keyword === 'f') {
      const faceVerts = args.map(f => {
        // Supports v//vn and v/vt/vn
        const parts = f.split('/');
        const v = parseInt(parts[0]) - 1;
        const vt = parts.length > 1 && parts[1] ? parseInt(parts[1]) - 1 : undefined;
        const n = parts.length > 2 && parts[2] ? parseInt(parts[2]) - 1 : undefined;
        return { v, vt, n };
      });

      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        tri.forEach(({ v, vt, n }) => {
          const vert = tempVertices[v];
          const norm = n !== undefined ? tempNormals[n] : [0, 0, 1]; // default normal
          const texcoord = vt !== undefined ? tempTexcoords[vt] : [0, 0]; // default texcoord
          positions.push(...vert);
          normals.push(...norm);
          texcoords.push(texcoord[0], texcoord[1]);
          indices.push(indices.length);
        });
      }
    }
  }

  return { positions, normals, texcoords, indices, mtlFile };
}

async function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Enable extension for 32-bit indices
    const ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        console.error('OES_element_index_uint not supported');
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normal');
    const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

    const VertexBuffer = gl.createBuffer();
    const NormalBuffer = gl.createBuffer();
    const TexcoordBuffer = gl.createBuffer();
    const IndexBuffer = gl.createBuffer();

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');
    const useTextureUniformLocation = gl.getUniformLocation(program, 'u_useTexture');

    const modelViewMatrixUniformLocation = gl.getUniformLocation(program,'u_modelMatrix');
    const viewingMatrixUniformLocation = gl.getUniformLocation(program,'u_viewingMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(program,'u_projectionMatrix');
    const inverseTransposeModelViewMatrixUniformLocation = gl.getUniformLocation(program, `u_inverseTransposeModelMatrix`);

    const lightPositionUniformLocation = gl.getUniformLocation(program,'u_lightPosition');
    const viewPositionUniformLocation = gl.getUniformLocation(program,'u_viewPosition');

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let modelViewMatrix = [];
    let inverseTransposeModelViewMatrix = [];

    let P0 = [0.0,0.0,40.0];
    let Pref = [0.0,0.0,0.0];
    let V = [0.0,1.0,0.0];
    let viewingMatrix = m4.setViewingMatrix(P0,Pref,V);

    gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
    gl.uniform3fv(viewPositionUniformLocation, new Float32Array(P0));
    gl.uniform3fv(lightPositionUniformLocation, new Float32Array([40.0,40.0,40.0]));

    let color = [1.0,0.0,0.0];
    gl.uniform3fv(colorUniformLocation, new Float32Array(color));

    let xw_min = -20.0;
    let xw_max = 20.0;
    let yw_min = -20.0;
    let yw_max = 20.0;
    let z_near = -1.0;
    let z_far = -100.0;

    let projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);

    let rotateX = 0;
    let rotateY = 0;
    let rotateZ = 0;

    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);

    function keyDown(event){
      event.preventDefault();
      switch(event.key){
        case '1':
          projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
          break;
        case '2':
          projectionMatrix = m4.setPerspectiveProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
          break;
        case 'x':
          rotateX = 1;
          rotateY = 0;
          rotateZ = 0;
          break;
        case 'y':
          rotateX = 0;
          rotateY = 1;
          rotateZ = 0;
          break;
        case 'z':
          rotateX = 0;
          rotateY = 0;
          rotateZ = 1;
          break;
      }
    }

    let theta_x = 0.0;
    let theta_y = 0.0;
    let theta_z = 0.0;

    const objData = await loadOBJFromFile('nemo_fish.obj');
    
    if (!objData) {
      console.error('Failed to load OBJ file');
      return;
    }

    console.log('OBJ loaded successfully');
    console.log('Positions:', objData.positions.length);
    console.log('Normals:', objData.normals.length);
    console.log('Texcoords:', objData.texcoords.length);
    console.log('Indices:', objData.indices.length);

    // Load MTL file if specified
    let materials = null;
    if (objData.mtlFile) {
      materials = await loadMTLFromFile(objData.mtlFile);
      console.log('MTL loaded:', materials);
    }

    let objVertices = new Float32Array(objData.positions);
    let objNormals = new Float32Array(objData.normals);
    let objTexcoords = new Float32Array(objData.texcoords);
    let objIndices = new Uint32Array(objData.indices)

    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, objVertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, NormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, objNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, TexcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, objTexcoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, objIndices, gl.STATIC_DRAW);

    // Load texture from MTL
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill with a placeholder color while loading
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    
    let textureLoaded = false;
    if (materials) {
      const firstMaterial = Object.values(materials)[0];
      if (firstMaterial && firstMaterial.textureMap) {
        const image = new Image();
        image.onload = function() {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip Y axis
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          
          // Check if texture is power of 2
          const isPowerOf2 = (value) => (value & (value - 1)) === 0;
          if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          } else {
            // NPOT texture - no mipmaps
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          }
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          textureLoaded = true;
          gl.uniform1i(useTextureUniformLocation, 1); // Enable texture
          console.log('Texture loaded successfully:', firstMaterial.textureMap, `(${image.width}x${image.height})`);
        };
        image.onerror = function() {
          console.warn('Failed to load texture:', firstMaterial.textureMap);
          gl.uniform1i(useTextureUniformLocation, 0); // Disable texture
        };
        image.src = firstMaterial.textureMap;
      }
      
      // Use material color if no texture
      if (firstMaterial && firstMaterial.diffuse) {
        gl.uniform3fv(colorUniformLocation, new Float32Array(firstMaterial.diffuse));
        console.log('Using material diffuse color:', firstMaterial.diffuse);
      }
    }
    
    // Set texture uniform
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureUniformLocation, 0);
    gl.uniform1i(useTextureUniformLocation, 0); // Start with texture disabled until loaded

    function drawObj(){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(normalLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, NormalBuffer);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(texcoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, TexcoordBuffer);
      gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);
      
      modelViewMatrix = m4.identity();
      modelViewMatrix = m4.xRotate(modelViewMatrix,degToRad(theta_x));
      modelViewMatrix = m4.yRotate(modelViewMatrix,degToRad(theta_y));
      modelViewMatrix = m4.zRotate(modelViewMatrix,degToRad(theta_z));

      inverseTransposeModelViewMatrix = m4.transpose(m4.inverse(modelViewMatrix));

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(inverseTransposeModelViewMatrixUniformLocation,false,inverseTransposeModelViewMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawElements(gl.TRIANGLES, objIndices.length, gl.UNSIGNED_INT, 0);
    }

    function drawScene(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (rotateX)
        theta_x += 1;
      if (rotateY)
        theta_y += 1;
      if (rotateZ)
        theta_z += 1;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
      drawObj();

      requestAnimationFrame(drawScene);
    }

    drawScene();
}

function crossProduct(v1, v2) {
  let result = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
  ];
  return result;
}

function unitVector(v){ 
    let vModulus = vectorModulus(v);
    return v.map(function(x) { return x/vModulus; });
}

function vectorModulus(v){
    return Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)+Math.pow(v[2],2));
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

window.addEventListener('load', main);