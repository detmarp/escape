export default class Container {
  constructor(parent) {
    this.parent = parent;
    this.baseSize = 600;
  }

  run() {
    this.parent.innerHTML = '';

    this.outer = document.createElement('div');
    this.parent.appendChild(this.outer);
    this.outer.style.cssText = 'width:100%; height:100%; margin:0; padding:0; box-sizing:border-box';

    this.inner = document.createElement('div');
    this.parent.appendChild(this.inner);
    this.inner.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); box-sizing:border-box';

    window.addEventListener('resize', () => this._updateLayout());
    this._updateLayout();
    return this.outer;
  }

  clear() {
    this.outer.innerHTML = '';
    this.inner.innerHTML = '';
  }

  _updateLayout() {
    const vw = this.parent.clientWidth;
    const vh = this.parent.clientHeight;
    const isWide = vw > vh;

    let w, h;
    if (isWide) {
      // Wide: height=600, width between 600*1.33 and 600*2
      h = Math.min(vh * 0.9, vw * 0.9 / 1.33);
      w = Math.max(h * 1.33, Math.min(h * 2, vw * 0.9));
      this.scale = h / this.baseSize;
      this.orientation = 'wide';
      this.outer.aspect = vw / vh;
      this.inner.aspect = w / h;
    } else {
      // Tall: width=600, height between 600*1.33 and 600*2
      w = Math.min(vw * 0.9, vh * 0.9 / 1.33);
      h = Math.max(w * 1.33, Math.min(w * 2, vh * 0.9));
      this.scale = w / this.baseSize;
      this.orientation = 'tall';
      this.outer.aspect = vh / vw;
      this.inner.aspect = h / w;
    }

    this.inner.style.width = `${w}px`;
    this.inner.style.height = `${h}px`;
    this.inner.style.setProperty('--u', `${this.scale}px`);
    this.inner.style.fontSize = `${this.scale * 18}px`;

    if (this.onResize) this.onResize();
  }

  // Helper to convert logical units to pixels
  u(units) {
    return units * this.scale;
  }
}