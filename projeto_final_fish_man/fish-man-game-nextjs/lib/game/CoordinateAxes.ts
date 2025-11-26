import { ShaderProgram } from '../webgl/ShaderProgram';
import { m4 } from '../m4';

export class CoordinateAxes {
  private gl: WebGLRenderingContext;
  private shader: ShaderProgram;
  private vertexBuffer: WebGLBuffer;
  private normalBuffer: WebGLBuffer;
  private vertices: Float32Array;
  private normals: Float32Array;

  constructor(gl: WebGLRenderingContext, shader: ShaderProgram, length: number = 100) {
    this.gl = gl;
    this.shader = shader;

    this.vertices = new Float32Array([
      // X axis
      -length, 0.0, 0.0,
      length, 0.0, 0.0,
      // Y axis
      0.0, -length, 0.0,
      0.0, length, 0.0,
      // Z axis
      0.0, 0.0, -length,
      0.0, 0.0, length,
    ]);

    this.normals = new Float32Array([
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
    ]);

    const vBuffer = gl.createBuffer();
    const nBuffer = gl.createBuffer();
    
    if (!vBuffer || !nBuffer) {
      throw new Error('Failed to create coordinate axes buffers');
    }

    this.vertexBuffer = vBuffer;
    this.normalBuffer = nBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
  }

  render(): void {
    const positionLocation = this.shader.getAttribLocation('a_position');
    const normalLocation = this.shader.getAttribLocation('a_normal');
    const texcoordLocation = this.shader.getAttribLocation('a_texcoord');

    this.shader.setUniform1i('u_useTexture', 0);

    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.enableVertexAttribArray(normalLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.disableVertexAttribArray(texcoordLocation);

    const identityMatrix = m4.identity();
    this.shader.setUniformMatrix4fv('u_modelMatrix', identityMatrix);
    const inverseTranspose = m4.transpose(m4.inverse(identityMatrix));
    this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

    // X axis (red)
    this.shader.setUniform3fv('u_color', [1.0, 0.0, 0.0]);
    this.gl.drawArrays(this.gl.LINES, 0, 2);

    // Y axis (green)
    this.shader.setUniform3fv('u_color', [0.0, 1.0, 0.0]);
    this.gl.drawArrays(this.gl.LINES, 2, 2);

    // Z axis (blue)
    this.shader.setUniform3fv('u_color', [0.0, 0.0, 1.0]);
    this.gl.drawArrays(this.gl.LINES, 4, 2);
  }
}
