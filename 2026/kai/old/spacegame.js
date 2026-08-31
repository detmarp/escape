import SpaceCity from './spacecity.js';
import SpaceUtil from './spaceutil.js';
import rules from '../data/rules0.js';

export default class SpaceGame {
  constructor() {
    this._id = 0;
    this.rules = rules;
    this.city = new SpaceCity(this);
    this.util = new SpaceUtil(this);
  }

  init(data) {
    this._id = data?.id || 0;
    this.data = { ...data.data || {} };
  }

  start(now) {
    this.now = now;

    if (this.data.pending) {
      // fix up relative times in pending events
      for (let p of this.data.pending) {
        if (p.time < 0) {
          p.time = this.now - p.time;
        }
      }
    }
  }

  *update(now) {
    if (now <= this.now) {
      return;
    }

    yield *this._updatePending();

    this.now = now;

    let prev = Math.floor((this.lastTickAction || 0) / 10000);
    let next = Math.floor(this.now / 10000);

    if (next > prev) {
      yield* this._doAction({
        action: 'tick',
        time: this.now,
      });
    }
  }

  doCommand(command) {
    if (command.command === 'build') {
      let buildingId = this._getId();
      this._enqueueEvent(
        {
          event: 'add',
          type: command.type, // building type
          id: this._getId(),
          buildingId: buildingId,
        },
        1
      );

      this._enqueueEvent(
        {
          event: 'upgrade',
          id: this._getId(),
          buildingId: buildingId,
        },
        4 * 1000
      );

    }
  }

  *_updatePending() {
    let pending = this._movePending(this.now);

    if (pending.length > 0) {
      console.log(`ppp0 pending: ${JSON.stringify(pending)}`);
      for (var p of pending) {
        console.log(`ppp1 pending: ${p.time - this.now} ${JSON.stringify(p)}`);
      }
      let mark = pending[0];
      if (mark.time <= this.now) {
        this.now = mark.time;
        pending.shift();
        if (mark.event) {
          yield* this._doEvent(mark.event);
        }
      }
    }
  }

  _enqueueEvent(event, delay) {
    this.data.pending ||= [];
    this.data.pending.push({ event, time: this.now + delay });
    this.data.pending.sort((a, b) => a.time - b.time);
    this.dirty = true;
  }

  *_doEvent(event) {
    if (event.event === 'add') {
      // add a building
      yield* this._doAction({
        action: 'add',
        type: event.type,
        buildingId: event.buildingId,
      });
    }
    if (event.event === 'upgrade') {
      let building = this.findBuilding(event.buildingId);
      if (building) {
        yield* this._doAction({
          action: 'upgrade',
          buildingId: event.buildingId,
        });
      }
    }
  }

  *_doAction(action) {
    //console.log(`ddd Action: ${JSON.stringify(action)}`);
    if (action.action === 'tick') {
      this.lastTickAction = action.time;
      yield action;
    }
    if (action.action === 'add') {
      this.data.buildings ||= [];
      this.data.buildings.push({
        type: action.type,
        id: action.buildingId,
        level: 0,
      });
      this.dirty = true;
      yield action;
    }
    if (action.action === 'upgrade') {
      let building = this.findBuilding(action.buildingId);
      if (building) {
        building.level++;
        // TODO detmar HACK set collect time
        building.collectTime = this.now;
      }
      this.dirty = true;
      yield action;
    }
  }

  _movePending(now) {
    this.pending = this.data.pending || [];
    // move any data.pending items that are due to this.pending
    let ready = [];
    for (let i = 0; i < this.pending.length; i++) {
      if (this.pending[i].time <= now) {
        ready.push(this.pending[i]);
      }
    }
    this.data.pending = this.pending.filter(p => p.time > now);

    ready.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      if (a.id !== undefined && b.id !== undefined) return a.id - b.id;
      return 0;
    });

    if (ready.length > 0) {
      this.dirty = true;
    }
    return ready;
  }

  _getId() {
    return this._id++;
  }

  findBuilding(buildingId) {
    this.data.buildings ||= [];
    return this.data.buildings.find(b => b.id === buildingId);
  }

  getBuildingSummary(buildingId) {
    let building = this.findBuilding(buildingId);
    if (building) {
      let blueprint = this.rules.blueprints[building.type];
      if (blueprint) {
        let name = blueprint.name || building.type;
        let levelInfo = blueprint.levels[building.level];
        let upgrade;
        // if search pending list for event upgrade on this building,
        if (this.data.pending) {
          for (let p of this.data.pending) {
            if (p.event?.event === 'upgrade' && p.event?.buildingId === buildingId) {
              upgrade = p;
              break;
            }
          }
        }

        let summary = {
          id: building.id,
          type: building.type,
          name: name,
          level: building.level,
        };

        if (upgrade) {
          summary.upgradeTime = upgrade.time - this.now;
          let cost = levelInfo?.upgrade?.speedupCost;
          if (cost) {
            summary.speedupCost = cost;
          }
        }

        this._addCollectSummary(building, blueprint, levelInfo, summary);

        return summary;
      }
    }
    return null;
  }

  _addCollectSummary(building, blueprint, levelInfo, summary) {
    // to add a collect:{}, building needs .collectTime, and blueprint needs .collect
    // set { currenct: amount:  }, wherte amount is timed amount clamped to .capacity
    if (building.collectTime && levelInfo?.collect) {
      let minutes = (this.now - building.collectTime) / 60000;
      let raw = minutes * levelInfo.collect.perMinute;
      let amount = Math.min(Math.floor(raw), levelInfo.collect.capacity);
      summary.collect = {
        currency: levelInfo.collect.currency,
        amount: amount,
      };
    }
  }
}