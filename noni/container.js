export default class Container {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.parent.innerHTML = '';

    this.div = document.createElement('div');
    this.parent.appendChild(this.div);

    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.div.style.margin = '0';
    this.div.style.padding = '0';
    this.div.style.boxSizing = 'border-box';

    window.addEventListener('resize', () => this._handleResize());

    return this.div;
  }

  _handleResize() {
    if (this.onResize) {
      this.onResize();
    }
  }
}