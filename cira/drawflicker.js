export default class DrawFlicker {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isRed = true;
  }

  draw() {
    const color = this.isRed ? 'red' : 'blue';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.isRed = !this.isRed;
  }
}