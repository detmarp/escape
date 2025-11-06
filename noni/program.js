import Container from './container.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.container = new Container(this.parent);
  }

  async run() {
    this.container.run();

    this.div = document.createElement('div');
    this.container.div.appendChild(this.div);

    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.div.style.margin = '0';
    this.div.style.padding = '0';
    this.div.style.boxSizing = 'border-box';
    this.div.innerText = 'Noni Program Running';

    this.container.onResize = () => this._onResize();

    this._onResize();
  }

  _onResize() {
    this.div.innerText = `Width: ${this.parent.clientWidth}, Height: ${this.parent.clientHeight}`;
  }
}