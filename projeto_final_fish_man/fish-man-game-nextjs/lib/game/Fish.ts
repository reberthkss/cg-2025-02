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
  private collisionRadius: number = 0.1; // Reduced collision radius

  constructor(shader: ShaderProgram) {
    super();
    this.shader = shader;
    // Start centered at origin with neutral rotation
    this.transform.position = { x: 0, y: 0, z: 0 };
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
    this.transform.scale = { x: 0.4, y: 0.4, z: 0.4 }; // Reduced scale
  }

  setMesh(mesh: Mesh): void {
    this.mesh = mesh;
  }

  setTexture(texture: WebGLTexture): void {
    this.texture = texture;
  }

  private resetRotation(): void {
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
  }

  /**
   * Move fish with diagonal support and automatic rotation
   * @param directionX X-axis direction (-1 left, 0 none, 1 right)
   * @param directionZ Z-axis direction (-1 forward, 0 none, 1 backward)
   * @param checkCollision Optional collision check function
   */
  move(directionX: number, directionZ: number, checkCollision?: (x: number, z: number) => boolean): void {
    this.resetRotation();

    // Calculate movement vector
    let moveX = directionX * this.moveSpeed;
    let moveZ = directionZ * this.moveSpeed;

    // Normalize diagonal movement to maintain consistent speed
    if (directionX !== 0 && directionZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX = (moveX / length) * this.moveSpeed;
      moveZ = (moveZ / length) * this.moveSpeed;
    }

    const newX = this.transform.position.x + moveX;
    const newZ = this.transform.position.z + moveZ;

    // Check collision before moving
    if (checkCollision && checkCollision(newX, newZ)) {
      return; // Blocked by wall
    }

    // Update position
    this.transform.position.x = newX;
    this.transform.position.z = newZ;

    // Calculate rotation based on movement direction
    if (directionX !== 0 || directionZ !== 0) {
      // Calculate angle in radians (atan2 gives angle from positive X-axis)
      const angle = Math.atan2(directionX, directionZ);
      this.transform.rotation.y = angle;
    }
  }

  // Keep legacy methods for compatibility
  moveX(direction: number, checkCollision?: (x: number, z: number) => boolean): void {
    this.move(direction, 0, checkCollision);
  }

  moveZ(direction: number, checkCollision?: (x: number, z: number) => boolean): void {
    this.move(0, direction, checkCollision);
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

  getCollisionRadius(): number {
    return this.collisionRadius;
  }
}
