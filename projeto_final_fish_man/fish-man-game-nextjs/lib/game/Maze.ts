import { GameObject } from './GameObject';
import { Mesh, MeshData } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { Primitives } from '../webgl/Primitives';
import { m4 } from '../m4';

export class Maze extends GameObject {
    private mesh: Mesh;
    private shader: ShaderProgram;
    private gl: WebGLRenderingContext;
    private width: number;
    private height: number;
    private map: number[][];
    private wallSize: number = 2.0; // Reverted to 2.0

    constructor(gl: WebGLRenderingContext, shader: ShaderProgram) {
        super();
        this.gl = gl;
        this.shader = shader;

        // 1 = Wall, 0 = Path
        // Larger maze (21x21)
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.width = this.map[0].length;
        this.height = this.map.length;

        const combinedMeshData = this.generateMazeMesh();
        this.mesh = new Mesh(gl, combinedMeshData);
    }

    private generateMazeMesh(): MeshData {
        const positions: number[] = [];
        const normals: number[] = [];
        const texcoords: number[] = [];
        const indices: number[] = [];
        let indexOffset = 0;

        const wallHeight = 2.0;

        for (let z = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[z][x] === 1) {
                    // Create a cube at this position
                    const cube = Primitives.createCube(this.wallSize / 2);

                    // Offset vertices
                    const xOffset = (x - this.width / 2) * this.wallSize + this.wallSize / 2;
                    const zOffset = ((z - this.height / 2) * this.wallSize + this.wallSize / 2);
                    const yOffset = wallHeight / 2; // Sit on floor

                    for (let i = 0; i < cube.positions.length; i += 3) {
                        positions.push(cube.positions[i] + xOffset);
                        positions.push(cube.positions[i + 1] + yOffset);
                        positions.push(cube.positions[i + 2] + zOffset);
                    }

                    for (let i = 0; i < cube.normals.length; i++) {
                        normals.push(cube.normals[i]);
                    }

                    for (let i = 0; i < cube.texcoords.length; i++) {
                        texcoords.push(cube.texcoords[i]);
                    }

                    for (let i = 0; i < cube.indices.length; i++) {
                        indices.push(cube.indices[i] + indexOffset);
                    }

                    indexOffset += cube.positions.length / 3;
                }
            }
        }

        return {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            texcoords: new Float32Array(texcoords),
            indices: new Uint32Array(indices)
        };
    }

    update(deltaTime: number): void {}

    render(gl: WebGLRenderingContext): void {
        const positionLocation = this.shader.getAttribLocation('a_position');
        const normalLocation = this.shader.getAttribLocation('a_normal');
        const texcoordLocation = this.shader.getAttribLocation('a_texcoord');

        // Use a default color for walls for now
        this.shader.setUniform1i('u_useTexture', 0);
        this.shader.setUniform3fv('u_color', [0.5, 0.5, 0.5]); // Grey walls

        this.mesh.bind(positionLocation, normalLocation, texcoordLocation);

        const modelMatrix = m4.identity();
        this.shader.setUniformMatrix4fv('u_modelMatrix', modelMatrix);

        const inverseTranspose = m4.transpose(m4.inverse(modelMatrix));
        this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

        this.mesh.draw();
    }

    getDimensions(): { width: number, depth: number } {
        return {
            width: this.width * this.wallSize,
            depth: this.height * this.wallSize
        };
    }

    getStartPosition(): { x: number, y: number, z: number } {
        for (let z = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[z][x] === 0) {
                    // Found first path
                    const xPos = (x - this.width / 2) * this.wallSize + this.wallSize / 2;
                    const zPos = (z - this.height / 2) * this.wallSize + this.wallSize / 2;
                    return { x: xPos, y: 0, z: zPos };
                }
            }
        }
        return { x: 0, y: 0, z: 0 }; // Default if no path found
    }
}
