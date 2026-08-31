import Ux from './ux.js';
import Letters from './letters.js';

export default class Screen2 {
  static count = 0;

  constructor(parent, program, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
  }

  init() {
    this._createGame(this.params.gameData);
    this.now = performance.now();
    this.lastFrameTime = this.now;
    this.parent.innerHTML = '';
    this.div = Ux.screen2({
      parent: this.parent,
      text: 'Screen2',
    });

        this.header = Ux.header2({
          parent: this.div,
          buttons: [
            { text: 'Save', onClick: () => this._save() },
            { text: 'New game', onClick: () => this._restart({}) },
            { text: 'Load test 1', onClick: () => this._restart(
              {
                id: 11,
                data: {
                  test: 1,
                  buildings: [
                    { type: 'hq', level: 0, id: 1 },
                  ],
                  pending: [
                    {
                      'event': { 'event': 'upgrade', 'buildingId': 1, },
                      'time': -5000
                    },
                  ],
                },
              })
            },
            { text: 'Load test 2', onClick: () => this._restart(
              {
                id: 22,
                data: {
                  test: 2,
                  buildings: [
                    { type: 'hq', level: 1 },
                    { type: 'launchpad', level: 2 },
                  ],
                },
              })
            },
            { text: 'Restart', onClick: () => this._restart(this.game.data) },
            { text: 'Delete and restart', onClick: () => {
              this.program._deleteSaved();
              this._restart({});
            }},
          ],
        });

        Ux.hr({ parent: this.div });

    this.saveArea = Ux.text1({
      parent: this.div,
    });
    this._updateSaveArea();

    this._save();
    this.lastFrameTime = performance.now();
    this.frame = 0;
    this.loop();
  }

  term() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loop() {
    const now = Date.now();
    let dt = (now - this.lastFrameTime) / 1000;
    if (dt > 0.01) {
      dt = Math.min(dt, 0.2);
      this.lastFrameTime = now;
      this.work(now, dt);
      this.draw();
    }
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  work(now, dt) {
    // Update the current time and delta time for the screen
    this.now = now;
    this.dt = dt;
    while (true) {
      const gen = this.game?.update();
      if (!gen) break;
      const result = gen.next();
      if (result.done) {
        break;
      }
    }
  }

  draw() {
    this._updateScreen();
  }

  _updateScreen() {
    let params = {
      frame: this.frame,
      dt: this.dt,
      now: this.now,
      count: Screen2.count,
    };
    this.header.redraw(params);
  }

  _restart(gameData = null) {
    this.program.gameData = gameData;
    this.program.gotoScene();
  }

  async _createGame(gameData) {
    console.log(`ccc0 ${JSON.stringify(gameData)}`);

    if (!gameData || Object.keys(gameData).length == 0) {
      gameData = await this._createDefaultGame();
    }

    gameData = this._normalizeGameData(gameData);

    console.log(`ccc1 ${JSON.stringify(gameData)}`);
    this.game = new Letters();
    this.game.init(gameData);
    this.game.start();
  }

  _createDefaultGame() {
    let data = {}
    if (!data) {
      data = {
        buildings: [
          { type: 'hq', level: 1 },
        ],
      };
    }
    return data;
  }

  _normalizeGameData(data) {
    data = { ... data };
    return data;
  }

  _save() {
    let data = {};//{ ... this.game.data ?? {}};
    this.program.persist.data ||= {};
    let saveGame = {
      id: this.game?._id,
      data,
    };
    this.program.persist.data.current = saveGame;
    this.program.save();
    this._updateSaveArea();
  }

  _updateSaveArea() {
    this.saveArea.textContent = `${JSON.stringify(this.program.persist.data)}`;
  }

}
