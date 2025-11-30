import { GameObject } from './GameObject';
import { Mesh } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class Fish extends GameObject {
  private mesh: Mesh | null = null;
  private texture: WebGLTexture | null = null;
  private shader: ShaderProgram;
  private moveSpeed: number = 0.1;
  private time: number = 0;
  private bodyWiggleAmplitude: number = 3.0;

  constructor(shader: ShaderProgram) {
    super();
    this.shader = shader;
    // Start centered at origin with neutral rotation
    this.transform.position = { x: 0, y: 0, z: 0 };
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
  }

  setMesh(mesh: Mesh): void {
    this.mesh = mesh;
  }

  setTexture(texture: WebGLTexture): void {
    this.texture = texture;
  }

  moveX(direction: number): void {
    this.transform.position.x += direction * this.moveSpeed;
  }

  moveZ(direction: number): void {
    this.transform.position.z += direction * this.moveSpeed;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    // Body wiggle animation
    const bodyWiggle = Math.sin(this.time * 4.0) * this.bodyWiggleAmplitude;
    const wiggleRad = (bodyWiggle * Math.PI) / 180;

    this.updateModelMatrix();

    // Apply wiggle to the model matrix
    this.modelMatrix = m4.zRotate(this.modelMatrix, wiggleRad);
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
    }

    // Set model matrix
    this.shader.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);

    // Set inverse transpose for normals
    const inverseTranspose = m4.transpose(m4.inverse(this.modelMatrix));
    this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

    this.mesh.draw();
  }

  getMoveSpeed(): number {
    return this.moveSpeed;
  }

  setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }
}
