import { GameObject } from './GameObject';
import { Mesh } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class Shark extends GameObject {
  private mesh: Mesh | null = null;
  private texture: WebGLTexture | null = null;
  private shader: ShaderProgram;
  private moveSpeed: number = 0.05; // Slightly slower than fish
  private time: number = 0;
  private bodySwayAmplitude: number = 2.0; // Gentle sway for shark
  private collisionRadius: number = 0.5; // Larger collision radius
  private direction: { x: number; z: number }; // Movement direction
  private changeDirectionTimer: number = 0;
  private changeDirectionInterval: number = 3.0; // Change direction every 3 seconds

  constructor(shader: ShaderProgram, x: number = 0, z: number = 0) {
    super();
    this.shader = shader;
    // Position shark at specified location
    this.transform.position = { x, y: 0, z };
    this.transform.rotation.x = 0;
    this.transform.rotation.y = 0;
    this.transform.rotation.z = 0;
    this.transform.scale = { x: 1, y: 1, z: 1 }; // Shark scale
    
    // Initialize random direction
    this.direction = this.getRandomDirection();
  }

  setMesh(mesh: Mesh): void {
    this.mesh = mesh;
  }

  setTexture(texture: WebGLTexture): void {
    this.texture = texture;
  }

  private getRandomDirection(): { x: number; z: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      z: Math.sin(angle)
    };
  }

  update(deltaTime: number, checkCollision?: (x: number, z: number) => boolean): void {
    this.time += deltaTime;
    this.changeDirectionTimer += deltaTime;

    // Change direction periodically or randomly
    if (this.changeDirectionTimer >= this.changeDirectionInterval) {
      this.direction = this.getRandomDirection();
      this.changeDirectionTimer = 0;
      // Randomize next interval
      this.changeDirectionInterval = 2.0 + Math.random() * 3.0;
    }

    // Calculate new position
    const moveX = this.direction.x * this.moveSpeed;
    const moveZ = this.direction.z * this.moveSpeed;
    const newX = this.transform.position.x + moveX;
    const newZ = this.transform.position.z + moveZ;

    // Check collision before moving
    if (checkCollision && checkCollision(newX, newZ)) {
      // If collision, pick a completely new random direction instead of reversing
      this.direction = this.getRandomDirection();
      this.changeDirectionTimer = 0;
      // Try moving in the new direction immediately
      const retryX = this.transform.position.x + this.direction.x * this.moveSpeed;
      const retryZ = this.transform.position.z + this.direction.z * this.moveSpeed;
      
      // Only move if the new direction is clear
      if (!checkCollision || !checkCollision(retryX, retryZ)) {
        this.transform.position.x = retryX;
        this.transform.position.z = retryZ;
      }
    } else {
      // Update position
      this.transform.position.x = newX;
      this.transform.position.z = newZ;
    }

    // Update rotation to face movement direction
    const angle = Math.atan2(this.direction.x, this.direction.z);
    this.transform.rotation.y = angle;

    // body animation
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

  /**
   * Check if shark collides with a point (e.g., fish position)
   */
  checkCollisionWithPoint(x: number, z: number, radius: number): boolean {
    const dx = this.transform.position.x - x;
    const dz = this.transform.position.z - z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < (this.collisionRadius + radius);
  }
}
