export default class Container {
  constructor(parent, aspect = 9/16) {
    this.parent = parent;
    this.outer = document.createElement('div');
    this.parent.appendChild(this.outer);

    this.margin = 4;
    this.aspect = aspect;

    // Make parent a flex container for centering
    this.parent.style.display = 'flex';
    this.parent.style.justifyContent = 'center';
    this.parent.style.alignItems = 'center';

    this.outer.style.width = '100px';
    this.outer.style.height = '100px';
    this.outer.style.border = '1px solid gray';
    this.outer.style.margin = `${this.margin}px`;
    this.outer.style.display = 'block';
    this.outer.style.touchAction = 'manipulation';
    this.outer.style.userSelect = 'none';
    this.outer.style.webkitUserSelect = 'none';
    this.outer.style.overscrollBehavior = 'contain';

    this._resize();
  }

  _resize() {
    let parentSize = [
      this.parent.clientWidth,
      this.parent.clientHeight
    ];

    let w = Math.max(100, parentSize[0] - 2 * this.margin);
    let h = Math.max(100, parentSize[1] - 2 * this.margin);

    // Use this.aspect for aspect ratio
    // Logical size: pick a base width and compute height from aspect
    this.logicalW = 540;
    this.logicalH = Math.round(this.logicalW / this.aspect);

    let scaleW = w / this.logicalW;
    let scaleH = h / this.logicalH;
    let scale = Math.min(scaleW, scaleH);
    let width = Math.floor(this.logicalW * scale);
    let height = Math.floor(this.logicalH * scale);

    let size = [width, height];
    if (this.outer.size &&
      this.outer.size[0] === size[0] &&
      this.outer.size[1] === size[1]
    ) {
      return;
    }

    this.outer.size = size;
    this.outer.style.width = width + 'px';
    this.outer.style.height = height + 'px';
    this.outer.style.setProperty('--scale', scale);

    if (!this.childRect) {
      this.childRect = document.createElement('div');
      this.childRect.style.position = 'absolute';
      this.childRect.style.border = '1px solid red';
      this.childRect.style.boxSizing = 'border-box';
      this.outer.appendChild(this.childRect);
      this.outer.style.position = 'relative';
    }
    this.childRect.style.width = 'calc(500px * var(--scale))';
    this.childRect.style.height = 'calc(500px * var(--scale))';
    this.childRect.style.left = 'calc(20px * var(--scale))';
    this.childRect.style.top = 'calc(20px * var(--scale))';
  }

  work() {
    this._resize();
  }
}