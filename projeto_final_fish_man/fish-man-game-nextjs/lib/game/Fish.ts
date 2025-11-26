import { GameObject } from './GameObject';
import { Mesh } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class Fish extends GameObject {
  private mesh: Mesh | null = null;
  private shader: ShaderProgram;
  private moveSpeed: number = 10;
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

  moveForward(): void {
    const angle = this.transform.rotation.y;
    // this.transform.position.z -= this.moveSpeed * Math.cos(angle);
    this.transform.position.z += this.moveSpeed * Math.cos(angle);
    // this.transform.position.z += this.moveSpeed;
    // this.transform.position.x -= this.moveSpeed * Math.sin(angle);
    // this.transform.rotation.x += 0.01;
  }

  moveBackward(): void {
    const angle = this.transform.rotation.y;
    this.transform.position.z += this.moveSpeed * Math.cos(angle);
    // this.transform.position.x += this.moveSpeed * Math.sin(angle);
    // this.transform.rotation.x -= 0.01;
  }

  turnLeft(): void {
    this.transform.rotation.y += 0.05;
  }

  turnRight(): void {
    this.transform.rotation.y -= 0.05;
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
