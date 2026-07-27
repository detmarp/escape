import Boreal from '../boreal/boreal.js';
import Space from './space.js';
import Spaceport from './spaceport.js';
import Ux from './ux.js';

export default class Screen1 {
  constructor(parent, program, savedGame = null, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    this.container = null;
    this.header = null;
    this.cityDiv = null;
    this.rafId = null;

    let spaceport = new Spaceport();
    if (savedGame) {
      spaceport = Spaceport.fromObject(savedGame);
    }
    this.space = new Space(spaceport);
  }

  init() {
    this.space.init();
    this.container = Ux.createGameContainer();
    this.container.style.overflow = 'auto';
    this.parent.appendChild(this.container);

    new Boreal(this.container, { scrollable: false });

    this._setupUI();
    this._loop();
  }

  _setupUI() {
    this.header = Ux.createHeader({
      onReset: () => this.program.reset(),
      onSave: () => {
        this.program.save();
        this._updateDebugPanel();
      },
    });
    this.container.appendChild(this.header);

    this.cityDiv = document.createElement('div');
    this.cityDiv.style.marginBottom = '8px';
    this.container.appendChild(this.cityDiv);

    const hrule = document.createElement('hr');
    hrule.style.margin = '8px 0';
    hrule.style.border = 'none';
    hrule.style.borderTop = '1px solid #ddd';
    this.container.appendChild(hrule);

    this.debugDiv = document.createElement('div');
    this.debugDiv.style.fontSize = '11px';
    this.debugDiv.style.lineHeight = '1.2';
    this.debugDiv.style.whiteSpace = 'pre-wrap';
    this.debugDiv.style.fontFamily = 'monospace';
    this.container.appendChild(this.debugDiv);
    this._updateDebugPanel();
  }

  term() {
    this._persistSave();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _persistSave() {
    if (!this.program.persist) return;
    this.program.persist.data = {
      settings: {},
      current: this.space.getState(),
      history: [],
    };
    this.program.persist.save();
  }

  _loop() {
    this.space.update(Date.now());
    this._updateUI();
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _updateUI() {
    const now = Date.now();
    const current = this.program.current;
    const timeSinceSave = Math.round((now - current.saved) / 1000);

    this.header.redraw({
      info: `Count: ${current.count} | Saved: ${timeSinceSave}s ago`,
      counter: '',
    });

    this.cityDiv.textContent = 'City';
  }

  _updateDebugPanel() {
    const json = JSON.stringify(this.program.savedBlob, null, 2);
    this.debugDiv.textContent = json;
  }
}
