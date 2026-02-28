import Ux from './ux.js';

export default class MainLayout {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.ux = new Ux();

    this.ux.wireframe(this.parent);

    this.box1 = this.ux.div({
      parent: this.parent,
      position: [75, 100],
      size: [150, 200],
      background: '#f88',
      text: 'Box 1',
    });
    this.ux.wireframe(this.box1);

  }
}