import UxElement from './uxelement.js';

export default class ScreenMain {
  constructor(program) {
    this.program = program;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
  }

  run() {
    this.update();
  }

  update() {
    this.parent.innerHTML = '';
    this.box = this.uxe.box(this.parent, {
      fill: true,
      row: false,
      background: '#60e070',
    });
    this.box.innerHTML = '';

    this.uxe.text(this.box, { text: 'Editor', });
    this.uxe.button(this.box, {
      text: 'Main',
      onClick: () => { this.program.goto.to('main'); },
    });
  }
}
