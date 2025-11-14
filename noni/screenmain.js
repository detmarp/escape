import TinyHistory from './tinyhistory.js';
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
      radius: 10,
      background: '#f5f5dc',
    });

    this.uxe.headerBar(this.box, {
      onRightClick: () => { this.program.goto.to('settings'); },
      text: 'Tiny Towns',
      streak: 0,
    });

    let history = new TinyHistory(this.program.factory, this.program.saveData.data.history);
    this.daily = this._gamesBox('Game of the day', [20, 60, 500, 200]);
    let daily = history.getDailyGames(15);
    daily.forEach(e => {
      this._gameButton(this.daily, e);
    });
    this.other = this._gamesBox('Other games', [20, 270, 500, 200]);
    this._gameButton(this.other);
    this._gameButton(this.other);
    this._gameButton(this.other);

    let buttonArea = this.uxe.box(this.box, {
      rect: [0, 480, 540, 480],
    });
    this._goto(buttonArea, 'Pregame 🛠️', 'pregame');
    this._goto(buttonArea, 'Game 🪙', 'game');
    this._goto(buttonArea, 'Editor ✏️', 'editor');
    this._goto(buttonArea, 'Credits 📜', 'credits');
    this._goto(buttonArea, 'Settings ⚙️', 'settings');
    if (this.program.saveData.data.quickstart) {
      this.uxe.button(buttonArea, {
        text: 'Quick start 🚀',
        onClick: () => { this._onQuickStart(); },
      });
    }
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

  _gamesBox(label, rect) {
    let outer = this.uxe.box(this.box, {
      fill: true,
      row: false,
      radius: this.container.u(10),
      background: '#ffffff',
      border: '#cccccc',
      rect: rect,
    });

    this.uxe.text(outer, { text: label });

    let inner = this.uxe.box(outer, {
      fill: true,
      row: true,
    });
    // Ensure the inner box uses flex row and wraps its children
    inner.style.flexWrap = 'wrap';
    return inner;
  }

  _gameButton(parent, entry) {
    let box = this.uxe.box(parent, {
      background: '#e0e0e0',
      border: '#999999',
      radius: this.container.u(5),
      onClick: () => {
        let history = new TinyHistory(this.program.factory, this.program.saveData.data.history);
        let tiny = history.tinyFromObject(entry);
        this.program.newGame(tiny);
        if (tiny.started) {
          this.program.goto.to('game');
        }
        else {
          this.program.goto.to('pregame');
        }
      },
    });

    this.uxe.text(box, { text: 'Game' });

    return box;
  }

  _onQuickStart() {
    this.program.newGame();
    this.program.goto.to('game');
  }
}