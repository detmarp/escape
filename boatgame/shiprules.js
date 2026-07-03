export default class ShipRules {
  constructor(params = {}) {
    let defaults = ShipRules.getDefaults();
    this.data = {
      allowDiagonal: params.allowDiagonal || defaults.allowDiagonal,
      allowAdjacent: params.allowAdjacent || defaults.allowAdjacent,
      continueAfterHit: params.continueAfterHit || defaults.continueAfterHit,
      fleet: params.fleet || defaults.fleet,
    };
  }

  static getDefaults() {
    return {
      allowDiagonal: false,
      allowAdjacent: false,
      continueAfterHit: true,
      fleet: [
        { name: 'Carrier', size: 5 },
        { name: 'Battleship', size: 4 },
        { name: 'Cruiser', size: 3 },
        { name: 'Submarine', size: 3 },
        { name: 'Destroyer', size: 2 },
      ],
    };
  }

  static fromObject(obj) {
    return new ShipRules({
      allowDiagonal: obj.allowDiagonal,
      allowAdjacent: obj.allowAdjacent,
      continueAfterHit: obj.continueAfterHit,
      fleet: obj.fleet,
    });
  }

  toObject() {
    return {
      allowDiagonal: this.data.allowDiagonal,
      allowAdjacent: this.data.allowAdjacent,
      continueAfterHit: this.data.continueAfterHit,
      fleet: this.data.fleet,
    };
  }
}