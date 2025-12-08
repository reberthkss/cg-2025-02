import { ShaderProgram } from '../webgl/ShaderProgram';
import { Camera, ProjectionType } from '../webgl/Camera';
import { Mesh, MeshData } from '../webgl/Mesh';
import { Fish } from '../game/Fish';
import { Maze } from '../game/Maze';
import { CoordinateAxes } from '../game/CoordinateAxes';
import { Scenario } from '../game/Scenario';
import { InputManager, Key } from '../input/InputManager';
import { OBJLoader } from '../loaders/OBJLoader';
import { MTLLoader } from '../loaders/MTLLoader';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from '../shaders/shaders';

export class GameManager {
  private gl: WebGLRenderingContext;
  private shader: ShaderProgram;
  private camera: Camera;
  private fish: Fish;
  private maze: Maze;
  private coordinateAxes: CoordinateAxes;
  private scenario: Scenario;
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
    const cameraPosition = [0, 50, 0];   // Top-down view
    const cameraTarget = [0, 0, 0];      // Looking at origin
    const cameraUp = [0, 0, -1];         // Up vector points along -Z (standard for top-down)
    this.camera = new Camera(cameraPosition, cameraTarget, cameraUp);
    // this.camera.setProjectionType(ProjectionType.PERSPECTIVE); // Reverted to default (Ortho)

    // Create game objects
    // Create game objects
    this.fish = new Fish(this.shader);
    this.maze = new Maze(gl, this.shader);
    this.coordinateAxes = new CoordinateAxes(gl, this.shader);
    this.scenario = new Scenario(gl, this.shader);

    // Set fish spawn position
    const startPos = this.maze.getStartPosition();
    this.fish.setPosition(startPos.x, startPos.y, startPos.z);

    // Adjust camera to fit maze
    const mazeDims = this.maze.getDimensions();
    const maxDim = Math.max(mazeDims.width, mazeDims.depth);
    const margin = 10;
    const bound = maxDim / 2 + margin;
    this.camera.setProjectionBounds(-bound, bound, -bound, bound, -10, -200);

    // Load scenario textures
    this.scenario.loadTextures('/sand_texture.png', '/water_texture.png')
      .then(() => console.log('Scenario textures loaded'))
      .catch(err => console.error('Failed to load scenario textures:', err));

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

    // Lighting and Fog
    this.shader.setUniform3fv('u_ambientLight', [0.2, 0.3, 0.4]); // Blue-ish ambient
    this.shader.setUniform3fv('u_lightColor', [1.0, 0.9, 0.8]);   // Warm sunlight
    this.shader.setUniform3fv('u_fogColor', [0.0, 0.4, 0.6]);     // Deep blue fog
    this.shader.setUniform1f('u_fogDensity', 0.02);

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
      const texture = await this.loadTexture(mtlFilePath);
      if (texture) {
        this.fish.setTexture(texture);
      }
    }
  }

  private async loadTexture(mtlPath: string): Promise<WebGLTexture | null> {
    const materials = await MTLLoader.loadFromFile(mtlPath);
    if (!materials) {
      console.warn('Failed to load MTL file');
      return null;
    }

    console.log('MTL loaded successfully');

    const firstMaterial = Object.values(materials)[0];
    if (!firstMaterial) return null;

    // Set material color
    if (firstMaterial.diffuse) {
      this.shader.setUniform3fv('u_color', firstMaterial.diffuse);
    }

    // Load texture image
    if (firstMaterial.textureMap) {
      return new Promise((resolve) => {
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
          console.log('Texture loaded:', firstMaterial.textureMap);
          resolve(texture);
        };

        image.onerror = () => {
          console.warn('Failed to load texture:', firstMaterial.textureMap);
          resolve(null);
        };

        image.src = '/' + firstMaterial.textureMap;
      });
    }
    return null;
  }

  private update(deltaTime: number): void {
    // Create collision check function for fish
    const checkCollision = (x: number, z: number): boolean => {
      return this.maze.checkCollision(x, z, this.fish.getCollisionRadius());
    };

    // Handle continuous input with collision checking
    if (this.inputManager.isKeyPressed(Key.W)) {
      this.fish.moveZ(-1, checkCollision);
    }
    if (this.inputManager.isKeyPressed(Key.S)) {
      this.fish.moveZ(1, checkCollision);
    }

    if (this.inputManager.isKeyPressed(Key.A)) {
      this.fish.moveX(-1, checkCollision);
    }
    if (this.inputManager.isKeyPressed(Key.D)) {
      this.fish.moveX(1, checkCollision);
    }

    const fishPosition = this.fish.getPosition();

    // Aim camera at fish - REMOVED for static view
    // this.camera.setTarget(fishPosition.x, fishPosition.y, fishPosition.z);

    // Update game objects with deltaTime
    this.fish.update(deltaTime);
  }

  private render(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Update aspect ratio
    const aspect = this.gl.canvas.width / this.gl.canvas.height;
    this.camera.setAspectRatio(aspect);

    // Update Camera Uniforms (View & Projection)
    const viewMatrix = this.camera.getViewMatrix();
    this.shader.setUniformMatrix4fv('u_viewingMatrix', viewMatrix);

    const projectionMatrix = this.camera.getProjectionMatrix();
    this.shader.setUniformMatrix4fv('u_projectionMatrix', projectionMatrix);

    this.shader.setUniform3fv('u_viewPosition', this.camera.getPosition());

    // Render scenario
    this.scenario.render(this.gl);

    // Render maze
    this.maze.render(this.gl);

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
