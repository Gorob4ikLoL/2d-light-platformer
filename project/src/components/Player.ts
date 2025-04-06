import { Platform } from './Platform';

export class Player {
  public x: number;
  public y: number;
  public width: number = 30;
  public height: number = 30;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private speed: number = 350;
  private gravity: number = 900;
  private jumpForce: number = -450;
  private canJump: boolean = false;
  private jumpsLeft: number = 2;
  private rotation: number = 0;
  private color: string = '#FF3366';
  private friction: number = 0.85;
  private spawnX: number;
  private spawnY: number;
  private angularVelocity: number = 0;
  private maxAngularVelocity: number = 10;
  private angularFriction: number = 0.95;

  constructor(x: number, y: number) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number) {
    // Update position with improved physics
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Update rotation with momentum
    this.angularVelocity += (this.velocityX * deltaTime * 0.02);
    this.angularVelocity = Math.max(Math.min(this.angularVelocity, this.maxAngularVelocity), -this.maxAngularVelocity);
    this.rotation += this.angularVelocity * deltaTime;
    this.angularVelocity *= this.angularFriction;

    // Apply improved friction with momentum
    this.velocityX *= Math.pow(this.friction, deltaTime * 60);

    // Keep player in bounds with bounce effect
    if (this.x < 0) {
      this.x = 0;
      this.velocityX *= -0.5;
      this.angularVelocity *= -0.5;
    }
    if (this.x > 800 - this.width) {
      this.x = 800 - this.width;
      this.velocityX *= -0.5;
      this.angularVelocity *= -0.5;
    }

    // Check for death zone (falling below screen)
    if (this.y > 500) {
      this.respawn();
    }

    // Prevent extremely small movements
    if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
    if (Math.abs(this.angularVelocity) < 0.01) this.angularVelocity = 0;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotation = 0;
    this.angularVelocity = 0;
    this.resetJumps();
  }

  moveLeft() {
    this.velocityX = -this.speed;
    this.angularVelocity -= 2;
  }

  moveRight() {
    this.velocityX = this.speed;
    this.angularVelocity += 2;
  }

  jump() {
    if (this.jumpsLeft > 0) {
      this.velocityY = this.jumpForce;
      this.jumpsLeft--;
      // Add a bit of spin when jumping
      this.angularVelocity += (this.velocityX > 0 ? 2 : -2);
      return true;
    }
    return false;
  }

  fall() {
    this.velocityY += this.gravity / 60;
  }

  resetJumps() {
    this.jumpsLeft = 2;
    this.canJump = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Main body with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Remove shadow for details
    ctx.shadowColor = 'transparent';
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 4, this.height / 4);

    // Add eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.width / 8, -this.height / 8, this.width / 4, this.height / 4);

    ctx.restore();
  }

  checkPlatformCollision(platform: Platform): boolean {
    const isColliding = 
      this.x < platform.x + platform.width &&
      this.x + this.width > platform.x &&
      this.y < platform.y + platform.height &&
      this.y + this.height > platform.y;

    if (isColliding) {
      // Top collision
      if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.resetJumps();
        return true;
      }
      
      // Bottom collision
      if (this.velocityY < 0 && this.y >= platform.y + platform.height) {
        this.y = platform.y + platform.height;
        this.velocityY = 0;
      }
      
      // Side collisions
      if (this.y + this.height > platform.y && this.y < platform.y + platform.height) {
        if (this.x + this.width > platform.x && this.x < platform.x) {
          this.x = platform.x - this.width;
          this.velocityX *= -0.5;
          this.angularVelocity *= -0.5;
        } else if (this.x < platform.x + platform.width && this.x + this.width > platform.x + platform.width) {
          this.x = platform.x + platform.width;
          this.velocityX *= -0.5;
          this.angularVelocity *= -0.5;
        }
      }
    }

    return false;
  }
}