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
    this.dailyBox = this._gamesBox('Game of the day', [20, 60, 500, 200]);
    let daily = history.getDailyGames(15);
    daily.forEach(e => {
      this._gameButton(this.dailyBox, e);
    });
    this.otherBox = this._gamesBox('Other games', [20, 270, 500, 200]);
    let other = history.getOtherGames();
    this._gameButton(this.otherBox, null);
    other.forEach(e => {
      this._gameButton(this.otherBox, e);
    });

    let buttonArea = this.uxe.box(this.box, {
      rect: [0, 480, 540, 480],
    });
    this._goto(buttonArea, 'debug Pregame 🛠️', 'pregame', () => {
      this.program.setupPregame({
      }
      );
    });
    this._goto(buttonArea, 'debug Game 🪙', 'pregame', () => {
      this.program.setupPregame({
        autostart: true,
      }
      );
    });
    this._goto(buttonArea, 'Editor ✏️', 'editor', () => {
      this.program.setupPregame({
        autostart: true,
      }
      );
    });
    this._goto(buttonArea, 'Credits 📜', 'credits');
    this._goto(buttonArea, 'Settings ⚙️', 'settings');
    if (this.program.saveData.data.quickstart) {
      this._goto(buttonArea, 'Quick start 🚀', 'pregame', () => {
        this.program.setupPregame({
          autostart: true,
        }
        );
      });
    }

    let row = this.uxe.box(buttonArea, {
      rect: [0, 360, 540, 80],
      row: true,
    });
    this.uxe.button(row, {
      text: 'test 1',
      onClick: () => {
      },
    });
    this.uxe.button(row, {
      text: 'test 2',
      onClick: () => {
      },
    });

  }

  _goto(parent, label, screen, setup) {
    this.uxe.button(parent, {
      text: label,
      onClick: () => {
        if (setup) {
          setup();
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
    let b = document.createElement('button');
    parent.appendChild(b);

    let text = entry ? Object.keys(entry) : 'New game ➕';
    b.textContent = text;
    b.onclick = () => {
      let history = new TinyHistory(this.program.factory, this.program.saveData.data.history);
      let setupParams = {};
      if (entry) {
        if (entry.saved) {
          setupParams.savegame = entry.saved;
        }
        else if (entry.seed) {
          let index = history.findBySeed(history, entry.seed);
          if (index !== null) {
            const foundEntry = list[index];
            if (foundEntry && foundEntry.saved) {
              setupParams.savegame = foundEntry.saved;
            }
          }
          if (!setupParams.savegame) {
            setupParams.gameseed = entry.seed;
          }
        }
      }
      this.program.setupPregame(setupParams);
      this.program.goto.to('pregame');
    };

    return b;
  }

  _ago(timeStamp) {
    let ago = Math.floor((Date.now() - timeStamp) / 1000);
    if (ago <= 30) return 'now';
    const minutes = Math.ceil(ago / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.ceil((minutes + 15) / 60);
    if (hours < 20) return `${hours}h`;
    const days = Math.ceil(hours / 24);
    return `${days}d`;
  }
}