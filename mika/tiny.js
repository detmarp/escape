import TinyBoard from './tinyboard.js';
import TinyDeck from './tinydeck.js';

export default class Tiny {
  constructor() {
    this.board = new TinyBoard(this);
    this.deck = new TinyDeck();

    this.gameSeed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  }

  static fromObject(obj = {}) {
    const instance = new Tiny();
    instance.gameSeed = parseInt(obj.gameSeed, 10);
    if (Array.isArray(obj.cells)) {
      obj.cells.forEach((cellData, i) => {
        if (cellData.resource) {
          instance.board.cells[i].resource = cellData.resource;
        }
        if (cellData.building) {
          instance.board.cells[i].building = instance.deck.map.get(cellData.building);
        }
      });
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
    return [ 'wood', 'brick', 'wheat', 'stone', 'glass' ];
  }

  getHand() {
    var keys = [ 'cott', 'thtr', 'tavrn', 'chapl', 'fact', 'farm', 'well', 'arch' ];

    var hand = [];
    keys.forEach((key) => {
      const card = this.deck.map.get(key);
      if (card) hand.push(card);
    });
    return hand;
  }

  doResource(position, resource) {
    this.board.cells[position].resource = resource;
  }

  doCard(position, card) {
    this.board.cells[position].building = card;
    this.board.cells[position].resource = null;
  }

  toObject() {
    return {
      gameSeed: this.gameSeed,
      cells: Array.from({ length: 16 }, (_, i) => {
        const c = (this.board && Array.isArray(this.board.cells)) ? this.board.cells[i] || {} : {};
        const out = {};
        if (c.resource) {
          out.resource = c.resource;
        }
        if (c.building) {
          out.building = c.building.short;
        }
        return out;
      })
    };
  }

  getResourceCells() {
    // return a obj, where the key is a cell index, and the value something truthy
    var result = {};
    var cells = (this.board && Array.isArray(this.board.cells)) ? this.board.cells : [];
    cells.forEach((cell, i) => {
      if (!cell.resource && !cell.building) {
        result[i] = true;
      }
    });
    return result;
  }

  getBuildingPlacements() {
    // return description of all legal building placements
    let placements = [];

    let hand = this.getHand();

    let list = [];
    this.board.cells.forEach((cell, i) => {
      if (cell.resource) {
        list.push(i);
      }
    });

    for (var i = 0; i < list.length - 2; i++) {
      var k = i % hand.length;
      var card = hand[k];
      placements.push({
        cells: [ list[i], list[i + 1], list[i + 2] ],
        card: card
      });
    }

    return placements;
  }
}