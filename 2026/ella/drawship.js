export default class DrawShip {
  constructor() {
    this.position = [0, 0];
    this.size = [200, 200];
  }

  work(dt, time, frame) {
  }

  draw(ctx, ooscale = 1) {
    const x = this.position[0] * ooscale;
    const y = this.position[1] * ooscale;
    const width = this.size[0] * ooscale;
    const height = this.size[1] * ooscale;
    const gridSize = 10;

    // Draw light gray background
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(x, y, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const lineX = x + (i * width / gridSize);
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const lineY = y + (i * height / gridSize);
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }

    // Draw random markers
    for (let i = 0; i < 10; i++) {
      const gridX = Math.floor(Math.random() * 10);
      const gridY = Math.floor(Math.random() * 10);
      const type = Math.random() > 0.5 ? 'hit' : 'miss';
      this._marker(ctx, gridX, gridY, type, ooscale);
    }
  }

  _marker(ctx, gridX, gridY, type, ooscale = 1) {
    const startX = 20 * ooscale;
    const startY = 20 * ooscale;
    const cellSize = (200 * ooscale) / 10;

    // Calculate center of grid cell
    const centerX = startX + (gridX * cellSize) + (cellSize / 2);
    const centerY = startY + (gridY * cellSize) + (cellSize / 2);
    const radius = cellSize * 0.3;

    // Draw dot based on type
    ctx.fillStyle = type === 'hit' ? '#FF0000' : '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}