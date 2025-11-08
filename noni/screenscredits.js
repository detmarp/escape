import UxElement from './uxelement.js';

const credits = [
  'blah blah blah',
  '',
  '',
  '',
];

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
      background: '#f0f8ff',
    });

    this.uxe.text(this.box, { text: 'Credits Screen', });
    this.uxe.button(this.box, {
      text: 'Main',
      onClick: () => { this.program.goto.to('main'); },
    });

    this._text('asdfasdf\nadf');
    this._text('asdfasdf');
    this._text('asdfasdf');
  }

  _text(text) {
    let div = this.uxe.text(this.box, { text: text, });
  }
}
