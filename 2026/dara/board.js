export default class Board {
  constructor(parent, params = {}) {
    this.parent = parent;
    this.params = params;
    this.logicalW = 360;
    this.logicalH = 640;
  }

  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Style and append canvas
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    this.parent.appendChild(this.canvas);

    // Set canvas size
    this._resize();

    // Add resize listener
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.parent);
  }

  term() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  update(dt, time, frame) {
    // Clear and fill with alternating colors based on frame
    const color = (frame % 2 === 0) ? '#FFA500' : '#FF0000'; // orange or red

    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate logical scale
    const scaleX = this.canvas.width / this.logicalW;
    const scaleY = this.canvas.height / this.logicalH;
    const scale = Math.min(scaleX, scaleY);

    // Draw debug text in blue
    this.ctx.fillStyle = '#0000FF';
    this.ctx.font = `${30 * scale}px monospace`;

    const lines = [
      `Canvas actual: ${this.canvas.width}x${this.canvas.height}`,
      `dt: ${dt.toFixed(3)}, time: ${time.toFixed(3)}, frame: ${frame}`,
      `Canvas logical scale: ${scale.toFixed(3)}`,
      `Canvas logical: ${this.logicalW}x${this.logicalH}`
    ];

    lines.forEach((line, index) => {
      this.ctx.fillText(line, 10 * scale, (30 + index * 40) * scale);
    });
  }

  _resize() {
    const rect = this.parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
}
