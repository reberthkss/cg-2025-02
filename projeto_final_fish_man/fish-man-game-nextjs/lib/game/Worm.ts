import { GameObject } from './GameObject';
import { Mesh, MeshData } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class Worm extends GameObject {
  private mesh: Mesh;
  private shader: ShaderProgram;
  private time: number = 0;
  private collisionRadius: number = 0.3;
  public isCollected: boolean = false;
  private bobAmplitude: number = 0.2; // Floating animation amplitude
  private rotationSpeed: number = 2.0; // Rotation speed

  constructor(gl: WebGLRenderingContext, shader: ShaderProgram, x: number, z: number) {
    super();
    this.shader = shader;
    this.transform.position = { x, y: 0.5, z };
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
    this.transform.scale = { x: 2.0, y: 2.0, z: 2.0 }; // Larger for visibility
    
    // Create a simple cube mesh
    this.mesh = this.createSpriteMesh(gl);
    this.updateModelMatrix(); // Initial matrix calculation
    
    console.log(`Worm created at position: (${x.toFixed(2)}, 0.5, ${z.toFixed(2)})`);
  }

  private createSpriteMesh(gl: WebGLRenderingContext): Mesh {
    // Create a simple cube instead of quad - easier to see
    const s = 0.3; // half size
    
    const positions = [
      // Front face
      -s, -s,  s,
       s, -s,  s,
       s,  s,  s,
      -s,  s,  s,
      // Back face
      -s, -s, -s,
      -s,  s, -s,
       s,  s, -s,
       s, -s, -s,
      // Top face
      -s,  s, -s,
      -s,  s,  s,
       s,  s,  s,
       s,  s, -s,
      // Bottom face
      -s, -s, -s,
       s, -s, -s,
       s, -s,  s,
      -s, -s,  s,
      // Right face
       s, -s, -s,
       s,  s, -s,
       s,  s,  s,
       s, -s,  s,
      // Left face
      -s, -s, -s,
      -s, -s,  s,
      -s,  s,  s,
      -s,  s, -s,
    ];

    const normals = [
      // Front
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      // Back
      0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
      // Top
      0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
      // Bottom
      0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
      // Right
      1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
      // Left
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    ];

    const texcoords = [];
    for (let i = 0; i < 6; i++) {
      texcoords.push(0, 0, 1, 0, 1, 1, 0, 1);
    }

    const indices = [
      0,  1,  2,    0,  2,  3,  // front
      4,  5,  6,    4,  6,  7,  // back
      8,  9,  10,   8,  10, 11, // top
      12, 13, 14,   12, 14, 15, // bottom
      16, 17, 18,   16, 18, 19, // right
      20, 21, 22,   20, 22, 23, // left
    ];

    const meshData: MeshData = {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      texcoords: new Float32Array(texcoords),
      indices: new Uint32Array(indices),
    };

    console.log('Creating worm cube mesh with', positions.length / 3, 'vertices');
    return new Mesh(gl, meshData);
  }

  update(deltaTime: number): void {
    if (this.isCollected) return;

    this.time += deltaTime;

    // Floating/bobbing animation (up and down)
    const bob = Math.sin(this.time * 3.0) * this.bobAmplitude;
    this.transform.position.y = 0.5 + bob;

    // Rotate on all axes for spinning effect
    this.transform.rotation.y += deltaTime * this.rotationSpeed;
    this.transform.rotation.x += deltaTime * this.rotationSpeed * 0.5;

    this.updateModelMatrix();
  }

  render(gl: WebGLRenderingContext): void {
    if (this.isCollected) return;

    const positionLocation = this.shader.getAttribLocation('a_position');
    const normalLocation = this.shader.getAttribLocation('a_normal');
    const texcoordLocation = this.shader.getAttribLocation('a_texcoord');

    this.mesh.bind(positionLocation, normalLocation, texcoordLocation);

    // No texture - use bright yellow color for high visibility
    this.shader.setUniform1i('u_useTexture', 0);
    this.shader.setUniform3fv('u_color', [1.0, 1.0, 0.0]); // Bright yellow

    // Set model matrix
    this.shader.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);

    // Set inverse transpose for normals
    const inverseTranspose = m4.transpose(m4.inverse(this.modelMatrix));
    this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

    this.mesh.draw();
  }

  checkCollisionWithPoint(x: number, z: number, radius: number): boolean {
    if (this.isCollected) return false;

    const dx = this.transform.position.x - x;
    const dz = this.transform.position.z - z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < (this.collisionRadius + radius);
  }

  collect(): void {
    this.isCollected = true;
  }

  isWormCollected(): boolean {
    return this.isCollected;
  }

  getCollisionRadius(): number {
    return this.collisionRadius;
  }
}
