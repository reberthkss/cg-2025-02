export enum Key {
  W = 'w',
  A = 'a',
  S = 's',
  D = 'd',
  ONE = '1',
  TWO = '2',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
}

export class InputManager {
  private keysPressed: Set<string> = new Set();
  private keyCallbacks: Map<string, () => void> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault();
    this.keysPressed.add(event.key.toLowerCase());
    
    const callback = this.keyCallbacks.get(event.key.toLowerCase());
    if (callback) {
      callback();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key.toLowerCase());
  }

  isKeyPressed(key: Key | string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  onKeyPress(key: Key | string, callback: () => void): void {
    this.keyCallbacks.set(key.toLowerCase(), callback);
  }

  removeKeyCallback(key: Key | string): void {
    this.keyCallbacks.delete(key.toLowerCase());
  }

  cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.keysPressed.clear();
    this.keyCallbacks.clear();
  }
}
