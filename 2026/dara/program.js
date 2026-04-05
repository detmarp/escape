import Astra from '../astra/astra.js';
import ScreenMain from './screenmain.js';
import ScreenSettings from './screensettings.js';
import ScreenDemo from './screendemo.js';
import ScreenTest from './screentest.js';
import ScreenSetup from './screensetup.js';
import ScreenHome from './screenhome.js';
import Persist from './persist.js';

export default class Program {
  screens = {
    'main': { class: ScreenMain, params: { hello: 'there', astra: true, } },
    'settings': { class: ScreenSettings, params: { astra: true } },
    'demo': { class: ScreenDemo, params: { astra: true } },
    'test': { class: ScreenTest, params: { astra: true } },
    'setup': { class: ScreenSetup, params: { astra: true } },
    'home': { class: ScreenHome, params: { astra: true } },
  };

  constructor(root = document.body) {
    this.root = root;
    this.current = null;
    this.rafId = null;
    this.lastTime = 0;
    this.startTime = 0;
    this.frame = 0;
    document.title = 'Dara';
    this.persist = new Persist();
  }

  run() {
    this.load();
    this.goto('main');
    this._tick();
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.startTime = 0;
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
    this.persist.data = {
      settings: { ...this.settings },
      history: { ...this.history },
    };
    this.persist.save();
  }

  _normalize() {
    this.history = { ...this.history };
    this.settings = { ...this.settings };
  }

  goto(name) {
    const baseParams = {
      program: this,
    };
    const screen = this.screens[name];
    if (screen) {
      const params = { ...baseParams, ...(screen.params || {}) };
      this._gotoScreen(screen.class, params);
    }
  }

  _tick() {
    const currentTime = performance.now();

    if (!this.startTime) {
      this.startTime = currentTime;
    }

    const dt = this.lastTime ? currentTime - this.lastTime : 0;
    this.lastTime = currentTime;
    this.frame++;

    const elapsedSeconds = (currentTime - this.startTime) / 1000;

    if (this.current && typeof this.current.work === 'function') {
      this.current.work(dt, elapsedSeconds, this.frame);
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

    // Always create a screenRoot div
    const screenRoot = document.createElement('div');
    screenRoot.style.width = '100%';
    screenRoot.style.height = '100%';
    this.root.appendChild(screenRoot);

    // Apply Astra if requested
    if (params.astra) {
      this.astra = new Astra('Screen');
      this.astra.setFixedFullscreen();
    }

    this.current = new className(screenRoot, params);
    if (typeof this.current.init === 'function') {
      this.current.init();
    }
  }
}
