export default class Sprites {
  constructor() {
    this.tileSize = 128;
    this.tileImages = {};
  }

  getImage(params = {}, x = 0, y = 0) {
  }

  draw(ctx, x, y) {
    const px = x * this.tileSize;
    const py = y * this.tileSize;

    ctx.fillStyle = '#fff';
    ctx.fillRect(px, py, this.tileSize, this.tileSize);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, this.tileSize, this.tileSize);

    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.fillText(`${x},${y}`, px + 5, py + 20);
  }
}
