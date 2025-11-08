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

    this.uxe.text(fill, { text: 'Main Screen', });

    this._goto(fill, 'Pregame', 'pregame');
    this._goto(fill, 'Game', 'game');
    this._goto(fill, 'Editor', 'editor');
    this._goto(fill, 'Credits', 'credits');
    //this._goto(fill, 'Test', 'test');
    this._goto(fill, 'Settings', 'settings');
  }

  _goto(parent, label, screen) {
    this.uxe.button(parent, {
      text: label,
      onClick: () => { this.program.goto.to(screen); },
    });

  }
}
