import { GameObject } from './GameObject';
import { Mesh } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class Shark extends GameObject {
  private mesh: Mesh | null = null;
  private texture: WebGLTexture | null = null;
  private shader: ShaderProgram;
  private moveSpeed: number = 0.08; // Slightly slower than fish
  private time: number = 0;
  private bodySwayAmplitude: number = 2.0; // Gentle sway for shark
  private collisionRadius: number = 0.5; // Larger collision radius

  constructor(shader: ShaderProgram, x: number = 0, z: number = 0) {
    super();
    this.shader = shader;
    // Position shark at specified location
    this.transform.position = { x, y: 0, z };
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
    this.transform.scale = { x: 1, y: 1, z: 1 }; // Shark scale
  }

  setMesh(mesh: Mesh): void {
    this.mesh = mesh;
  }

  setTexture(texture: WebGLTexture): void {
    this.texture = texture;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    // Gentle body sway animation
    const bodySway = Math.sin(this.time * 3.0) * this.bodySwayAmplitude;
    const swayRad = (bodySway * Math.PI) / 180;

    this.updateModelMatrix();

    // Apply sway to the model matrix
    this.modelMatrix = m4.zRotate(this.modelMatrix, swayRad);
  }

  render(gl: WebGLRenderingContext): void {
    if (!this.mesh) return;

    const positionLocation = this.shader.getAttribLocation('a_position');
    const normalLocation = this.shader.getAttribLocation('a_normal');
    const texcoordLocation = this.shader.getAttribLocation('a_texcoord');

    this.mesh.bind(positionLocation, normalLocation, texcoordLocation);

    // Bind texture if available
    if (this.texture) {
      this.shader.setUniform1i('u_useTexture', 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      this.shader.setUniform1i('u_texture', 0);
    } else {
      this.shader.setUniform1i('u_useTexture', 0);
      // Gray color for shark if no texture
      this.shader.setUniform3fv('u_color', [0.4, 0.4, 0.5]);
    }

    // Set model matrix
    this.shader.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);

    // Set inverse transpose for normals
    const inverseTranspose = m4.transpose(m4.inverse(this.modelMatrix));
    this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

    this.mesh.draw();
  }

  getCollisionRadius(): number {
    return this.collisionRadius;
  }
}
