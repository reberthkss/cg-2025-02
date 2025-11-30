import { MeshData } from './Mesh';

export class Primitives {
    static createPlane(width: number, depth: number, subdivisionsWidth: number, subdivisionsDepth: number): MeshData {
        const positions: number[] = [];
        const normals: number[] = [];
        const texcoords: number[] = [];
        const indices: number[] = [];

        for (let z = 0; z <= subdivisionsDepth; z++) {
            for (let x = 0; x <= subdivisionsWidth; x++) {
                const u = x / subdivisionsWidth;
                const v = z / subdivisionsDepth;

                const px = (u - 0.5) * width;
                const pz = (v - 0.5) * depth;
                const py = 0;

                positions.push(px, py, pz);
                normals.push(0, 1, 0);
                texcoords.push(u * 10, v * 10); // Repeat texture 10 times
            }
        }

        for (let z = 0; z < subdivisionsDepth; z++) {
            for (let x = 0; x < subdivisionsWidth; x++) {
                const row1 = z * (subdivisionsWidth + 1);
                const row2 = (z + 1) * (subdivisionsWidth + 1);

                // Triangle 1
                indices.push(row1 + x, row2 + x, row1 + x + 1);
                // Triangle 2
                indices.push(row1 + x + 1, row2 + x, row2 + x + 1);
            }
        }

        return {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            texcoords: new Float32Array(texcoords),
            indices: new Uint32Array(indices)
        };
    }

    static createCube(size: number): MeshData {
        // Cube vertices
        const positions = new Float32Array([
            // Front face
            -size, -size, size,
            size, -size, size,
            size, size, size,
            -size, size, size,
            // Back face
            -size, -size, -size,
            -size, size, -size,
            size, size, -size,
            size, -size, -size,
            // Top face
            -size, size, -size,
            -size, size, size,
            size, size, size,
            size, size, -size,
            // Bottom face
            -size, -size, -size,
            size, -size, -size,
            size, -size, size,
            -size, -size, size,
            // Right face
            size, -size, -size,
            size, size, -size,
            size, size, size,
            size, -size, size,
            // Left face
            -size, -size, -size,
            -size, -size, size,
            -size, size, size,
            -size, size, -size,
        ]);

        const normals = new Float32Array([
            // Front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            // Back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            // Top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            // Bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            // Right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            // Left
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ]);

        const texcoords = new Float32Array([
            // Front
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            // Back
            1, 0,
            1, 1,
            0, 1,
            0, 0,
            // Top
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // Bottom
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            // Right
            1, 0,
            1, 1,
            0, 1,
            0, 0,
            // Left
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);

        const indices = new Uint32Array([
            0, 1, 2, 0, 2, 3,    // Front
            4, 5, 6, 4, 6, 7,    // Back
            8, 9, 10, 8, 10, 11,   // Top
            12, 13, 14, 12, 14, 15,   // Bottom
            16, 17, 18, 16, 18, 19,   // Right
            20, 21, 22, 20, 22, 23    // Left
        ]);

        return { positions, normals, texcoords, indices };
    }
}
