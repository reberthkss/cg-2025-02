'use client';

import { useEffect, useRef } from 'react';
import { GameManager } from '@/lib/game/GameManager';

export default function FishGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Initialize game manager
    const gameManager = new GameManager(canvas);
    gameManagerRef.current = gameManager;

    // Load fish model and start game
    gameManager.loadFishModel('/nemo_fish.obj', '/nemo_fish.mtl')
      .then(() => {
        console.log('Fish model loaded successfully');
        gameManager.start();
      })
      .catch((error) => {
        console.error('Error loading fish model:', error);
      });

    // Cleanup on unmount
    return () => {
      gameManager.cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Fish Game</h1>
      <div className="border-2 border-gray-300 bg-gray-100 p-4 rounded-lg">
        <canvas 
          ref={canvasRef} 
          id="glCanvas" 
          width={500} 
          height={500}
          className="border border-gray-400 bg-black"
        />
      </div>
      <div className="mt-4 text-center text-gray-600">
        <p className="text-sm">Controles: W/A/S/D para mover | 1: Ortográfica | 2: Perspectiva</p>
      </div>
    </div>
  );
}
