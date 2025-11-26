export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  texcoords: Float32Array;
  indices: Uint32Array;
}

export class Mesh {
  private gl: WebGLRenderingContext;
  private vertexBuffer: WebGLBuffer;
  private normalBuffer: WebGLBuffer;
  private texcoordBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
  private indexCount: number;

  constructor(gl: WebGLRenderingContext, data: MeshData) {
    this.gl = gl;
    this.indexCount = data.indices.length;

    // Create and bind vertex buffer
    this.vertexBuffer = this.createBuffer(data.positions);
    this.normalBuffer = this.createBuffer(data.normals);
    this.texcoordBuffer = this.createBuffer(data.texcoords);
    this.indexBuffer = this.createIndexBuffer(data.indices);
  }

  private createBuffer(data: Float32Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    
    return buffer;
  }

  private createIndexBuffer(data: Uint32Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create index buffer');
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    
    return buffer;
  }

  bind(positionLocation: number, normalLocation: number, texcoordLocation: number): void {
    // Bind vertex positions
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    // Bind normals
    this.gl.enableVertexAttribArray(normalLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

    // Bind texcoords
    this.gl.enableVertexAttribArray(texcoordLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
    this.gl.vertexAttribPointer(texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Bind indices
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  draw(): void {
    this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_INT, 0);
  }

  getIndexCount(): number {
    return this.indexCount;
  }
}
