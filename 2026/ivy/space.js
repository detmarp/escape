import Spaceport from './spaceport.js';

export default class Space {
  constructor(spaceport = null) {
    this.spaceport = spaceport || new Spaceport();
    this.events = [];
  }

  init() {
    this.lastUpdate = Date.now();
  }

  upgrade(buildingId) {
    const building = this.spaceport.getBuilding(buildingId);
    if (!building) return false;
    if (this.spaceport.money < building.cost) return false;

    this.spaceport.money -= building.cost;
    building.level += 1;
    const now = Date.now();
    const dueTime = now + building.buildTime * 1000;

    this.spaceport.addProcess({
      id: `upgrade-${buildingId}-${now}`,
      type: 'upgrade',
      buildingId,
      dueTime,
      startTime: now,
    });

    return true;
  }

  update(timestamp) {
    const now = timestamp || Date.now();
    this.events = [];

    let hasMore = true;
    while (hasMore) {
      hasMore = false;

      for (let i = this.spaceport.processes.length - 1; i >= 0; i--) {
        const proc = this.spaceport.processes[i];
        if (proc.dueTime <= now) {
          hasMore = true;
          this._handleProcess(proc);
          this.spaceport.removeProcess(proc.id);
        }
      }
    }

    this.spaceport.lastUpdate = now;
    return this.events;
  }

  _handleProcess(proc) {
    if (proc.type === 'upgrade') {
      const building = this.spaceport.getBuilding(proc.buildingId);
      this.spaceport.money += building.productionRate * 10;
      this.events.push({
        type: 'upgrade-complete',
        buildingId: proc.buildingId,
        level: building.level,
        time: proc.dueTime,
      });
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
}