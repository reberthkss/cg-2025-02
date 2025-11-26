# Fish Man Game - Next.js

Jogo 3D WebGL de um peixe nadando, convertido para Next.js com arquitetura modular.

## 🏗️ Arquitetura do Projeto

```
lib/
├── game/
│   ├── GameManager.ts       # Gerenciador principal do jogo
│   ├── GameObject.ts         # Classe base para objetos do jogo
│   ├── Fish.ts              # Classe do peixe (jogador)
│   └── CoordinateAxes.ts    # Renderização dos eixos coordenados
├── webgl/
│   ├── ShaderProgram.ts     # Gerenciamento de shaders
│   ├── Camera.ts            # Sistema de câmera
│   └── Mesh.ts              # Gerenciamento de meshes
├── loaders/
│   ├── OBJLoader.ts         # Carregador de arquivos OBJ
│   └── MTLLoader.ts         # Carregador de materiais MTL
├── input/
│   └── InputManager.ts      # Sistema de input/controles
├── shaders/
│   └── shaders.ts           # Vertex e Fragment shaders
└── m4.ts                    # Biblioteca de matemática 4x4
```

## 🎮 Controles

- **W**: Move para frente
- **S**: Move para trás
- **A**: Vira para esquerda
- **D**: Vira para direita
- **1**: Projeção ortográfica
- **2**: Projeção perspectiva

## 🚀 Como Usar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📦 Componentes Principais

### GameManager
Gerencia o loop principal do jogo, renderização e atualizações.

### Fish
Objeto jogável com física de movimento e animação de nado.

### Camera
Sistema de câmera com suporte para projeção ortográfica e perspectiva.

### InputManager
Sistema modular de input com callbacks configuráveis.

## 🎨 Features

- ✅ Renderização WebGL otimizada
- ✅ Sistema de input modular
- ✅ Carregamento de modelos OBJ/MTL
- ✅ Iluminação e sombreamento
- ✅ Suporte a texturas
- ✅ Animação procedural
- ✅ Arquitetura orientada a objetos
