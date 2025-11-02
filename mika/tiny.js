import TinyBoard from './tinyboard.js';
import TinyScore from './tinyscore.js';
import TinySpecial from './tinyspecial.js';

export default class Tiny {
  constructor(seed, rules, sharedDeck = null) {
    this.rules = rules ? Object.assign({}, rules) : {};
    this.board = new TinyBoard(this);

    // Use the shared deck if provided
    if (sharedDeck) {
      this.deck = sharedDeck;
    }

    this.special = new TinySpecial(this);
    this.score = new TinyScore(this);
    this.timeStamp = Date.now();

    this.gameSeed = (typeof seed === 'number') ?
      seed :
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    this.randomSeed = this.gameSeed;

    let drawPile = this.shuffle([
      'wood', 'brick', 'wheat', 'stone', 'glass',
      'wood', 'brick', 'wheat', 'stone', 'glass',
      'wood', 'brick', 'wheat', 'stone', 'glass',
      ]);

    this.resources = {
      drawPile: drawPile.slice(3),
      row: drawPile.slice(0, 3),
      picked: null,
    };

    this.startGame();
  }

  startGame() {
    this.cardMap = {};
    this.deck.cards.forEach(card => {
      this.cardMap[card.category] = card;
    });

    this._refresh();
  }

  _refresh() {
    this.started = this.started || this._countCells(cell => cell.building || cell.resource) > 0;

    if (!this.gameOver) {
      if (this._countCells(cell => cell.building || cell.resource) >= 16) {
        this.gameOver = true;
        //this.timeStamp = Date.now();
      }
    }

    this.score.calculate();
  }

  toObject() {
    let cells = [];
    this.board.cells.forEach(cell => {
      let c = [];
      if (cell.building) {
        c.push(cell.building.category);
      }
      if (cell.resource) {
        c.push(cell.resource);
      }
      cells.push(c);
    });

    return {
      gameSeed: this.gameSeed,
      randomSeed: this.randomSeed,
      started: this.started,
      gameOver: this.gameOver,
      cells,
      specials: this.special.specials || undefined,
      timeStamp: this.timeStamp,
      points: this.score.displayScore,
      resources: this.resources,
    };
  }

  static fromObject(obj = {}, sharedDeck = null) {
    const instance = new Tiny(null, null, sharedDeck);
    instance.gameSeed = parseInt(obj.gameSeed, 10);
    instance.randomSeed = parseInt(obj.randomSeed, 10) || instance.gameSeed;
    instance.special.specials = obj.specials || [];
    instance.gameOver = obj.gameOver;
    instance.timeStamp = obj.timeStamp;

    obj.cells.forEach((cell, i) => {
      cell.forEach(contents => {
        let building = instance.lookupHand(contents);
        if (building) {
          instance.board.cells[i].building = building;
        }
        else {
          let resource = instance.lookupResource(contents);
          if (resource) {
            instance.board.cells[i].resource = resource;
          }
        }
      });
    });

    if (obj.resources) {
      instance.resources = obj.resources;
    }

    instance._refresh();
    return instance;
  }

  random(range) {
    if (range <= 0) return 0;
    this.randomSeed = ((this.randomSeed * 1664525 + 1013904223) >>> 0);
    const frac = this.randomSeed / 0x100000000;
    return Math.floor(frac * range);
  }

  shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.random(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  endTurn() {
    if (this.resources.picked) {
      this.resources.drawPile.push(this.resources.picked);
      this.resources.picked = null;
      const next = this.resources.drawPile.splice(0, 1);
      this.resources.row.push(next[0]);
    }

    this.doneResource = null;
    this.full = false;

    this._refresh();
  }


  getResources() {
    return this.resources.row
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
    if (this.gameOver) {
      return;
    }

    let list = [];

    for (let c = 0; c < this.board.cells.length; c++) {
      if (position != null && c !== position) {
        continue;
      }
      if (this.board.cells[c].building || this.board.cells[c].resource) {
        continue;
      }
      for (const r of this.resources.row) {
        if (resource != null && r !== resource) {
          continue;
        }
        let can = {
          position: c,
          resource: r,
        };
        list.push(can);
      }
    }

    if (list.length === 0) {
      return;
    }

    return list;
  }

  doResource(position, resource) {
    if (!this.canDoResource(position, resource)) {
      return;
    }
    this.board.cells[position].resource = resource;
    this.doneResource = {
      cellIndex: position,
      resource: resource,
    };

    const i = this.resources.row.indexOf(resource);
    if (i !== -1) {
      this.resources.row.splice(i, 1);
    }
    this.resources.picked = resource;
  }

  doCard(position, placement) {
    if (this.gameOver) {
      return;
    }

    for (let i=0; i < placement.resourceIndexes.length; i++) {
      const idx = placement.resourceIndexes[i];
      this.board.cells[idx].resource = null;
      this.board.cells[idx].building = null;
    }
    this.board.cells[position].building = placement.card;
    this.board.cells[position].resource = null;

    if (placement.card.special) {
      this.special.addSpecial(placement.card.special, { cell: position });
    }
  }

  doSpecial(id, params) {
    if (this.gameOver) {
      return;
    }
    return this.special.doSpecial(id, params);
  }

  addSpecial(special, params) {
    if (this.gameOver) {
      return;
    }
    return this.special.addSpecial(special, params);
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
    if (this.gameOver) {
      return placements;
    }

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

  calculateScore() {
    this.score.calculate();
    return this.score.displayScore
  }

  _countCells(predicate) {
    let count = 0;
    this.board.cells.forEach(cell => {
      if (predicate(cell)) {
        count++;
      }
    });
    return count;
  }

  getResourceList() {
    // Array of the resources for this game
    return ['wood', 'brick', 'wheat', 'stone', 'glass'];
  }

  getCategoryList() {
    // Array of the building categories for this game
    return ['red', 'orange', 'yellow', 'green', 'blue', 'black', 'gray', 'pink'];
  }

  getCardNameList() {
    // Array of short names of cards in the current hand
    return this.getHand().map(card => card.short);
  }

  lookupDeck(name) {
    // return a card object from the entire deck by this name; or null
    const deck = this.getDeck();
    return deck.find(card => card.name === name) || null;
  }

  lookupHand(name) {
    // return a card object from the current hand by short name; or null
    const hand = this.getHand();
    // search by short name
    let card = hand.find(card => card.short === name);
    if (!card) {
      // search by category
      card = hand.find(card => card.category === name);
    }
    return card;
  }

  lookupResource(name) {
    // Returns a resource string, or null
    // name can be a full name, or a resource code letter
    const resources = this.getResourceList();
    if (resources.includes(name)) {
      return name;
    }
    const map = {
      'w': 'wood',
      'b': 'brick',
      'y': 'wheat',
      'g': 'glass',
      's': 'stone',
    };
    if (map.hasOwnProperty(name)) {
      return map[name];
    }
    return null;
  }
}
