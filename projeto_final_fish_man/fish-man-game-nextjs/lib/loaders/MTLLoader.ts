import { Materials, Material } from './OBJLoader';

export class MTLLoader {
  static async loadFromFile(filePath: string): Promise<Materials | null> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const mtlText = await response.text();
      return this.parse(mtlText);
    } catch (error) {
      console.error('Error loading MTL file:', error);
      return null;
    }
  }

  static parse(text: string): Materials {
    const materials: Materials = {};
    let currentMaterial: string | null = null;

    const lines = text.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#') || line === '') continue;

      const parts = line.split(/\s+/);
      const keyword = parts[0];
      const args = parts.slice(1);

      if (keyword === 'newmtl') {
        currentMaterial = args[0];
        materials[currentMaterial] = {
          ambient: [1, 1, 1],
          diffuse: [1, 1, 1],
          specular: [0.5, 0.5, 0.5],
          shininess: 250,
          textureMap: null
        };
      } else if (currentMaterial) {
        if (keyword === 'Ka') {
          materials[currentMaterial].ambient = args.map(parseFloat);
        } else if (keyword === 'Kd') {
          materials[currentMaterial].diffuse = args.map(parseFloat);
        } else if (keyword === 'Ks') {
          materials[currentMaterial].specular = args.map(parseFloat);
        } else if (keyword === 'Ns') {
          materials[currentMaterial].shininess = parseFloat(args[0]);
        } else if (keyword === 'map_Kd') {
          materials[currentMaterial].textureMap = args.join(' ');
        }
      }
    }

    return materials;
  }
}
