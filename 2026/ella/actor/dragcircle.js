export default class DragCircle {
  constructor(position) {
    this.position = [...position];
  }

  setPosition(position) {
    this.position = [...position];
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.position[0], this.position[1], 24, 0, Math.PI * 2);
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Draw a dot at the center for finger location
    ctx.beginPath();
    ctx.arc(this.position[0], this.position[1], 4, 0, Math.PI * 2);
    ctx.fillStyle = 'lime';
    ctx.fill();
    ctx.restore();
  }

  term() {
    // No-op for now, but could be used for cleanup if needed
  }
}
