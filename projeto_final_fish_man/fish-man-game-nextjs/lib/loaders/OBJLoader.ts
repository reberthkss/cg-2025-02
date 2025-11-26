export interface OBJData {
  positions: number[];
  normals: number[];
  texcoords: number[];
  indices: number[];
  mtlFile: string | null;
}

export interface Material {
  ambient: number[];
  diffuse: number[];
  specular: number[];
  shininess: number;
  textureMap: string | null;
}

export interface Materials {
  [key: string]: Material;
}

export class OBJLoader {
  static async loadFromFile(filePath: string): Promise<OBJData | null> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const objText = await response.text();
      return this.parse(objText);
    } catch (error) {
      console.error('Error loading OBJ file:', error);
      return null;
    }
  }

  static parse(text: string): OBJData {
    const positions: number[] = [];
    const normals: number[] = [];
    const texcoords: number[] = [];
    const indices: number[] = [];

    const tempVertices: number[][] = [];
    const tempNormals: number[][] = [];
    const tempTexcoords: number[][] = [];

    let mtlFile: string | null = null;

    const lines = text.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#') || line === '') continue;

      const parts = line.split(/\s+/);
      const keyword = parts[0];
      const args = parts.slice(1);

      if (keyword === 'mtllib') {
        mtlFile = args[0];
      } else if (keyword === 'v') {
        tempVertices.push(args.map(parseFloat));
      } else if (keyword === 'vn') {
        tempNormals.push(args.map(parseFloat));
      } else if (keyword === 'vt') {
        tempTexcoords.push(args.map(parseFloat));
      } else if (keyword === 'f') {
        const faceVerts = args.map(f => {
          const parts = f.split('/');
          const v = parseInt(parts[0]) - 1;
          const vt = parts.length > 1 && parts[1] ? parseInt(parts[1]) - 1 : undefined;
          const n = parts.length > 2 && parts[2] ? parseInt(parts[2]) - 1 : undefined;
          return { v, vt, n };
        });

        for (let i = 1; i < faceVerts.length - 1; i++) {
          const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
          tri.forEach(({ v, vt, n }) => {
            const vert = tempVertices[v];
            const norm = n !== undefined ? tempNormals[n] : [0, 0, 1];
            const texcoord = vt !== undefined ? tempTexcoords[vt] : [0, 0];
            positions.push(...vert);
            normals.push(...norm);
            texcoords.push(texcoord[0], texcoord[1]);
            indices.push(indices.length);
          });
        }
      }
    }

    return { positions, normals, texcoords, indices, mtlFile };
  }
}
