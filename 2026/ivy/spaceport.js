import rules from './spacerules.js';

export default class Spaceport {
  constructor(params = {}) {
    this.rules = params.rules || rules;
    this.money = params.startingMoney ?? this.rules.setup.basic.startingMoney;
    this.buildings = this._initBuildings();
    this.processes = [];
    this.history = {
      launches: 0,
      missionsCompleted: 0,
      disasters: 0,
      retiredAstronauts: 0,
      inMemoriamAstronauts: 0,
    };
    this.lastUpdate = Date.now();

    if (params.initialBuildings) {
      for (const bid of params.initialBuildings) {
        if (this.buildings[bid]) {
          this.buildings[bid].level = 1;
        }
      }
    }
  }

  _initBuildings() {
    const buildings = {};
    for (const cfg of this.rules.buildings) {
      buildings[cfg.id] = {
        id: cfg.id,
        name: cfg.name,
        level: 0,
        productionRate: cfg.productionRate,
        buildTime: cfg.buildTime,
        cost: cfg.cost,
      };
    }
    return buildings;
  }

  getBuilding(id) {
    return this.buildings[id] || null;
  }

  getProcessesFor(buildingId) {
    return this.processes.filter(p => p.buildingId === buildingId);
  }

  addProcess(proc) {
    this.processes.push(proc);
  }

  removeProcess(procId) {
    const idx = this.processes.findIndex(p => p.id === procId);
    if (idx !== -1) {
      this.processes.splice(idx, 1);
    }
  }

  toObject() {
    return {
      money: this.money,
      buildings: this.buildings,
      processes: this.processes,
      history: this.history,
      lastUpdate: this.lastUpdate,
    };
  }

  static fromObject(obj, rulesOverride = null) {
    const port = new Spaceport({ rules: rulesOverride });
    port.money = obj.money;
    port.buildings = obj.buildings;
    port.processes = obj.processes;
    port.history = obj.history;
    port.lastUpdate = obj.lastUpdate;
    return port;
  }
}
