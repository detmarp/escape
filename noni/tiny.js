import TinyBoard from './tinyboard.js';
import TinyScore from './tinyscore.js';
import TinySpecial from './tinyspecial.js';
import TinyCommand from './tinycommand.js';

export default class Tiny {
  constructor(hand, rules) {
    this.hand = hand;
    this.rules = rules ? Object.assign({}, rules) : {};
    this.board = new TinyBoard(this);
    this.special = new TinySpecial(this);
    this.score = new TinyScore(this);
    this.command = new TinyCommand(this);
    this.timeStamp = Date.now();
    this.state = 'ready';

    this.startGame();
  }

  startGame() {
    this._refresh();
  }

  doCommand(command) {
    this.command.do(command);
  }

  _refresh() {
    let hackWasStarted = this.started;
    this.started = this.started || this._countCells(cell => cell.building || cell.resource) > 0;
    if (!hackWasStarted && this.started) {
      this.state = 'playing';
    }
    if (!this.gameOver) {
      if (this._countCells(cell => cell.building || cell.resource) >= 16) {
        if (!this.pending) {
          this.gameOver = true;
          this.state = 'gameover';
          this.gameOverTimeStamp = Date.now();
        }
      }
    }

    this.buildingPlacements = this.getBuildingPlacements();
    console.log(`bbb placements: ${this.buildingPlacements.length}`);

    this.score.calculate();
  }

  endTurn() {
    this.pending = null;

    this._refresh();
  }

  updateHandResources() {
    // At the end of a resource placement in a turn, move the current resources
    if (this.pending && typeof this.pending.handIndex === 'number') {
      let nextResource;
      const usedResource = this.hand.resources.row.splice(this.pending.handIndex, 1)[0];
      this.hand.resources.drawPile.push(usedResource);
      const next = this.hand.resources.drawPile.splice(0, 1);
      nextResource = next[0];
      this.hand.resources.row.push(nextResource);
      this.hand.resources.picked = null;

      return {
        action: 'updatepool',
        index: this.pending.handIndex,
        resource: nextResource,
      };
    }
  }

  getResources() {
    return this.hand.resources.row
  }

  getHand() {
    return this.hand.cards;
  }

  canDoResource(position, resource, undo) {
    // return an array of legal placements, or null
    // undo lets us ovverride pending state
    // position and color are optional, but if present will filter results
    // TODO detmar - not really implemented
    if (this.gameOver) {
      return;
    }
    if (this.pending && !undo) {
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
      for (const r of this.hand.resources.row) {
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

  canUndo(position, type) {
    if (this.pending) {
      if (this.pending.cellIndex === position) {
        if (type === 'resource' && this.pending.resource) {
          return true;
        }
      }
    }
  }

  doResource(position, resource) {
    if (!this.canDoResource(position, resource)) {
      return;
    }
    this.board.cells[position].resource = resource;
    let handResourceIndex = this.hand.resources.row.indexOf(resource);
    this.pending = {
      cellIndex: position,
      resource: resource,
      handIndex: handResourceIndex < 0 ? null : handResourceIndex,
    };
    this._refresh();
  }

  doCard(position, placement) {
    if (this.gameOver) {
      return;
    }

    for (let i = 0; i < placement.placementIndexes.length; i++) {
      const idx = placement.placementIndexes[i];
      this.board.cells[idx].resource = null;
      this.board.cells[idx].building = null;
    }
    this.board.cells[position].building = placement.card;
    this.board.cells[position].resource = null;

    if (placement.card.special) {
      this.special.addSpecial(placement.card.special, { cell: position });
    }
    this._refresh();
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
                resourceIndexes: resourceIndexes,
                placementIndexes: resourceIndexes.slice(),
              };
              if (card.anywhere || this.score.scratch.anywhere) {
                this.board.cells.forEach((cell, i) => {
                  if (!cell.building && !cell.resource) {
                    placement.placementIndexes.push(i);
                  }
                });
              }
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
}
