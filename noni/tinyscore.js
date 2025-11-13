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
    this.scratch = {
      penalty: -1,
    };
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

    this.penalty = this.scratch.penalty * this._countCells(cell => !cell.building);

    this.categories.gray = this._findBuildingsByCategory('gray').length * 2;

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
    //console.log(`sss score: ${JSON.stringify(debug)}`);
  }

  _findAdjacent(cellIndex) {
    let adjacent = [];
    this._findBuildings(b => {
      return (
        Math.abs(b.index % 4 - cellIndex % 4) + Math.abs(Math.floor(b.index / 4) - Math.floor(cellIndex / 4)) === 1
      );
    }).forEach(b => {
      console.log(`aaa a${b.index}`);
      adjacent.push(b);
    });
    return adjacent;
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

    let score2 = this.score_automatic(card, params);
    if (score2 != null) {
      return score2;
    }
  }

  score_farm(card, params) {
    if (params.prescan) {
      let farms = this._findBuildingsByCategory('red').length;
      this.scratch.canFeed = farms * 4;
      this.scratch.fed = Math.min(this.scratch.canFeed || 0, this.scratch.feedable || 0);
      return;
    }
    this.categories.red = 0;
  }

  score_cott(card, params) {
    if (params.prescan) {
      let count = this._findBuildingsByCategory(card.category).length;
      this.scratch.feedable = count;
      this.scratch.fed = Math.min(this.scratch.canFeed || 0, this.scratch.feedable || 0);
      return;
    }
    let points = this.scratch.fed * card.score.points;
    return points;
  }

  score_black(card, params) {
//    console.log(`xxx black ${card.short} ${JSON.stringify(params)}`);
  }

  score_thtr(card) {
      let theaters = this._findBuildingsByCategory(card.category);
      let points = 0;
      theaters.forEach(theater => {
        let sameRowCol = this._findBuildings(b => {
            return (b.index % 4 === theater.index % 4 || Math.floor(b.index / 4) === Math.floor(theater.index / 4)) && b.index !== theater.index
        });
        let set = new Set(sameRowCol.map(item => item.category));
        points += set.size;
      });
      return points;
  }

  score_tlor(card) {
    let count = 0;
    let centerCount = 0;
    this.tiny.board.cells.forEach(cell => {
      if (cell.building && cell.building.category === 'yellow') {
        count++;
        if (cell.index === 5 || cell.index === 6 || cell.index === 9 || cell.index === 10) {
          centerCount++;
        }
      }
    });
    let points = count * (1 + centerCount);
    return points;
  }

  score_well(card) {
    let grays = this._findBuildingsByCategory(card.category);
    let points = 0;
    grays.forEach(gray => {
      let adjacent = this._findAdjacent(gray.index);
      points += adjacent.length;
    });
    return points;
  }

  score_automatic(card, params) {
    if (params.prescan) {
      return;
    }
    let count = this._findBuildingsByCategory(card.category).length;
    let points = (card.score.points || 0) * count;

    if (count) {
      if (card.score.scratch) {
        Object.assign(this.scratch, card.score.scratch);
      }
    }
    return points;
  }

}