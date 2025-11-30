export const VERTEX_SHADER_SOURCE = `
  attribute vec3 a_position;
  attribute vec3 a_normal;
  attribute vec2 a_texcoord;
  
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying float v_fogDepth;
  
  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewingMatrix;
  uniform mat4 u_projectionMatrix;
  uniform mat4 u_inverseTransposeModelMatrix;
  
  uniform vec3 u_lightPosition;
  uniform vec3 u_viewPosition;

  void main() {
      vec4 position = u_viewingMatrix * u_modelMatrix * vec4(a_position, 1.0);
      gl_Position = u_projectionMatrix * position;
      v_normal = normalize(mat3(u_inverseTransposeModelMatrix) * a_normal);
      vec3 surfacePosition = (u_modelMatrix * vec4(a_position, 1.0)).xyz;
      v_surfaceToLight = u_lightPosition - surfacePosition;
      v_surfaceToView = u_viewPosition - surfacePosition;
      v_texcoord = a_texcoord;
      v_fogDepth = -position.z;
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  
  uniform vec3 u_color;
  uniform sampler2D u_texture;
  uniform bool u_useTexture;
  uniform vec3 u_ambientLight;
  uniform vec3 u_lightColor;
  uniform vec3 u_fogColor;
  uniform float u_fogDensity;

  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying float v_fogDepth;
  
  void main() {
    vec3 baseColor = u_useTexture ? texture2D(u_texture, v_texcoord).rgb : u_color;
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float light = dot(surfaceToLightDirection, normal);
    float specular = 0.0;
    if (light > 0.0) {
      specular = pow(dot(normal, halfVector), 50.0); // Reduced shininess for water
    }

    vec3 ambient = u_ambientLight * baseColor;
    vec3 diffuse = light * u_lightColor * baseColor;
    vec3 specularColor = specular * u_lightColor;

    vec3 finalColor = ambient + diffuse + specularColor;

    // Fog calculation
    float fogAmount = 1.0 - exp2(-u_fogDensity * u_fogDensity * v_fogDepth * v_fogDepth * 1.442695);
    fogAmount = clamp(fogAmount, 0.0, 1.0);

    gl_FragColor = vec4(mix(finalColor, u_fogColor, fogAmount), 1.0);
  }
`;
