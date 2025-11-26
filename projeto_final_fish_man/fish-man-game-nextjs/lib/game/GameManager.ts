import { ShaderProgram } from '../webgl/ShaderProgram';
import { Camera, ProjectionType } from '../webgl/Camera';
import { Mesh, MeshData } from '../webgl/Mesh';
import { Fish } from '../game/Fish';
import { CoordinateAxes } from '../game/CoordinateAxes';
import { InputManager, Key } from '../input/InputManager';
import { OBJLoader } from '../loaders/OBJLoader';
import { MTLLoader } from '../loaders/MTLLoader';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from '../shaders/shaders';

export class GameManager {
  private gl: WebGLRenderingContext;
  private shader: ShaderProgram;
  private camera: Camera;
  private fish: Fish;
  private coordinateAxes: CoordinateAxes;
  private inputManager: InputManager;
  private lastFrameTime: number = 0;
  private animationId: number = 0;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;

    // Enable 32-bit indices extension
    const ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
      console.warn('OES_element_index_uint not supported');
    }

    // Initialize WebGL settings
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Create shader program
    this.shader = new ShaderProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    this.shader.use();

    // Create camera (top-down view)
    const cameraPosition = [0, 50, 0];  // Camera above and behind looking down
    const cameraTarget = [1, 0, 10];      // Looking at origin (center)
    const cameraUp = [0, 1, 0];          // Up vector pointing upward (Y-axis)
    this.camera = new Camera(cameraPosition, cameraTarget, cameraUp);

    // Create game objects
    this.fish = new Fish(this.shader);
    this.coordinateAxes = new CoordinateAxes(gl, this.shader);

    // Create input manager
    this.inputManager = new InputManager();
    this.setupInputHandlers();

    // Setup lighting and camera uniforms
    this.setupUniforms();
  }

  private setupUniforms(): void {
    this.shader.setUniform3fv('u_lightPosition', [0.0, 40.0, 0.0]);
    this.shader.setUniform3fv('u_viewPosition', this.camera.getPosition());
    this.shader.setUniform3fv('u_color', [1.0, 0.0, 0.0]);
    
    const viewMatrix = this.camera.getViewMatrix();
    this.shader.setUniformMatrix4fv('u_viewingMatrix', viewMatrix);
    
    const projectionMatrix = this.camera.getProjectionMatrix();
    this.shader.setUniformMatrix4fv('u_projectionMatrix', projectionMatrix);
  }

  private setupInputHandlers(): void {
    // Projection switching
    this.inputManager.onKeyPress(Key.ONE, () => {
      this.camera.setProjectionType(ProjectionType.ORTHOGRAPHIC);
      const projectionMatrix = this.camera.getProjectionMatrix();
      this.shader.setUniformMatrix4fv('u_projectionMatrix', projectionMatrix);
    });

    this.inputManager.onKeyPress(Key.TWO, () => {
      this.camera.setProjectionType(ProjectionType.PERSPECTIVE);
      const projectionMatrix = this.camera.getProjectionMatrix();
      this.shader.setUniformMatrix4fv('u_projectionMatrix', projectionMatrix);
    });
  }

  async loadFishModel(objPath: string, mtlPath?: string): Promise<void> {
    const objData = await OBJLoader.loadFromFile(objPath);
    if (!objData) {
      throw new Error('Failed to load OBJ file');
    }

    console.log('OBJ loaded successfully');
    console.log('Vertices:', objData.positions.length / 3);
    console.log('Indices:', objData.indices.length);

    const meshData: MeshData = {
      positions: new Float32Array(objData.positions),
      normals: new Float32Array(objData.normals),
      texcoords: new Float32Array(objData.texcoords),
      indices: new Uint32Array(objData.indices)
    };

    const mesh = new Mesh(this.gl, meshData);
    this.fish.setMesh(mesh);

    // Load texture if MTL exists
    if (objData.mtlFile || mtlPath) {
      const mtlFilePath = mtlPath || '/' + objData.mtlFile;
      await this.loadTexture(mtlFilePath);
    }
  }

  private async loadTexture(mtlPath: string): Promise<void> {
    const materials = await MTLLoader.loadFromFile(mtlPath);
    if (!materials) {
      console.warn('Failed to load MTL file');
      return;
    }

    console.log('MTL loaded successfully');

    const firstMaterial = Object.values(materials)[0];
    if (!firstMaterial) return;

    // Set material color
    if (firstMaterial.diffuse) {
      this.shader.setUniform3fv('u_color', firstMaterial.diffuse);
    }

    // Load texture image
    if (firstMaterial.textureMap) {
      const texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, 
        this.gl.RGBA, this.gl.UNSIGNED_BYTE, 
        new Uint8Array([255, 255, 255, 255])
      );

      const image = new Image();
      image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
          this.gl.RGBA, this.gl.UNSIGNED_BYTE, image
        );

        const isPowerOf2 = (value: number) => (value & (value - 1)) === 0;
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          this.gl.generateMipmap(this.gl.TEXTURE_2D);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        } else {
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        }
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.shader.setUniform1i('u_useTexture', 1);
        console.log('Texture loaded:', firstMaterial.textureMap);
      };

      image.onerror = () => {
        console.warn('Failed to load texture:', firstMaterial.textureMap);
        this.shader.setUniform1i('u_useTexture', 0);
      };

      image.src = '/' + firstMaterial.textureMap;

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.shader.setUniform1i('u_texture', 0);
      this.shader.setUniform1i('u_useTexture', 0);
    }
  }

  private update(deltaTime: number): void {
    // Handle continuous input
    if (this.inputManager.isKeyPressed(Key.W)) {
      this.fish.moveForward();
    }
    if (this.inputManager.isKeyPressed(Key.S)) {
      this.fish.moveBackward();
    }
    if (this.inputManager.isKeyPressed(Key.A)) {
      this.fish.turnLeft();
    }
    if (this.inputManager.isKeyPressed(Key.D)) {
      this.fish.turnRight();
    }

    // Update game objects
    this.fish.update(deltaTime);
  }

  private render(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Render fish
    this.fish.render(this.gl);

    // Render coordinate axes
    this.coordinateAxes.render();
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.update(deltaTime / 1000); // Convert to seconds
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  cleanup(): void {
    this.stop();
    this.inputManager.cleanup();
  }

  getFish(): Fish {
    return this.fish;
  }

  getCamera(): Camera {
    return this.camera;
  }
}
