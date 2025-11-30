import UxElement from './uxelement.js';

export default class ScreenPregame {
  constructor(program) {
    this.program = program;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
  }

  run() {
    this.pregame = this.program.factory.normalizePregame(this.program.pregame);

    if (this.program.pregame?.autostart) {
      this._gotoGame();
      return;
    }

    this.update();
  }

  update() {
    let text1 = `${JSON.stringify(this.pregame)}`;
    let text2 = `${JSON.stringify(this.program.saveData.data)}`;

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

    let t1 = this.uxe.text(this.box, {
      text: text1,
    });
  t1.style.whiteSpace = 'pre-wrap';
  t1.style.wordBreak = 'break-word';
  t1.style.width = '100%';
  t1.style.fontFamily = 'monospace';

    this.uxe.button(this.box, {
      text: 'Play',
      onClick: () => {
        this._gotoGame();
      },
    });

    let t2 = this.uxe.text(this.box, {
      text: text2,
    });
  t2.style.whiteSpace = 'pre-wrap';
  t2.style.wordBreak = 'break-word';
  t2.style.width = '100%';
  t2.style.fontFamily = 'monospace';
  }

  _gotoGame() {
    this.program.setupTiny(this.program.pregame);
    this.program.goto.to('game');
  }
}
