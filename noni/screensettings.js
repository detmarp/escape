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
    let fill = this.uxe.testFill();
    fill.innerHTML = '';

    this.uxe.text(fill, { text: 'Settings Screen', });
    this.uxe.button(fill, {
      text: 'Main',
      onClick: () => { this.program.goto.to('main'); },
    });
  }
}
