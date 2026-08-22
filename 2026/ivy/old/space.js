import Spaceport from './spaceport.js';
import rules from '../spacerules.js';

export default class Space {
  constructor(saveData, now, params = {}) {
    this._id = 0;
    this.lastTime = now;
    this.time = now;
    this.params = params;
    this.saveData = saveData;
    this.rules = rules;
    this.spaceport = this._makeSpaceport(now);
  }

  upgrade(buildingId) {
    return true;
  }

  *update(now) {
    if (now <= this.time) {
      return;
    }

    let pending = this._findPending(now);

    if (pending.length > 0) {
      console.log(`ppp0 pending: ${JSON.stringify(pending)}`);
      for (var p of pending) {
        console.log(`ppp1 pending: ${p.time - this.time} ${JSON.stringify(p)}`);
      }
      let mark = pending[0];
      if (mark.time <= now) {
        this.time = mark.time;
        pending.shift();
        // do mark
        if (mark.type === 'upgrade') {
          let event = {
            type: 'upgrade',
            id: mark.id,
          };
          this._doEvent(event);
          yield event;
        }
      }
    }
    this.time = now;
    this.spaceport.lastUpdate = now;
  }

  doCommand(command) {
    console.log(`ccc Command: ${JSON.stringify(command)}`);
    let event = {
      id: this._id++,
      command: command,
      time: this.time + 1000,
    };
    this.spaceport.addPending(event);
  }

  _doEvent(event) {
    switch (event.type) {
    case 'upgrade':
      let building = this.spaceport.getBuilding(event.id);
      if (building) {
        building.level++;
        delete building.upgradeEnd;
      }
      break;
    }
  }

  getState() {
    return this.spaceport.toObject();
  }

  save() {
    return JSON.stringify(this.spaceport.toObject());
  }

  load(json) {
    const data = JSON.parse(json);
    this.spaceport = Spaceport.fromObject(data);
  }

  canVerb(buildingId, verb) {
    let building = this.spaceport.getBuilding(buildingId);
    if (!building) return false;

    switch (verb) {
    case 'upgrade':
      if (building.level >= 10) {
        return false;
      }
      if (building.upgradeEnd) {
        return false;
      }
      return true;
      break;
    case 'collect':
      if (building.type === 'hq') {
        return true;
      }
      break;
    case 'speedup':
      if (building.upgradeEnd) {
        return true;
      }
      break;
    }
    return false;
  }

  _makeSpaceport(now) {
    let port = new Spaceport();
    port.money = 100;
    port.buildings = [
      {
        id: 'hangar',
        level: 0,
        upgradeEnd: now + 4 * 1000,
      },
      {
        id: 'launchpad',
        level: 0,
        upgradeEnd: now + 12 * 1000,
      },
    ];
    return port;
  }

  _findPending(now) {
    let pending = [];
    for (const building of this.spaceport.buildings) {
      if (building.upgradeEnd) {
        let thing = {
          type: 'upgrade',
          id: building.id,
          time: building.upgradeEnd,
        };
        //pending.push(thing);
      }
    }
    if (this.spaceport.data && this.spaceport.data.pending) {
      let newPending = [];
      for (const p of this.spaceport.data.pending) {
        if (p.time <= now) {
          pending.push(p);
        } else {
          newPending.push(p);
        }
      }
      this.spaceport.data.pending = newPending;
    }

    pending.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return a.id - b.id;
    });

    return pending;
  }

  _updateHq(building, timestamp) {
    console.log(`hhh HQ ${timestamp} ${JSON.stringify(building)}`);
  }

  _getBuildingDefinition(id, level = 0, rulesOverride = null) {
    const rulesUsed = rulesOverride || this.rules || (this.spaceport && this.spaceport.rules);
    if (!rulesUsed) return null;
    const entry = rulesUsed.blueprints[id];
    if (!entry) return null;
    let definition = { ...entry };
    definition.id = id;
    definition.level = Math.max(0, Math.min(level, (definition.levels.length - 1)));
    definition.levelData = definition.levels[definition.level] || {};
    return definition;
  }
}