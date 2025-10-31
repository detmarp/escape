import TinyBoard from './tinyboard.js';
import TinyDeck from './tinydeck.js';

export default class Tiny {
  constructor(seed, rules) {
    this.rules = rules ? Object.assign({}, rules) : {};
    this.board = new TinyBoard(this);
    this.deck = new TinyDeck();
    this.score = {};
    this.specials = [];
    this.specialId = 0;
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

    this.gameOver = this.gameOver ||
      this._countCells(cell => cell.building || cell.resource) >= 16;
  }

  toObject() {
    return {
      gameSeed: this.gameSeed,
      randomSeed: this.randomSeed,
      gameOver: this.gameOver,
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
      }),
      specials: this.specials || undefined,
      timeStamp: this.timeStamp,
    };
  }

  static fromObject(obj = {}) {
    const instance = new Tiny();
    instance.gameSeed = parseInt(obj.gameSeed, 10);
    instance.randomSeed = parseInt(obj.randomSeed, 10) || instance.gameSeed;
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
    instance.specials = obj.specials || [];
    instance.gameOver = obj.gameOver;
    instance.timeStamp = obj.timeStamp;
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

    this.doneResource = false;
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
      this.addSpecial(placement.card.special, { cell: position });
    }
  }

  doSpecial(id, params) {
    if (this.gameOver) {
      return;
    }

    // find the special with this id, set it as active, optionally merge params, and remove it from the list
    const idx = this.specials.findIndex(s => s && s.id === id);
    if (idx === -1) return;
    let special = this.specials[idx];
    this.specials.splice(idx, 1);

    if (special.name === 'addResource') {
      console.log(`this.board.cells[${special.cell}].resource =`, params.resource);
      this.board.cells[special.cell].resource = params.resource;
    }

    if (special.name === 'replaceBuilding') {
      const cellIdx = params.cell;
      let card = this.cardMap[params.building];
      this.board.cells[cellIdx].building = card;
      this.board.cells[cellIdx].resource = null;
      if (card.special) {
        this.addSpecial(card.special, { cell: cellIdx });
      }

    }

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
    this.score = {};

    this.score.empty = -1 * this._countCells(cell => !cell.building);

    let canFeed = this._findBuildingsByCategory('red').length * 4;
    this.score.red = 0;

    let blueCount = this._findBuildingsByCategory('blue').length;
    let fedCount = Math.min(canFeed, blueCount);
    this.score.blue = 3 * fedCount;

    this.score.pink = 1 * this._findBuildingsByCategory('pink').length;

    this.score.black = 0;

    this.score.orange = this._findBuildingsByCategory('orange').length * fedCount;

    this.score.gray = this._findBuildingsByCategory('gray').length * 2;

    this.score.yellow = 0;
    this._findBuildingsByCategory('yellow').forEach(yellow => {
      // For each yellow,
      let unique = new Set();
      this._findBuildings(b => {
        // count unique types in same row or column
        return (
          b.index !== yellow.index &&
          (b.x === yellow.x || b.y === yellow.y)
        );
      }).forEach(b => {
        unique.add(b.category);
      });
      this.score.yellow += 1 * unique.size;
    });

    let greenCount = this._findBuildingsByCategory('green').length;
    const greenTable = [2, 5, 9, 14, 20];
    this.score.green = greenTable[Math.min(greenCount, greenTable.length) - 1] || 0;

    this.score.gray = 0;
    this._findBuildingsByCategory('gray').forEach(gray => {
      // find adjacent blue
      this.score.gray += 1 * this._findBuildings(b => {
        return (
          Math.abs(b.x - gray.x) + Math.abs(b.y - gray.y) === 1 &&
          b.category === 'blue'
        )}).length;
    });

    return this._totalScore();
  }

  addSpecial(special, params) {
    if (this.gameOver) {
      return;
    }

    let count = special.count || 1;
    for (let i = 0; i < count; i++) {
      let s = Object.assign({}, special);
      s.id = this.specialId++;
      if (params) {
        Object.assign(s, params);
      }
      this.specials.push(s);
    }
  }

  _totalScore() {
    this.score.total = 0;
    for (const [key, val] of Object.entries(this.score)) {
      if (key !== 'total') {
        const n = (typeof val === 'number') ? val : (Number(val) || 0);
        this.score.total += n;
      }
    }
    return this.score;
  }

  _findBuildings(predicate) {
    let buildings = [];
    this.board.cells.forEach(cell => {
      if (cell.building) {
        let building = {
          index: cell.index,
          x: cell.index % 4,
          y: Math.floor(cell.index / 4),
          category: cell.building.category,
        };
        if (predicate(building)) {
          buildings.push(building);
        }
      }
    });
    return buildings;
  }

  _findBuildingsByCategory(category) {
    return this._findBuildings(b => b.category === category);
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
}