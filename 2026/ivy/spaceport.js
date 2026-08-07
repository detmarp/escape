export default class Spaceport {
  constructor(params = {}) {
    this.rules = params.rules || {};
    this.buildings = [];
    this.history = {};
    this.lastUpdate = 0;
  }

  getBuilding(id) {
    // search for building by id in the buildings array
    for (const building of this.buildings) {
      if (building.id === id) {
        return building;
      }
    }
  }

  toObject() {
    const buildings = [];
    for (const b of this.buildings) {
      buildings.push(b);
    }
    return {
      money: this.money,
      buildings,
      history: this.history,
      lastUpdate: this.lastUpdate,
    };
  }

  static fromObject(obj, rulesOverride = null) {
    const port = new Spaceport({ rules: rulesOverride });
    port.money = obj.money;
    if (obj.buildings) {
      for (const b in obj.buildings) {
        if (port.buildings[b]) {
          port.buildings[b].level = obj.buildings[b].level;
        }
      }
    }
    port.history = obj.history || port.history;
    port.lastUpdate = obj.lastUpdate || Date.now();
    return port;
  }
}
