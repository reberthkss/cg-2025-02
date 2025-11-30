import { GameObject } from './GameObject';
import { Mesh } from '../webgl/Mesh';
import { ShaderProgram } from '../webgl/ShaderProgram';
import { Primitives } from '../webgl/Primitives';
import { m4 } from '../m4';

export class Scenario extends GameObject {
    private floorMesh: Mesh;
    private waterMesh: Mesh;
    private shader: ShaderProgram;
    private gl: WebGLRenderingContext;

    private floorTexture: WebGLTexture | null = null;
    private waterTexture: WebGLTexture | null = null;

    constructor(gl: WebGLRenderingContext, shader: ShaderProgram) {
        super();
        this.gl = gl;
        this.shader = shader;

        // Create meshes
        this.floorMesh = new Mesh(gl, Primitives.createPlane(200, 200, 10, 10));
        this.waterMesh = new Mesh(gl, Primitives.createCube(100)); // Large cube for environment
    }

    async loadTextures(floorPath: string, waterPath: string): Promise<void> {
        this.floorTexture = await this.loadTexture(floorPath);
        this.waterTexture = await this.loadTexture(waterPath);
    }

    private loadTexture(url: string): Promise<WebGLTexture> {
        return new Promise((resolve, reject) => {
            const texture = this.gl.createTexture();
            if (!texture) {
                reject(new Error('Failed to create texture'));
                return;
            }

            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            // Put a single pixel in the texture so we can use it immediately.
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = this.gl.RGBA;
            const srcType = this.gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

            const image = new Image();
            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

                // WebGL1 has different requirements for power of 2 images
                // vs non power of 2 images so check if the image is a
                // power of 2 in both dimensions.
                if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                    // Yes, it's a power of 2. Generate mips.
                    this.gl.generateMipmap(this.gl.TEXTURE_2D);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                } else {
                    // No, it's not a power of 2. Turn off mips and set
                    // wrapping to clamp to edge
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                }
                resolve(texture);
            };
            image.onerror = reject;
            image.src = url;
        });
    }

    private isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    update(deltaTime: number): void {
        // No updates needed for static scenario yet
    }

    render(gl: WebGLRenderingContext): void {
        const positionLocation = this.shader.getAttribLocation('a_position');
        const normalLocation = this.shader.getAttribLocation('a_normal');
        const texcoordLocation = this.shader.getAttribLocation('a_texcoord');

        // Enable texture usage
        this.shader.setUniform1i('u_useTexture', 1);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.shader.setUniform1i('u_texture', 0);

        // --- Render Floor ---
        if (this.floorTexture) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.floorTexture);
        }

        this.floorMesh.bind(positionLocation, normalLocation, texcoordLocation);

        // Floor is at y = -5 (below fish)
        let modelMatrix = m4.translation(0, -5, 0);
        this.shader.setUniformMatrix4fv('u_modelMatrix', modelMatrix);

        let inverseTranspose = m4.transpose(m4.inverse(modelMatrix));
        this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

        this.floorMesh.draw();

        // --- Render Water Background (Skybox-ish) ---
        // We render the inside of a large cube.
        // Disable depth write so background is always behind? 
        // Or just make it huge. Let's make it huge and render first (or last with depth test).
        // Actually, for a simple "water" effect, a large cube around the scene works.

        if (this.waterTexture) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.waterTexture);
        }

        this.waterMesh.bind(positionLocation, normalLocation, texcoordLocation);

        // Center water cube on origin, but make it huge
        modelMatrix = m4.scaling(1, 1, 1); // Already size 100 in Primitives
        this.shader.setUniformMatrix4fv('u_modelMatrix', modelMatrix);

        inverseTranspose = m4.transpose(m4.inverse(modelMatrix));
        this.shader.setUniformMatrix4fv('u_inverseTransposeModelMatrix', inverseTranspose);

        // We need to see the INSIDE of the cube. 
        // Standard culling culls back faces (inside). 
        // We can flip cull face or just scale by -1?
        // Let's just disable culling for the water mesh for now.
        gl.disable(gl.CULL_FACE);
        this.waterMesh.draw();
        gl.enable(gl.CULL_FACE);
    }
}
