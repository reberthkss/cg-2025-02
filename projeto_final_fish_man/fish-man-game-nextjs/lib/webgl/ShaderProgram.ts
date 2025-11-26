export class ShaderProgram {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private attributes: Map<string, number> = new Map();
  private uniforms: Map<string, WebGLUniformLocation | null> = new Map();

  constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    this.gl = gl;
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    this.program = this.createProgram(vertexShader, fragmentShader);
    
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      throw new Error('Failed to link program');
    }

    return program;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name: string): number {
    if (!this.attributes.has(name)) {
      const location = this.gl.getAttribLocation(this.program, name);
      this.attributes.set(name, location);
    }
    return this.attributes.get(name)!;
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) {
      const location = this.gl.getUniformLocation(this.program, name);
      this.uniforms.set(name, location);
    }
    return this.uniforms.get(name)!;
  }

  setUniform3fv(name: string, value: Float32Array | number[]): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniform3fv(location, value);
    }
  }

  setUniform1i(name: string, value: number): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniform1i(location, value);
    }
  }

  setUniformMatrix4fv(name: string, value: Float32Array | number[]): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniformMatrix4fv(location, false, value instanceof Float32Array ? value : new Float32Array(value));
    }
  }

  getProgram(): WebGLProgram {
    return this.program;
  }
}
