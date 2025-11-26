import { m4 } from '../m4';

export interface Transform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export abstract class GameObject {
  protected transform: Transform;
  protected modelMatrix: number[];

  constructor() {
    this.transform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
    this.modelMatrix = m4.identity();
  }

  setPosition(x: number, y: number, z: number): void {
    this.transform.position = { x, y, z };
  }

  setRotation(x: number, y: number, z: number): void {
    this.transform.rotation = { x, y, z };
  }

  setScale(x: number, y: number, z: number): void {
    this.transform.scale = { x, y, z };
  }

  getPosition(): { x: number; y: number; z: number } {
    return this.transform.position;
  }

  translate(dx: number, dy: number, dz: number): void {
    this.transform.position.x += dx;
    this.transform.position.y += dy;
    this.transform.position.z += dz;
  }

  rotate(dx: number, dy: number, dz: number): void {
    this.transform.rotation.x += dx;
    this.transform.rotation.y += dy;
    this.transform.rotation.z += dz;
  }

  updateModelMatrix(): void {
    this.modelMatrix = m4.identity();
    
    // Apply transformations: translate -> rotate -> scale
    this.modelMatrix = m4.translate(
      this.modelMatrix,
      this.transform.position.x,
      this.transform.position.y,
      this.transform.position.z
    );

    this.modelMatrix = m4.xRotate(this.modelMatrix, this.transform.rotation.x);
    this.modelMatrix = m4.yRotate(this.modelMatrix, this.transform.rotation.y);
    this.modelMatrix = m4.zRotate(this.modelMatrix, this.transform.rotation.z);

    this.modelMatrix = m4.scale(
      this.modelMatrix,
      this.transform.scale.x,
      this.transform.scale.y,
      this.transform.scale.z
    );
  }

  getModelMatrix(): number[] {
    return this.modelMatrix;
  }

  abstract update(deltaTime: number): void;
  abstract render(gl: WebGLRenderingContext): void;
}
