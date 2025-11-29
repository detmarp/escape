import UxElement from './uxelement.js';

export default class ScreenMain {
  constructor(program) {
    this.program = program;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
  }

  run() {
    if (this.program.pregame?.autostart) {
      this._gotoGame();
      return;
    }

    this.update();
  }

  update() {
    this.parent.innerHTML = '';
    this.box = this.uxe.box(this.parent, {
      fill: true,
      row: false,
      background: '#f0d8df',
    });
    this.box.innerHTML = '';

    this.uxe.text(this.box, { text: 'Pregame Screen', });
    this.uxe.button(this.box, {
      text: '< Main',
      onClick: () => { this.program.goto.to('main'); },
    });

    this.uxe.text(this.box, {
      text: this.program.tiny ? `${JSON.stringify(Object.keys(this.program.tiny))}` : 'null',
    });

    this.uxe.button(this.box, {
      text: 'Play',
      onClick: () => {
        this._gotoGame();
      },
    });

    this.uxe.text(this.box, {
      text: `${JSON.stringify(this.program.saveData.data)}`,
    });
  }

  _gotoGame() {
    this.program.setupTiny(this.program.pregame);
    this.program.goto.to('game');
  }
}
