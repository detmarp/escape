export default class Board {
  constructor(parent, params = {}) {
    this.parent = parent;
    this.params = params;
    this.logicalW = 360;
    this.logicalH = 640;
    this.frame = 0;
  }

  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    if (this.params.onclick) {
      this.canvas.addEventListener('click', this.params.onclick);
      this.canvas.style.cursor = 'pointer';
    }

    this._resize();
  }

  term() {
  }

  update() {
    this.frame++;
    this._resize();

    this.ctx.fillStyle = '#eef';
    this.ctx.font = `10px monospace`;

    let logical = [
      this.canvas.width / this.scale,
      this.canvas.height / this.scale,
    ];
    const lines = [
      `Canvas actual:  ${this.canvas.width} x ${this.canvas.height}`,
      `Canvas logical: ${logical[0].toFixed(1)} x ${logical[1].toFixed(1)}`,
      `Scale: ${this.scale.toFixed(3)}`,
      `Frame: ${this.frame}`,
    ];

    lines.forEach((line, index) => {
      this.ctx.fillText(line, 2, (2 + 30 - 10) + index * 16);
    });
  }

  _resize() {
    const rect = this.parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.scale = this.canvas.width / 360;
    // actually set the canvas draw scale
    this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
  }
}
