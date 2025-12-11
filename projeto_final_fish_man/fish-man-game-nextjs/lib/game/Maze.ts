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
    private wallSize: number = 1.5; // Smaller walls = more space to navigate

    constructor(gl: WebGLRenderingContext, shader: ShaderProgram) {
        super();
        this.gl = gl;
        this.shader = shader;

        // 1 = Wall, 0 = Path
        // Simpler maze (31x31) with fewer walls and wider paths
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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

        // Coral/orange color to contrast with blue ocean
        this.shader.setUniform1i('u_useTexture', 0);
        this.shader.setUniform3fv('u_color', [1.0, 0.5, 0.2]); // Warm coral orange

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

    /**
     * Get a random valid spawn position in the maze
     * @param minDistanceFromStart Minimum distance from the start position
     */
    getRandomSpawnPosition(minDistanceFromStart: number = 10): { x: number, y: number, z: number } {
        const startPos = this.getStartPosition();
        const validPositions: { x: number, y: number, z: number }[] = [];

        // Collect all valid path positions
        for (let z = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[z][x] === 0) {
                    const xPos = (x - this.width / 2) * this.wallSize + this.wallSize / 2;
                    const zPos = (z - this.height / 2) * this.wallSize + this.wallSize / 2;
                    
                    // Calculate distance from start position
                    const dx = xPos - startPos.x;
                    const dz = zPos - startPos.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);

                    // Only add positions that are far enough from start
                    if (distance >= minDistanceFromStart) {
                        validPositions.push({ x: xPos, y: 0, z: zPos });
                    }
                }
            }
        }

        // Return random position from valid ones
        if (validPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * validPositions.length);
            return validPositions[randomIndex];
        }

        // Fallback to start position if no valid positions found
        return startPos;
    }

    /**
     * Check if a position collides with a wall
     * @param x World X position
     * @param z World Z position
     * @param radius Collision radius (fish size)
     * @returns true if collision detected, false otherwise
     */
    checkCollision(x: number, z: number, radius: number): boolean {
        // Convert world position to grid coordinates
        const gridX = Math.floor((x + this.width * this.wallSize / 2) / this.wallSize);
        const gridZ = Math.floor((z + this.height * this.wallSize / 2) / this.wallSize);

        // Check bounds
        if (gridX < 0 || gridX >= this.width || gridZ < 0 || gridZ >= this.height) {
            return true; // Out of bounds = collision
        }

        // Check if current cell is a wall
        if (this.map[gridZ][gridX] === 1) {
            return true;
        }

        // Check adjacent cells for more accurate collision with radius
        const cellsToCheck = [
            [gridX - 1, gridZ],     // Left
            [gridX + 1, gridZ],     // Right
            [gridX, gridZ - 1],     // Top
            [gridX, gridZ + 1],     // Bottom
            [gridX - 1, gridZ - 1], // Top-left
            [gridX + 1, gridZ - 1], // Top-right
            [gridX - 1, gridZ + 1], // Bottom-left
            [gridX + 1, gridZ + 1]  // Bottom-right
        ];

        for (const [cx, cz] of cellsToCheck) {
            if (cx >= 0 && cx < this.width && cz >= 0 && cz < this.height) {
                if (this.map[cz][cx] === 1) {
                    // Calculate distance from fish to wall cell center
                    const wallCenterX = (cx - this.width / 2) * this.wallSize + this.wallSize / 2;
                    const wallCenterZ = (cz - this.height / 2) * this.wallSize + this.wallSize / 2;
                    const dx = x - wallCenterX;
                    const dz = z - wallCenterZ;
                    const distance = Math.sqrt(dx * dx + dz * dz);

                    // Check if fish radius overlaps with wall
                    if (distance < radius + this.wallSize / 2) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getWallSize(): number {
        return this.wallSize;
    }
}
