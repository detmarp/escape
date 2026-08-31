import Ux from './ux.js';
import SpaceGame from './spacegame.js';

export default class Screen2 {
  // static count
  static count = 0;

  constructor(parent, program, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    Screen2.count++;
  }

  async init() {
    this.now = Date.now();
    await this._createSpaceGame(this.params.gameData);

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
    this.boardView = Ux.div({ parent: this.div });
    this._rebuildBoardView();

    this.saveArea = Ux.text1({
      parent: this.div,
    });
    this._updateSaveArea();

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
    // We use a real wall clock 'now' to unfold game progress in real time,
    // And a clamped 'dt' to manage screen effects
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
    this.dt = dt;
    this.now = now;
    this.frame++;
    while (true) {
      const gen = this.game.update(now);
      const result = gen.next();
      if (result.done) {
        break;
      }
      let action = result.value;
      console.log(`aaa action: ${JSON.stringify(action)}`);
      if (action.action === 'tick') {
      }
    }

    if (this.game.dirty) {
      this._rebuildBoardView();
      this._save();
      this.game.dirty = false;
    }
  }

  draw() {
    this._updateScreen();
  }

  _updatePendingArea() {
    let lines = [];
    for (let p of this.game.data.pending ?? []) {
      let time = p.time;
      let data = { ...p, time:undefined };
      lines.push(`${this._timeString(p.time - this.now)}: ${JSON.stringify(data)}`);
    }
    this.pendingArea.textContent = lines.join('\n');
  }

  _updateScreen() {
    let params = {
      frame: this.frame,
      dt: this.dt,
      now: this.now,
      count: Screen2.count,
    };
    this.header.redraw(params);
    this._updatePendingArea();
    this._updateBanner();
    this._createOrUpdateBuildings(false);
  }

  _updateBanner() {
    // 💰🪙💴💵💶💷 - 💎🔷🔶⭐🌟✨⚡- << library of emojis to play with
    const c = this.game.data.currency;
    this.banner.textContent = `🪙${c.gold} 💎${c.gems}`;
  }

  _rebuildBoardView() {
    this.boardView.innerHTML = '';

    this.banner = Ux.text1({
      parent: this.boardView,
    });
    this._updateBanner();

    this.sky = Ux.box1({ parent: this.boardView });
    this.sky.style.minHeight = '6em';
    this.sky.style.background = 'linear-gradient(to bottom, #000030 0%, #000030 60%, #000050 70%, #4a90d9 80%, #87CEEB 100%)';

    this.city = Ux.box1({parent: this.boardView});
    this.city.style.minHeight = '8em';
    this.city.style.background = 'linear-gradient(to bottom, hsl(120, 60%, 50%), hsl(120, 30%, 50%))';

    this._createOrUpdateBuildings(true);

    const storeRow = Ux.div({ parent: this.city });
    storeRow.style.width = '100%';
    Ux.store({
      parent: storeRow,
      items: [
        {
          name: 'Build Launchpad',
          command: { command: 'build', type: 'launchpad' },
        },
        {name: 'Building 2'},
        {name: 'Building 3', hidden: true}
      ],
      onBuy: (item) => {
        if (item.command) {
          this.game.doCommand(item.command);
        }
      }
    });

    this.pendingArea = Ux.text1({
      parent: this.boardView,
    });
    this._updatePendingArea();
  }

  _updateSaveArea() {
    this.saveArea.textContent = `${JSON.stringify(this.program.persist.data)}`;
  }

  _restart(gameData = null) {
    this.program.gameData = gameData;
    this.program.gotoScene();
  }

  async _createSpaceGame(gameData) {
    console.log(`ccc0 ${JSON.stringify(gameData)}`);

    if (!gameData || Object.keys(gameData).length == 0) {
      gameData = await this._createDefaultGame();
    }

    gameData = this._normalizeGameData(gameData);

    console.log(`ccc1 ${JSON.stringify(gameData)}`);
    this.game = new SpaceGame();
    this.game.init(gameData);
    this.game.start(this.now);
  }

  async _createDefaultGame() {
    let data = await this.program.loadObject('./data/city0.js');
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
    let data = { ... this.game.data ?? {}};
    this.game.dirty = false;
    this.program.persist.data ||= {};
    let saveGame = {
      id: this.game._id,
      data,
    };
    this.program.persist.data.current = saveGame;
    this.program.save();
    console.log(`screen2._save\n${JSON.stringify(saveGame, null, 2)}`);
    this._updateSaveArea();
  }

  _currencyString(cost) {
    // first char; cost.currency gold:🪙, gems:💎, else '$'
    // make a lttle table for above
    // value, .amount else '0'
    let symbol = {
      gold: '🪙',
      gems: '💎',
      default: '$',
    };
    let value = cost?.amount ?? 0;
    return `${symbol[cost?.currency] ?? symbol.default}${value}`;
  }

  _timeString(ms) {
    let suffix = '';
    if (ms < 0) {
      suffix = ' ago';
      ms = -ms - 1000;
    }
    let totalSeconds = Math.ceil(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // in Hh0m drop the 0m part; and same for m/s
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? minutes + 'm' : ''}${suffix}`;
    } else if (minutes > 0) {
      return `${minutes}m${seconds > 0 ? seconds + 's' : ''}${suffix}`;
    } else {
      return `${seconds}s${suffix}`;
    }
  }

  _createOrUpdateBuildings(create) {
    if (!this.game.data.buildings) {
      return;
    }
    if (create) {
      this.city._divs = {};
    }

    for (let building of this.game.data.buildings) {
      let summary = this.game.getBuildingSummary(building.id);
      if (!summary) {
        continue;
      }

      let buildingDiv;
      let canSpeedup = summary.upgradeTime && summary.speedupCost;

      if (create) {
        // Initially create all the elements in a building
        let controls = {
          text: {},
        }

        if (canSpeedup) {
          controls.speedup = {
            text: {},
            onclick: () => {
              console.log(`Speed up clicked for building ${building.id}`);
            },
          };
        }

        controls.footer = {};

        buildingDiv = Ux.building3({
          ... building,
          parent: this.city,
          controls: controls,
        });
        this.city._divs[building.id] = buildingDiv;
      }
      else {
        buildingDiv = this.city._divs[building.id];
      }

      if (buildingDiv) {
        // Optionally update certain building controls
        let text = '';
        let name = `${summary.name ?? '?'} [${summary.level ?? '?'}]`;
        text += name;
        if (summary.upgradeTime) {
          text += `\n${this._timeString(summary.upgradeTime)}`;
        }
        let controls = {
          text: {
            text: `${text}\n`,
          },
          footer: {
            text: `${JSON.stringify(summary)}`,
          },
          speedup: {},
        };

        controls.speedup.disabled = !canSpeedup;
        if (canSpeedup) {
          controls.speedup.text = `Speed up ${this._currencyString(summary.speedupCost)}`;
        }

        buildingDiv.redraw({
          controls: {
            ...controls,
          },
        });
      }
    }
  }
}
