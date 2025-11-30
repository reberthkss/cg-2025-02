import { m4 } from '../m4';

export enum ProjectionType {
  ORTHOGRAPHIC = 'orthographic',
  PERSPECTIVE = 'perspective'
}

export class Camera {
  private position: number[];
  private target: number[];
  private up: number[];
  private projectionType: ProjectionType;

  // Projection bounds
  private xMin: number;
  private xMax: number;
  private yMin: number;
  private yMax: number;
  private zNear: number;
  private zFar: number;
  private fieldOfView: number; // in radians
  private aspectRatio: number;

  constructor(
    position: number[] = [0, 30, 15],  // Camera position in 3D space
    target: number[] = [0, 0, 0],      // Point the camera is looking at
    up: number[] = [0, 0, 1]           // Up direction vector
  ) {
    this.position = position;
    this.target = target;
    this.up = up;
    this.projectionType = ProjectionType.ORTHOGRAPHIC;

    // Default projection bounds (good for top-down games)
    // Larger area = more visible space, smaller values = more zoomed in
    this.xMin = -30.0;   // Left boundary
    this.xMax = 30.0;    // Right boundary (40 units wide view)
    this.yMin = -30.0;   // Bottom boundary
    this.yMax = 30.0;    // Top boundary (40 units tall view)
    this.zNear = -1.0;   // Closer near plane for perspective
    this.zFar = -2000.0; // Farther far plane
    this.fieldOfView = 60 * Math.PI / 180; // 60 degrees
    this.aspectRatio = 1.0;
  }

  getViewMatrix(): number[] {
    return m4.setViewingMatrix(this.position, this.target, this.up);
  }

  getProjectionMatrix(): number[] {
    if (this.projectionType === ProjectionType.ORTHOGRAPHIC) {
      return m4.setOrthographicProjectionMatrix(
        this.xMin, this.xMax, this.yMin, this.yMax, this.zNear, this.zFar
      );
    } else {
      // Calculate bounds based on FOV and Aspect Ratio for Perspective
      // tan(fov/2) = top / |zNear|
      const top = Math.abs(this.zNear) * Math.tan(this.fieldOfView * 0.5);
      const bottom = -top;
      const right = top * this.aspectRatio;
      const left = -right;

      return m4.setPerspectiveProjectionMatrix(
        left, right, bottom, top, this.zNear, this.zFar
      );
    }
  }

  setAspectRatio(aspect: number): void {
    this.aspectRatio = aspect;
  }

  setProjectionType(type: ProjectionType): void {
    this.projectionType = type;
  }

  getPosition(): number[] {
    return this.position;
  }

  setPosition(x: number, y: number, z: number): void {
    this.position = [x, y, z];
  }

  setTarget(x: number, y: number, z: number): void {
    this.target = [x, y, z];
  }

  setProjectionBounds(
    xMin: number, xMax: number,
    yMin: number, yMax: number,
    zNear: number, zFar: number
  ): void {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
    this.zNear = zNear;
    this.zFar = zFar;
  }
}
