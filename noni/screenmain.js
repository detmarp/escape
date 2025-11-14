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
      radius: this.container.u(20),
      background: '#f5f5dc',
      border: '#000000',
    });

    this.uxe.headerBar(this.box, {
      text: 'Main Screen 🪙 ⯇🏠 ☰ ◀️ 🔙 ⛭ ⇜ ↶ 🏆'
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

    let history = new TinyHistory(this.program.factory, this.program.saveData.data.history);
    this.daily = this._gamesBox('Game of the day');
    let daily = history.getDailyGames(15);
    daily.forEach(e => {
      this._gameButton(this.daily, e);
    });
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