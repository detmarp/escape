export default class Container {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.parent.innerHTML = '';

    this.outer = document.createElement('div');
    this.parent.appendChild(this.outer);

    this.outer.style.width = '100%';
    this.outer.style.height = '100%';
    this.outer.style.margin = '0';
    this.outer.style.padding = '0';
    this.outer.style.boxSizing = 'border-box';

    this.inner = document.createElement('div');
    this.parent.appendChild(this.inner);

    this.inner.style.width = '200px';
    this.inner.style.height = '200px';
    this.inner.style.position = 'absolute';
    this.inner.style.top = '50%';
    this.inner.style.left = '50%';
    this.inner.style.transform = 'translate(-50%, -50%)';
    this.inner.style.boxSizing = 'border-box';

    window.addEventListener('resize', () => this._handleResize());

    return this.outer;
  }

  _handleResize() {
    if (this.onResize) {
      this.onResize();
    }
  }
}