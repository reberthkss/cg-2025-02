'use client';

import { useEffect, useRef, useState } from 'react';
import { GameManager } from '@/lib/game/GameManager';

export default function FishGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameManagerRef = useRef<GameManager | null>(null);
  const [score, setScore] = useState(0);
  const [totalWorms, setTotalWorms] = useState(10);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Initialize game manager
    const gameManager = new GameManager(canvas);
    gameManagerRef.current = gameManager;

    // Update score every frame
    const updateScore = () => {
      if (gameManagerRef.current) {
        setScore(gameManagerRef.current.getScore());
        setTotalWorms(gameManagerRef.current.getTotalWorms());
      }
      requestAnimationFrame(updateScore);
    };
    const scoreAnimationId = requestAnimationFrame(updateScore);

    // Load fish and shark models, worms use simple sprites
    const basePath = process.env.NODE_ENV === 'production' ? '/cg-2025-02' : '';
    Promise.all([
      gameManager.loadFishModel(`${basePath}/nemo_fish.obj`, `${basePath}/nemo_fish.mtl`),
      gameManager.loadSharkModels(`${basePath}/shark.obj`, `${basePath}/shark.mtl`)
    ])
      .then(() => {
        console.log('All models loaded successfully');
        gameManager.start();
      })
      .catch((error) => {
        console.error('Error loading models:', error);
      });

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(scoreAnimationId);
      gameManager.cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Fish Game</h1>
      <div className="mb-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          Score: {score} / {totalWorms}
        </div>
        {score >= totalWorms && totalWorms > 0 && (
          <div className="text-xl font-bold text-green-600 mt-2">
            🎉 You Win! All worms collected! 🎉
          </div>
        )}
      </div>
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
        <p className="text-xs mt-1">Colete todas as minhocas e evite os tubarões!</p>
      </div>
    </div>
  );
}
