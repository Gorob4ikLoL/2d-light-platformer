import React, { useEffect, useRef, useState } from 'react';
import { GameLoop } from './GameLoop';
import { Player } from './Player';
import { Platform } from './Platform';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameLoop, setGameLoop] = useState<GameLoop | null>(null);
  const [jumpsLeft, setJumpsLeft] = useState(2);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = new GameLoop(ctx);
    setGameLoop(game);
    game.start();

    return () => game.stop();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameLoop) return;
    
    switch (e.code) {
      case 'ArrowLeft':
        gameLoop.player.moveLeft();
        break;
      case 'ArrowRight':
        gameLoop.player.moveRight();
        break;
      case 'Space':
        if (gameLoop.player.jump()) {
          setJumpsLeft(prev => Math.max(0, prev - 1));
        }
        break;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold text-blue-600">2D Platformer</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-blue-500 rounded-lg shadow-lg bg-gradient-to-b from-blue-900 to-blue-950"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded">
          <p>Use ← → to move</p>
          <p>Press Space to double jump!</p>
        </div>
      </div>
    </div>
  );
};