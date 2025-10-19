import TinyBoard from './tinyboard.js';

export default class Tiny {
  constructor() {
    this.gameSeed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    this.board = new TinyBoard(this);
  }

  static fromObject(obj = {}) {
    const instance = new Tiny();
    if (obj && typeof obj.gameSeed !== 'undefined' && obj.gameSeed !== null) {
      if (typeof obj.gameSeed === 'number') {
        instance.gameSeed = obj.gameSeed;
      } else if (typeof obj.gameSeed === 'string' && /^\d+$/.test(obj.gameSeed)) {
        instance.gameSeed = parseInt(obj.gameSeed, 10);
      }
    }
    return instance;
  }

  canPlace(position, color) {
    // return an array of legal placements, or null
    // position and color are optional, but if present will filter results
    return [
      { position: 0, color: 'red' },
    ];
  }

  getResources() {
    // returns array of placeable resources
    return [ 'wood', 'brick', 'wheat' ];
  }

  doPlace(position, resource) {
    this.board.cells[position].resource = resource;
  }

  toObject() {
    return {
      gameSeed: this.gameSeed,
    };
  }
}