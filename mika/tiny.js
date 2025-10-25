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

  endTurn() {
    this.doneResource = false;
    this.full = false;
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

  canDoResource(position, resource) {
    // return an array of legal placements, or null
    // position and color are optional, but if present will filter results
    // TODO detmar - not really implemented
    if (
      this.board.cells[position].resource ||
      this.board.cells[position].building ||
      this.doneResource
    ) {
      return;
    }
    return {
      position: position,
      resource: resource,
    };
  }

  doResource(position, resource) {
    if (!this.canDoResource(position, resource)) {
      return;
    }
    this.board.cells[position].resource = resource;
    this.doneResource = true;
  }

  doCard(position, placement) {
    for (let i=0; i < placement.resourceIndexes.length; i++) {
      const idx = placement.resourceIndexes[i];
      this.board.cells[idx].resource = null;
      this.board.cells[idx].building = null;
    }
    this.board.cells[position].building = placement.card;
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
    for (let h = 0; h < hand.length; h++) {
      let card = hand[h];
      for (let r = 0; r < 4; r++) {
        let shape = this.pivotList(card.shape, r);
        let pattern = this._getMatchPattern(shape);
        for (var j = 0; j <= 4 - pattern.height; j++) {
          for (var i = 0; i <= 4 - pattern.width; i++) {
            // check if pattern matches at board position (i,j)
            let found = true;
            let resourceIndexes = [];
            for (var k = 0; k < pattern.cells.length; k++) {
              const cell = pattern.cells[k];
              let offset = j * 4 + i + cell.offset;
              const boardCell = this.board.cells[offset];
              if (boardCell && boardCell.resource !== cell.resource) {
                found = false;
                break;
              }
              resourceIndexes.push(offset);
            }
            ///console.log(`ccc ${pattern.flat} ${i},${j} found=${found}`);
            if (found) {
              let placement = {
                card: card,
                rotation: r,
                resourceIndexes: resourceIndexes
              };
              placements.push(placement);
            }
          }
        }
      }
    }
    console.log(`fff ${JSON.stringify(placements)}`);
    //     let shapeRows = shape.length;
    //     let shapeCols = shapeRows > 0 ? Math.max(...shape.map(row => row.length)) : 0;

    // let list = [];
    // this.board.cells.forEach((cell, i) => {
    //   if (cell.resource) {
    //     list.push(i);
    //   }
    // });

    // for (var i = 0; i < list.length - 2; i++) {
    //   var k = i % hand.length;
    //   var card = hand[k];
    //   placements.push({
    //     cells: [ list[i], list[i + 1], list[i + 2] ],
    //     card: card
    //   });
    // }

    return placements;
  }

  pivotList(list, count = 1) {
    // Pivot a list of strings, clockwise. Assume first string defines the width.
    count = count % 4;
    if (count === 0) return list.slice();

    let out = [];
    for (let i = 0; i < count; i++) {
      const s = list.join('');
      const width = list[0].length;
      const height = Math.ceil(s.length / width);

      // build rows of equal width, padding the last row if needed
      const rows = new Array(height);
      for (let i = 0; i < height; i++) {
        rows[i] = s.slice(i * width, (i + 1) * width).padEnd(width, ' ');
      }

      // rotate clockwise: columns become rows (iterate columns left-to-right,
      // taking characters from bottom row to top row)
      out = [];
      for (let col = 0; col < width; col++) {
        let row = '';
        for (let r = height - 1; r >= 0; r--) {
          row += rows[r][col];
        }
        // trim trailing padding
        out.push(row.replace(/\s+$/, ''));
      }
      list = out;
    }
    return out;
  }

  _getMatchPattern(shape) {
    // build matching pattern from shape
    const map = {
      'c': 'glass',
      'r': 'brick',
      'b': 'wood',
      'g': 'stone',
      'y': 'wheat',
      '-': null,
    };
    let width = shape[0].length;
    let height = shape.length;
    const paddedWidth = 4;
    const s = shape.map(row => row.padEnd(paddedWidth, '-')).join('');
    let pattern = {
      width: width,
      height: height,
      flat: s,
      cells: [],
    };
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '-') continue;
      const resource = map.hasOwnProperty(ch) ? map[ch] : null;
      pattern.cells.push({ offset: i, resource });
    }
    return pattern;
  }
}