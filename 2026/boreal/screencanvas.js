import Boreal from './boreal.js';

export default class ScreenCanvas {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.root = this._setupDivs();
    this.parent.appendChild(this.root);
    this._rafId = null;
    this._frame = 0;

    // Canvas setup
    this.ctx = this.canvas.getContext('2d');

    // Speed properties
    this.speed = 2; // Base speed multiplier

    // Square properties
    this.square = {
      x: 50,
      y: 50,
      size: 20,
      dx: 120 * this.speed, // pixels per second
      dy: 90 * this.speed   // pixels per second
    };

    // Border properties
    this.borderWidth = 2;

    // Timing properties
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
  }

  init() {
    this._resetScene();
    this._loop();
  }

  term() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this.root) {
      this.root.style.background = '';
    }
  }

  _loop() {
    this._frame++;

    // Calculate timing
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000; // Delta time in seconds
    const time = (now - this.startTime) / 1000;   // Elapsed time in seconds
    this.lastFrameTime = now;

    this._work(dt, time);
    this._draw();

    // Update info display
    if (this.infoDiv) {
      const rect = this.root.getBoundingClientRect();
      const size = `Size: ${Math.round(rect.width)}, ${Math.round(rect.height)}`;
      const frame = `Frame: ${this._frame}`;
      const timing = `Time: ${time.toFixed(1)}s, DT: ${(dt * 1000).toFixed(1)}ms`;
      this.infoDiv.textContent = `${size}\n${frame}\n${timing}`;
    }

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _div0() {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'relative';
    return div;
  }

  _div1(parent) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    parent.appendChild(canvas);
    this.canvas = canvas;
    return canvas;
  }

  _div2(parent) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.right = '0px';
    div.style.bottom = '0px';
    div.style.boxSizing = 'border-box';

    // Info text div
    this.infoDiv = document.createElement('div');
    this.infoDiv.style.position = 'absolute';
    this.infoDiv.style.top = '8px';
    this.infoDiv.style.right = '8px';
    this.infoDiv.style.fontFamily = 'monospace';
    this.infoDiv.style.fontSize = '12px';
    this.infoDiv.style.lineHeight = '1.2';
    this.infoDiv.style.whiteSpace = 'pre';
    this.infoDiv.style.textAlign = 'right';
    this.infoDiv.style.color = '#ffffff';
    this.infoDiv.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    this.infoDiv.style.backgroundColor = 'rgba(0,0,0,0.3)';
    this.infoDiv.style.padding = '4px 6px';
    this.infoDiv.style.borderRadius = '3px';
    div.appendChild(this.infoDiv);

    parent.appendChild(div);
    return div;
  }

  _div3(parent) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.boxSizing = 'border-box';

    new Boreal(div);

    if (!this.params.demomode) {
      const homeButton = document.createElement('button');
      homeButton.textContent = '< Home';
      homeButton.onclick = () => this.params.program && this.params.program.goto('main');
      div.appendChild(homeButton);
    }

    parent.appendChild(div);
    return div;
  }

  _resetScene() {
    // Reset canvas size to match display size (prevents stretching)
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set actual canvas dimensions to prevent scaling distortion
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;

    // Scale context to handle high DPI displays
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    // Store logical dimensions for calculations
    this.logicalWidth = rect.width;
    this.logicalHeight = rect.height;

    // Clamp square to new boundaries if screen changed
    const maxX = this.logicalWidth - this.borderWidth - this.square.size;
    const maxY = this.logicalHeight - this.borderWidth - this.square.size;
    const minX = this.borderWidth;
    const minY = this.borderWidth;

    this.square.x = Math.max(minX, Math.min(maxX, this.square.x));
    this.square.y = Math.max(minY, Math.min(maxY, this.square.y));
  }

  _work(dt, time) {
    // Reset scene dimensions every frame to handle resize
    this._resetScene();

    const w = this.logicalWidth;
    const h = this.logicalHeight;

    // Update square position using dt for frame-rate independence
    this.square.x += this.square.dx * dt;
    this.square.y += this.square.dy * dt;

    // Bounce off borders
    const minX = this.borderWidth;
    const minY = this.borderWidth;
    const maxX = w - this.borderWidth - this.square.size;
    const maxY = h - this.borderWidth - this.square.size;

    if (this.square.x <= minX || this.square.x >= maxX) {
      this.square.dx = -this.square.dx;
      this.square.x = Math.max(minX, Math.min(maxX, this.square.x));
    }

    if (this.square.y <= minY || this.square.y >= maxY) {
      this.square.dy = -this.square.dy;
      this.square.y = Math.max(minY, Math.min(maxY, this.square.y));
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    // Clear with midnight background
    ctx.fillStyle = '#191970'; // midnight blue
    ctx.fillRect(0, 0, w, h);

    // Draw red border
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = this.borderWidth;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Draw square
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.square.x, this.square.y, this.square.size, this.square.size);
  }

  _setupDivs() {
    const root = this._div0();
    this._div1(root);
    this._div2(root);
    this._div3(root);
    return root;
  }
}
