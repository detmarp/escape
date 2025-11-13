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
      radius: this.container.u(20),
      background: '#f5f5dc',
      border: '#000000',
    });

    this.uxe.text(this.box, { text: 'Main Screen', });

    this._goto(this.box, 'Pregame 🛠️', 'pregame');
    this._goto(this.box, 'Game 🪙', 'game');
    this._goto(this.box, 'Editor ✏️', 'editor');
    this._goto(this.box, 'Credits 📜', 'credits');
    this._goto(this.box, 'Settings ⚙️', 'settings');

    if (this.program.saveData.data.quickstart) {
      this.uxe.button(this.box, {
        text: 'Quick start 🚀',
        onClick: () => { this._onQuickStart(); },
      });
    }

    this.daily = this._gamesBox('Game of the day');
    this._gameButton(this.daily);
    this._gameButton(this.daily);
    this._gameButton(this.daily);
    this.other = this._gamesBox('Other games');
    this._gameButton(this.other);
    this._gameButton(this.other);
    this._gameButton(this.other);
  }

  _goto(parent, label, screen) {
    this.uxe.button(parent, {
      text: label,
      onClick: () => {
        if (!this.program.tiny) {
          // TODO This is a HACK for the tiny creation flow
          this.program.newGame();
        }
        this.program.goto.to(screen);
      },
    });
  }

  _gamesBox(label) {
    let outer = this.uxe.box(this.box, {
      fill: true,
      row: false,
      radius: this.container.u(10),
      background: '#ffffff',
      border: '#cccccc',
    });

    this.uxe.text(outer, { text: label });

    let inner = this.uxe.box(outer, {
      fill: true,
      row: false,
    });

    return inner;
  }

  _gameButton(parent) {
    let box = this.uxe.box(parent, {
      background: '#e0e0e0',
      border: '#999999',
      radius: this.container.u(5),
    });

    this.uxe.text(box, { text: 'Game' });

    return box;
  }

  _onQuickStart() {
    this.program.newGame();
    this.program.goto.to('game');
  }
}