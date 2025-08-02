export default class DrawSpiral {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.angle = 0;
  }

  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set up drawing style
    this.ctx.strokeStyle = 'purple';
    this.ctx.lineWidth = 2;

    // Draw spiral
    this.ctx.beginPath();
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    for (let i = 0; i < 200; i++) {
      const radius = i * 2;
      const currentAngle = this.angle + i * 0.1;
      const x = centerX + Math.cos(currentAngle) * radius;
      const y = centerY + Math.sin(currentAngle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
    this.angle += 0.05; // Rotate the spiral
  }
}
