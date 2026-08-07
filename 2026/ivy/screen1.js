import Boreal from '../boreal/boreal.js';
import Space from './space.js';
import SpaceSetup from './spacesetup.js';
import Ux from './ux.js';

export default class Screen1 {
  constructor(parent, program, current = null, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    this.container = null;
    this.header = null;
    this.cityDiv = null;
    this.rafId = null;

    const setup = new SpaceSetup();
    this.space = new Space({}, Date.now(), {});
  }

  init() {
    this.container = Ux.createGameContainer();
    this.parent.appendChild(this.container);

    new Boreal(this.container, { scrollable: false });

    this._setupUI();
    this._loop();
  }

  _setupUI() {
    this.header = Ux.createHeader({
      onReset: () => {
        this._save();
        this.program.gotoScene();
      },
      onSave: () => {
        this._save();
      },
      onNewGame: () => {
        this.program._deleteSaved();
        this.program.gotoScene();
      },
    });
    this.container.appendChild(this.header);

    this.statusDiv = document.createElement('div');
    Object.assign(this.statusDiv.style, {
      padding: '12px',
      marginBottom: '8px',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      fontWeight: 'bold',
    });
    this.container.appendChild(this.statusDiv);

    this.skyDiv = Ux.sky({parent: this.container});

    this.cityDiv = document.createElement('div');
    this.cityDiv.style.padding = '12px';
    this.cityDiv.style.marginBottom = '8px';
    this.cityDiv.style.display = 'flex';
    this.cityDiv.style.flexWrap = 'wrap';
    this.cityDiv.style.gap = '8px';
    this.container.appendChild(this.cityDiv);

    this.buildingDivs = {};
    const spaceport = this.space.getState();
    for (const bid in spaceport.buildings) {
      const building = spaceport.buildings[bid];
      let params = {};
      if (this.space.canVerb(bid, 'upgrade')) {
        params.onUpgrade = () => {
          this.space.upgrade(bid);
        };
      }
      if (this.space.canVerb(bid, 'speedup')) {
        params.onSpeedup = () => {
        };
      }
      if (this.space.canVerb(bid, 'collect')) {
        params.onCollect = () => {
        };
      }
      const buildingDiv = Ux.building(params);
      this.buildingDivs[bid] = buildingDiv;
      this.cityDiv.appendChild(buildingDiv);
    }
    let storeParams = {
      parent: this.cityDiv,
      expand: true,
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two', hidden: true },
        { id: 'three', name: 'Three' },
      ],
      onBuy: (item) => {
        console.log(`bbb Pretend to Buy item: ${JSON.stringify(item)}`);
      },
    };
    this.store = Ux.store(storeParams);

    // for every building
    for (let building of spaceport.buildings) {
      console.log(`bbb Building ${JSON.stringify(building)}`);
    }

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
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _save() {
    this.program.save();
    this._updateDebugPanel();
  }

  _loop() {
    this._work();
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _work() {
    //console.log(`www Work ${JSON.stringify(this.spaceport.toObject())}`);
    let now = Date.now();
    const gen = this.space.update(now);
    for (const evt of gen) {
      this._handleEvent(evt);
    }
    this._updateUI(now);
  }

  _handleEvent(evt) {
    this._save();
    console.log('Event:', evt);
  }

  _updateUI(now) {
    let info = '';
    const current = this.program.current;
    if (current) {
      info = `Count: ${current.count ?? 0} | Saved: ${current.saved ?? 0}`;
    }
    this.header.redraw({
      info: info,
    });

    let spaceport = this.space.getState();
      // index and item
    for (const i in spaceport.buildings) {
      const building = spaceport.buildings[i];
      let b = this.space.rules.blueprints[building.id];
      if (this.buildingDivs[i]) {
        let info = {};
        if (building.upgradeEnd) {
          info = {
            t: this._time(building.upgradeEnd - now),
          };
        }
        this.buildingDivs[i].redraw({
          name: b.name,
          level: building.level,
          info: info,
        });
      }
    }
  }

  _updateBuilding(id, now) {
  }

  _time(ms) {
    if (ms < 0) ms = 0;
    let totalSeconds = Math.ceil(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // in Hh0m drop the 0m part; and same for m/s
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? minutes + 'm' : ''}`;
    } else if (minutes > 0) {
      return `${minutes}m${seconds > 0 ? seconds + 's' : ''}`;
    } else {
      return `${seconds}s`;
    }
  }

  _updateDebugPanel() {
    const json = JSON.stringify(this.program.persist.data, null, 2);
    this.debugDiv.textContent = json;
  }
}
