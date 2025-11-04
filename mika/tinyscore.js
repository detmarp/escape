export default class TinyScore {
  constructor(tiny) {
    this.tiny = tiny;
    this._clear();
  }

  _clear() {
    this.penalty = 0;
    this.rawScore = 0;
    this.displayScore = 0;
    this.finalScore = 0;
    this.categories = {};
    this.scratch = {};
  }

  calculate() {
    this._clear();

    // Prescan
    this.tiny.hand.cards.forEach(card => {
      if (card.score.prescan) {
        this._tryScoreCard(card, { prescan: true });
      }
    });

    this.tiny.hand.cards.forEach(card => {
      let params = {};
      let score = this._tryScoreCard(card, params);
      this.categories[card.category] = score ?? 0;
    });

    this.penalty = -1 * this._countCells(cell => !cell.building);

    let blueCount = this._findBuildingsByCategory('blue').length;
    let fedCount = Math.min(this.scratch.canFeed, blueCount);
    this.categories.blue = 3 * fedCount;

    this.categories.pink = 1 * this._findBuildingsByCategory('pink').length;

    this.categories.black = 0;

    this.categories.orange = this._findBuildingsByCategory('orange').length * fedCount;

    this.categories.gray = this._findBuildingsByCategory('gray').length * 2;

    this.categories.yellow = 0;
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
      this.categories.yellow += 1 * unique.size;
    });

    let greenCount = this._findBuildingsByCategory('green').length;
    const greenTable = [2, 5, 9, 14, 20];
    this.categories.green = greenTable[Math.min(greenCount, greenTable.length) - 1] || 0;

    this.categories.gray = 0;
    this._findBuildingsByCategory('gray').forEach(gray => {
      // find adjacent blue
      this.categories.gray += 1 * this._findBuildings(b => {
        return (
          Math.abs(b.x - gray.x) + Math.abs(b.y - gray.y) === 1 &&
          b.category === 'blue'
        )}).length;
    });

    this.rawScore = Object.values(this.categories).reduce((sum, val) => sum + val, 0);
    this.finalScore = this.rawScore + this.penalty;
    this.displayScore = this.tiny.gameOver ? this.finalScore : this.rawScore;

    let debug = {
      rawScore: this.rawScore,
      penalty: this.penalty,
      finalScore: this.finalScore,
      displayScore: this.displayScore,
      categories: this.categories,
      scratch: this.scratch,
    };
    console.log(`sss: ${JSON.stringify(debug)}`);
  }

  _findBuildings(predicate) {
    let buildings = [];
    this.tiny.board.cells.forEach(cell => {
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
    this.tiny.board.cells.forEach(cell => {
      if (predicate(cell)) {
        count++;
      }
    });
    return count;
  }

  _tryScoreCard(card, params = {}) {
    let methodName = `score_${card.short}`;
    if (typeof this[methodName] === 'function') {
      let score = this[methodName](card, params);
      if (score != null) {
        return score;
      }
    }
    methodName = `score_${card.category}`;
    if (typeof this[methodName] === 'function') {
      let score = this[methodName](card, params);
      if (score != null) {
        return score;
      }
    }
  }

  score_farm(card, params) {
    if (params.prescan) {
      this.scratch.canFeed = this._findBuildingsByCategory('red').length * 4;
      return;
    }
    this.categories.red = 0;
  }

  score_black(card, params) {
    console.log(`xxx black ${card.short} ${JSON.stringify(params)}`);
  }

}