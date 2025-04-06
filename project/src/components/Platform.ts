export class Platform {
  private gradient: CanvasGradient | null = null;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public color: string = '#4CAF50'
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gradient) {
      this.gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      this.gradient.addColorStop(0, this.color);
      this.gradient.addColorStop(1, this.adjustColor(this.color, -20));
    }

    // Draw platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);

    // Draw main platform
    ctx.fillStyle = this.gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add platform shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(this.x, this.y, this.width, this.height / 4);

    // Add platform border
    ctx.strokeStyle = this.adjustColor(this.color, 20);
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(Math.min(parseInt(hex.substring(0, 2), 16) + amount, 255), 0);
    const g = Math.max(Math.min(parseInt(hex.substring(2, 4), 16) + amount, 255), 0);
    const b = Math.max(Math.min(parseInt(hex.substring(4, 6), 16) + amount, 255), 0);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}