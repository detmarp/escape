import Ux from './ux.js';

export default class Screen2 {
  // static count
  static count = 0;

  constructor(parent, program, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    Screen2.count++;
  }

  init() {
    this._createSpaceGame(this.params.gameData);

    this.parent.innerHTML = '';
    this.div = Ux.screen2({
      parent: this.parent,
      text: 'Screen2',
    });
    this.header = Ux.header2({
      parent: this.div,
      buttons: [
        { text: 'Restart', onClick: () => this._restart() },
        { text: 'Save', onClick: () => this._save() },
        { text: 'New game', onClick: () => this._restart({}) },
        { text: 'Load test 1', onClick: () => this._restart({ test: 1 }) },
        { text: 'Load test 2', onClick: () => this._restart({ test: 2 }) },
        { text: 'Delete and restart', onClick: () => {
          this.program._deleteSaved();
          this._restart({});
        }},
      ],
    });
    Ux.hr({ parent: this.div });
    this.gameDataArea = Ux.text1({
      parent: this.div,
      text: `${JSON.stringify(this.params.gameData)}`,
    });
    this.saveArea = Ux.text1({
      parent: this.div,
      text: `${JSON.stringify(this.program.persist.data)}`,
    });

    this._updateScreen();
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
    const now = performance.now();
    let dt = (now - this.lastFrameTime) / 1000;
    if (dt > 0.01) {
      dt = Math.min(dt, 0.2);
      this.lastFrameTime = now;
      this.work(dt);
      this.draw();
    }
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  work(dt) {
    this.dt = dt;
    this.frame++;
  }

  draw() {
    this._updateScreen();
  }

  _updateScreen() {
    let params = {
      frame: this.frame,
      dt: this.dt,
      count: Screen2.count,
    };
    this.header.redraw(params);
  }

  _updateSaveArea() {
    this.saveArea.textContent = `${JSON.stringify(this.program.persist.data)}`;
  }

  _restart(gameData = null) {
    if (gameData) {
      this.program.gameData = gameData;
    }
    this.program.gotoScene();
  }

  _createSpaceGame(gameData) {
    this.game = {
      hello: 'this is a space game',
      setupData: gameData,
    };
  }

  _save() {
    let data = {
      here: 'is some data to save for this space game',
      a: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      b: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      c: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      d: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      e: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      f: 'asdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdf',
      setup: this.game.setupData,
    };
    this.program.persist.data ||= {};
    this.program.persist.data.current = data;
    this.program.save();
    this._updateSaveArea();
  }
}
