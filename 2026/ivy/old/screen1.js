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
    this.redrawCount = 0;

    const setup = new SpaceSetup();
    this.space = new Space({}, Date.now(), {});
  }

  init() {
    // clear the top container
    this._setupUI();
    this._loop();
  }

  _setupUI() {
    let count = ++this.redrawCount;
    this.parent.innerHTML = '';
    this.parent.style.display = 'flex';
    this.parent.style.flexDirection = 'column';
    this.parent.style.height = '100vh';
    Ux.div({ parent: this.parent });

    let topText = `Screen1 - Redraw count: ${count}`;
    this.topbuttons = Ux.box1({
      parent: this.parent,
    });
    Ux.text1({
      parent: this.topbuttons,
      text: topText,
    });
    Ux.button({
      parent: this.topbuttons,
      text: 'Save',
      onclick: () => {
        this._save();
      },
    });
    Ux.button({
      parent: this.topbuttons,
      text: 'Redraw',
      onclick: () => {
        this._setupUI();
      },
    });
    Ux.button({
      parent: this.topbuttons,
      text: 'New game',
      onclick: () => {
        this.program._deleteSaved();
        this.program.gotoScene();
      },
    });

    this.scrollArea = Ux.div({
      parent: this.parent,
    });
    this.scrollArea.style.overflow = 'auto';
    this.scrollArea.style.flex = '1';
    this.scrollArea.style.maxWidth = 'none';
    this.scrollArea.style.width = '100%';
    new Boreal(this.scrollArea, { scrollable: true });

    this.part2 = Ux.gameHeader({
      parent: this.scrollArea,
      space: this.space,
    });
    this.part3 = Ux.text1({
      parent: this.scrollArea,
      text: 'Space',
    });
    this.part4 = Ux.text1({
      parent: this.scrollArea,
      text: 'City',
    });

  this.debugDiv = document.createElement('div');
  this.debugDiv.style.fontSize = '11px';
  this.debugDiv.style.lineHeight = '1.2';
  this.debugDiv.style.whiteSpace = 'pre-wrap';
  this.debugDiv.style.fontFamily = 'monospace';
  this.scrollArea.appendChild(this.debugDiv);
  this._updateDebugPanel();

/*
    // this._setupUI();
    // City area is already created in createGameLayout
    const allDivs = Array.from(this.container.querySelectorAll('div'));
    this.cityDiv = allDivs.find(d => d.style.overflowY === 'auto') || allDivs[allDivs.length - 1];

    this.buildingDivs = {};
    const spaceport = this.space.spaceport;
    for (const building of spaceport.buildings) {
      const bid = building.id;
      let params = {};
      if (this.space.canVerb(bid, 'upgrade')) {
        params.onUpgrade = () => {
          this.space.upgrade(bid);
        };
      }
      if (this.space.canVerb(bid, 'speedup')) {
        params.onSpeedup = () => {};
      }
      if (this.space.canVerb(bid, 'collect')) {
        params.onCollect = () => {};
      }
      params.parent = this.cityDiv;
      params.onCommand = (cmd) => {
        this.space.doCommand(cmd);
      }
      const buildingDiv = Ux.building2(params);
      this.buildingDivs[bid] = buildingDiv;
      this.cityDiv.appendChild(buildingDiv);
    }

    // Store section
    this.store = Ux.store({
      parent: this.cityDiv,
      expand: false,
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two', hidden: true },
        { id: 'three', name: 'Three' },
      ],
      onBuy: (item) => console.log(`Buy item: ${JSON.stringify(item)}`),
    });
    */
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
    this.part2.redraw();
    let info = '';
    const current = this.program.current;
    if (current) {
      info = `Count: ${current.count ?? 0} | Saved: ${current.saved ?? 0}`;
    }

    // Update resources
    /*
    this.container.updateResources({
      money: this.space.spaceport.money,
      gems: this.space.spaceport.gems || 0
    });
    */

    // Update buildings
    let spaceport = this.space.spaceport;
    for (const bid in this.buildingDivs) {
      const building = spaceport.getBuilding(bid);
      if (building) {
        const blueprint = this.space.rules.blueprints[building.id];
        if (blueprint) {
          let info = {};
          if (building.upgradeEnd && building.upgradeEnd > now) {
            info.t = this._time(building.upgradeEnd - now);
          }
          this.buildingDivs[bid].redraw({
            name: blueprint.name,
            level: building.level,
            info: info,
          });
        }
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
    if (this.debugDiv) {
      const json = JSON.stringify(this.program.persist.data, null, 2);
      this.debugDiv.textContent = json;
    }
  }
}
