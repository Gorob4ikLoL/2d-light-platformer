import { Player } from './Player';
import { Platform } from './Platform';

export class GameLoop {
  private ctx: CanvasRenderingContext2D;
  public player: Player;
  private platforms: Platform[];
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private backgroundImage: HTMLImageElement;
  private backgroundReady: boolean = false;
  private spawnEffectAngle: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.player = new Player(50, 200);
    
    // Create an expanded level layout with more interesting paths
    this.platforms = [
      // Spawn area with special platform
      new Platform(20, 250, 100, 20, '#00ff00'),
      
      // Main path - ground level
      new Platform(0, 350, 150, 50, '#4CAF50'),
      new Platform(200, 350, 120, 50, '#4CAF50'),
      new Platform(370, 350, 140, 50, '#4CAF50'),
      new Platform(560, 350, 120, 50, '#4CAF50'),
      new Platform(730, 350, 70, 50, '#4CAF50'),
      
      // Underground cave system
      new Platform(100, 450, 120, 20, '#455A64'),
      new Platform(270, 480, 100, 20, '#455A64'),
      new Platform(420, 450, 140, 20, '#455A64'),
      new Platform(610, 470, 90, 20, '#455A64'),
      
      // Middle path platforms
      new Platform(150, 250, 70, 20, '#FF9800'),
      new Platform(270, 220, 90, 20, '#FF9800'),
      new Platform(410, 250, 80, 20, '#FF9800'),
      new Platform(540, 220, 70, 20, '#FF9800'),
      new Platform(660, 250, 90, 20, '#FF9800'),
      
      // Upper challenge path
      new Platform(50, 150, 60, 20, '#2196F3'),
      new Platform(160, 120, 70, 20, '#2196F3'),
      new Platform(280, 90, 60, 20, '#2196F3'),
      new Platform(390, 120, 80, 20, '#2196F3'),
      new Platform(520, 90, 70, 20, '#2196F3'),
      new Platform(640, 120, 90, 20, '#2196F3'),
      
      // Secret bonus platforms
      new Platform(200, 40, 50, 20, '#9C27B0'),
      new Platform(350, 30, 40, 20, '#9C27B0'),
      new Platform(500, 40, 50, 20, '#9C27B0'),
      new Platform(700, 50, 40, 20, '#9C27B0'),
    ];

    // Load background image
    this.backgroundImage = new Image();
    this.backgroundImage.src = 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80';
    this.backgroundImage.onload = () => {
      this.backgroundReady = true;
    };
  }

  start() {
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }

  private animate(currentTime: number) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
  }

  private update(deltaTime: number) {
    this.player.update(deltaTime);
    
    // Update spawn effect animation
    this.spawnEffectAngle += deltaTime * 2;
    
    // Check platform collisions
    let onPlatform = false;
    for (const platform of this.platforms) {
      if (this.player.checkPlatformCollision(platform)) {
        onPlatform = true;
        break;
      }
    }
    
    if (!onPlatform) {
      this.player.fall();
    }
  }

  private draw() {
    const { width, height } = this.ctx.canvas;
    
    // Draw background
    if (this.backgroundReady) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.drawImage(this.backgroundImage, 0, 0, width, height);
      this.ctx.globalAlpha = 1;
    } else {
      // Fallback gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Draw death zone indicator
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    this.ctx.fillRect(0, 400, width, 100);

    // Draw decorative elements
    this.drawDecorations();

    // Draw platforms
    this.platforms.forEach(platform => platform.draw(this.ctx));

    // Draw player
    this.player.draw(this.ctx);

    // Draw enhanced spawn point
    this.drawEnhancedSpawnPoint();

    // Draw level completion indicator
    this.drawLevelIndicator();
  }

  private drawDecorations() {
    // Draw some background shapes
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * 200, 0);
      this.ctx.lineTo(i * 200 + 100, this.ctx.canvas.height);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
  }

  private drawEnhancedSpawnPoint() {
    const spawnX = 50;
    const spawnY = 200;

    // Draw outer glow
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    const gradient = this.ctx.createRadialGradient(
      spawnX, spawnY, 0,
      spawnX, spawnY, 30
    );
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(spawnX, spawnY, 30, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw rotating effect
    this.ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const angle = this.spawnEffectAngle + (i * Math.PI / 2);
      const radius = 15;
      const x = spawnX + Math.cos(angle) * radius;
      const y = spawnY + Math.sin(angle) * radius;
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw center point
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.arc(spawnX, spawnY, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private drawLevelIndicator() {
    // Draw arrow pointing to the end
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(750, 50);
    this.ctx.lineTo(770, 70);
    this.ctx.lineTo(750, 90);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
}