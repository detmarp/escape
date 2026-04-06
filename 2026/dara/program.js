import Astra from '../astra/astra.js';
import ScreenMain from './screenmain.js';
import ScreenSettings from './screensettings.js';
import ScreenDemo from './screendemo.js';
import ScreenTest from './screentest.js';
import ScreenSetup from './screensetup.js';
import ScreenHome from './screenhome.js';
import ScreenDom from './screendom.js';
import ScreenCanvas1 from './screencanvas1.js';
import ScreenCanvas2 from './screencanvas2.js';
import Persist from './persist.js';

export default class Program {
  screens = {
    'main': { class: ScreenMain, params: { hello: 'there', astra: false, } },
    'settings': { class: ScreenSettings, params: { astra: false } },
    'demo': { class: ScreenDemo, params: { astra: false } },
    'test': { class: ScreenTest, params: { astra: false } },
    'setup': { class: ScreenSetup, params: { astra: false } },
    'home': { class: ScreenHome, params: { astra: false } },
    'dom': { class: ScreenDom, params: { astra: true } },
    'canvas1': { class: ScreenCanvas1, params: { astra: true } },
    'canvas2': { class: ScreenCanvas2, params: { astra: true } },
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

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('reset')) {
      this.reset();
      urlParams.delete('reset');
      window.history.replaceState({}, '', window.location.pathname + (urlParams.toString() ? '?' + urlParams : ''));
    }

    const mode = urlParams.get('mode');
    const targetScreen = mode || 'main';

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
    this.settings.lastSave = Date.now();
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

  reset() {
    this.persist.clear();
    this.load();
  }

  goto(name) {
    const baseParams = {
      program: this,
    };

    const screen = this.screens[name] || this.screens['main'];
    const actualName = this.screens[name] ? name : 'main';

    if (screen) {
      const params = { ...baseParams, ...(screen.params || {}) };
      this._updateUrl(actualName);
      this._gotoScreen(screen.class, params);
    }
  }

  _updateUrl(screenName) {
    const url = new URL(window.location);

    if (screenName === 'main') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', screenName);
    }
    window.history.replaceState({}, '', url.toString());
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
}
