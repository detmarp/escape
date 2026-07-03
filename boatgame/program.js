import Astra from '../2026/astra/astra.js';
import ScreenMain from './screen/screenmain.js';
import ScreenSettings from './screen/screensettings.js';
import ScreenDemo from './screen/screendemo.js';
import ScreenGame from './screen/screengame.js';
import ScreenTest from './screen/screentest.js';
import ScreenSetup from './screen/screensetup.js';
import ScreenHome from './screen/screenhome.js';
import ScreenDom from './screen/screendom.js';
import ScreenCanvas1 from './screen/screencanvas1.js';
import ScreenCanvas2 from './screen/screencanvas2.js';
import Persist from './persist.js';
import ShipGame from './shipgame.js';
import ShipRules from './shiprules.js';
import BotA from './bota.js';

export default class Program {
  screens = {
    'main': { class: ScreenMain, params: { hello: 'there', astra: false, } },
    'settings': { class: ScreenSettings, params: { astra: false } },
    'demo': { class: ScreenDemo, params: { astra: true } },
    'game': { class: ScreenGame, params: { astra: true } },
    'test': { class: ScreenTest, params: { astra: false } },
    'setup': { class: ScreenSetup, params: { astra: true } },
    'home': { class: ScreenHome, params: { astra: true } },
    'dom': { class: ScreenDom, params: { astra: true } },
    'canvas1': { class: ScreenCanvas1, params: { astra: true } },
    'canvas2': { class: ScreenCanvas2, params: { astra: true } },
  };

  constructor(root = document.body) {
    this.root = root;
    this.current = null;
    this.rafId = null;
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.frame = 0;
    document.title = 'Boat Game';
    this.persist = new Persist();
  }

  run() {
    this.load();

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('reset')) {
      this.reset();
      urlParams.delete('reset');
      window.history.replaceState({}, '', window.location.pathname + (urlParams.toString() ? '?' + urlParams : ''));
    }

    const mode = urlParams.get('mode');
    const targetScreen = mode || 'home';

    this.settings.count = (this.settings.count ?? 0) + 1;
    this.settings.lastRun = Date.now();
    this.save();

    this.goto(targetScreen);
    this._tick();
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  load() {
    this.persist.load();
    this.settings = { ... this.persist.data.settings };
    this.history = { ...this.persist.data.history };
    this._normalize();
  }

  save() {
    this._normalize();
    this.settings.lastSave = Date.now();
    this.persist.data = {
      settings: { ...this.settings },
      history: { ...this.history },
    };
    this.persist.save();
  }

  getRules() {
    let rules = {
      allowAdjacent: this.settings.allowAdjacent,
      allowDiagonal: this.settings.allowDiagonal,
      continueAfterHit: this.settings.continueAfterHit,
      fleet: this.settings.fleet,
    };
    return rules;
  }

  _normalize() {
    this.history = { ...this.history };
    this.settings = { ...this.settings };
  }

  reset() {
    this.persist.clear();
    this.load();
  }

  goto(name) {
    const baseParams = {
      program: this,
    };

    const screen = this.screens[name] || this.screens['home'];
    const actualName = this.screens[name] ? name : 'home';

    if (screen) {
      const params = { ...baseParams, ...(screen.params || {}) };
      this._updateUrl(actualName);
      this._gotoScreen(screen.class, params);
    }
  }

  _updateUrl(screenName) {
    const url = new URL(window.location);

    if (screenName === 'home') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', screenName);
    }
    window.history.replaceState({}, '', url.toString());
  }

  _tick() {
    const currentTime = performance.now() / 1000;
    const maxDt = 0.1;
    let dt = Math.min(currentTime - this.lastTime, maxDt);
    if (dt > 0) {
      this.lastTime = currentTime;
      this.frame++;
      this.elapsedTime += dt;
      if (this.current && typeof this.current.work === 'function') {
        this.current.work(dt, this.elapsedTime, this.frame);
      }
    }
    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }

  _gotoScreen(className, params) {
    params.program = this;
    if (this.current) {
      if (typeof this.current.term === 'function') {
        this.current.term();
      }
      this.current = null;
    }

    // Clean up Astra if it exists
    if (this.astra) {
      this.astra.reset();
      this.astra = null;
    }

    this.root.innerHTML = '';

    const screenRoot = document.createElement('div');
    screenRoot.style.width = '100%';
    screenRoot.style.height = '100%';
    this.root.appendChild(screenRoot);

    if (params.astra) {
      this.astra = new Astra('Screen');
      this.astra.setFixedFullscreen();
    }

    this.current = new className(screenRoot, params);
    if (typeof this.current.init === 'function') {
      this.current.init();
    }
  }

  setFullBleedBackground() {
    if (!this._bgImg) {
      this._bgImg = document.createElement('img');
      this._bgImg.src = './data/bg00.png';
    }
    Object.assign(this._bgImg.style, {
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      objectFit: 'cover',
      objectPosition: 'center',
      zIndex: '-1',
      pointerEvents: 'none',
    });
    document.body.appendChild(this._bgImg);
  }

  makeGameFromSave(save) {
    this.game = null;
    try {
      this.game = ShipGame.fromObject(save);
    } catch (e) {
    }
  }

  makeGameFromBoard(rules, board) {
    this.game = null;
    try {
      this.game = new ShipGame({
        rules,
      });
      let bot0 = new BotA(this.game, 0);
      bot0.placeShips();
      this.game.boards[1] = board;
    } catch (e) {
    }
  }

  restoreOrNewGame() {
    if (this.game && !this.game.gameOver) {
      return;
    }
    this.makeGameFromSave(this.history && this.history.current);
    if (!this.game) {
      this.makeRandomGame(this.getRules());
    }
  }

  makeRandomGame(rules) {
    this.game = new ShipGame({
      rules: this.getRules(),
    });

    let bot0 = new BotA(this.game, 0);
    let bot1 = new BotA(this.game, 1);
    bot0.placeShips();
    bot1.placeShips();
  }
}
