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

    // Add click listener if onclick provided
    if (this.params.onclick) {
      this.canvas.addEventListener('click', this.params.onclick);
      this.canvas.style.cursor = 'pointer';
    }

    // Set canvas size
    this._resize();
  }

  term() {
  }

  update(dt, time, frame) {
    this._resize();

    this.ctx.fillStyle = `#fa0`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const largerDimension = Math.max(this.canvas.width, this.canvas.height);
    const scale = 1000 / largerDimension;

    this.ctx.fillStyle = '#0000FF';
    this.ctx.font = `${20 * scale}px monospace`;

    const lines = [
      `Canvas actual: ${this.canvas.width}x${this.canvas.height}`,
      `dt: ${dt.toFixed(3)}, time: ${time.toFixed(3)}, frame: ${frame}`,
      `Canvas logical size: ${(this.canvas.width * scale).toFixed(0)}x${(this.canvas.height * scale).toFixed(0)}`,
      `Scale (1000/larger): ${scale.toFixed(3)}`
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
