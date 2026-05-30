import MyTouch from './mytouch.js';
import FingerPoll from './fingerpoll.js';

export default class SetupSurface {
  constructor(parent, params = {}) {
    this.parent = parent;
    this.params = params;
    this.logicalW = 360;
    this.logicalH = 640;
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    if (this.params.onclick) {
      //this.canvas.addEventListener('click', this.params.onclick);
      //this.canvas.style.cursor = 'pointer';
    }

    this.finger = new FingerPoll();
    this.touch = new MyTouch(this.canvas, (touches, type) => this.finger.onMyTouchEvent(touches, type));

    this._resize();
  }

  term() {
  }

  update(dt, time, frame) {
    this._resize();

    this.ctx.fillStyle = `#fa04`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.scale(this.scale, this.scale);
  }

  getTouch() {
    return this.finger.getNext();
  }

  _resize() {
    const rect = this.parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.scale = this.canvas.width / this.logicalW;
  }
}
