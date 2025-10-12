import FiverState from './fiverstate.js';

export default class Fiver {
  constructor() {
    this.state = new FiverState();
    this.state.mode = this.state.modes.PRE_ROLL

    this.debug = {
      // Debug stuff
      //mostlySixes: true,
      //shortGame: 3,
    };
  }

  canRoll() {
    return !this.canAccept() && !this.state.isGameOver() && this.state.roll < 3;
  }

  canAccept() {
    // Accept is allowed if:
    // - Game is underway (not over)
    // - Either mode is TAKE_POINTS
    // - Or mode is ROLL_READY and all dice are held
    if (this.state.mode === this.state.modes.TAKE_POINTS) return true;
    if (
      this.state.mode === this.state.modes.ROLL_READY &&
      Array.isArray(this.state.hold) &&
      this.state.hold.length === 5 &&
      this.state.hold.every(h => h === true)
    ) {
      return true;
    }
    return false;
  }

  _getDie() {
    // roll one die
    if (this.debug.mostlySixes && Math.random() < 0.5) {
      return 6;
    }

    return 1 + Math.floor(Math.random() * 6);
  }

  doRoll() {
    if (!this.canRoll()) {
      return;
    }
    this.state.mode = this.state.modes.TRANSITION;
    for (let i = 0; i < 5; i++) {
      if (!this.state.hold || !this.state.hold[i]) {
        this.state.dice[i] = this._getDie();
      }
    }
    this._finishRoll();
  }

  doPreviews() {
    for (let i = 0; i < this.state.lines.length; i++) {
      this.state.preview[i] = this._previewLine(i, this.state.dice);
    }
  }

  doSelect(line) {
    if (this.state.isCanSelect()) {
      this.state.selectedLine = line;
      this._chooseHolds(false);
    }
  }

  doHolds(holds) {
    for (let i = 0; i < 5; i++) {
      this.state.hold[i] = !!holds[i];
    }
  }

  doTrend() {
    // For the first 6 lines (dice value lines)
    let allNull = true;
    let sum = 0;
    let trend = null;
    for (let i = 0; i < 6; i++) {
      const val = this.state.lines[i];
      if (val != null) {
        allNull = false;
        sum += (val - (i + 1) * 3);
      }
    }
    if (!allNull) {
      trend = sum;
    }
    this.state.trend = trend;
  }

  doAutoSelect() {
    let max = -Infinity;
    let selected = null;
    for (let i = 0; i < this.state.preview.length; i++) {
      const val = this.state.preview[i];
      if (typeof val === 'number' && val > max) {
        max = val;
        selected = i;
      }
    }
    this.state.selectedLine = selected;
  }

  doAccept() {
    const selected = this.state.selectedLine;
    if (selected === null || this.state.lines[selected] !== null) {
      return;
    }

    this.state.mode = this.state.modes.TRANSITION;
    this.state.lines[selected] = this.state.preview[selected];
    // Yahtzee bonus
    // Only add 100 if slot 11 (Yahtzee) is already filled and this is a new Yahtzee going to another slot
    const isYahtzee = this.state.dice.every(d => d === this.state.dice[0]);
    if (selected !== 11 && isYahtzee && this.state.lines[11] !== null) {
      this.state.fiverBonus = (this.state.fiverBonus || 0) + 100;
    }
    // Upper bonus
    const upperSum = [0, 1, 2, 3, 4, 5].map(i => this.state.lines[i] || 0).reduce((a, b) => a + b, 0);
    if (upperSum >= 63 && !this.state.upperBonus) {
      this.state.upperBonus = 35;
    }

    // Calculate upper total (lines 0-5)
    this.state.upperTotal = [0, 1, 2, 3, 4, 5].map(i => this.state.lines[i] || 0).reduce((a, b) => a + b, 0);

    // Calculate lower total (lines 6-12)
    this.state.lowerTotal = [6, 7, 8, 9, 10, 11, 12].map(i => this.state.lines[i] || 0).reduce((a, b) => a + b, 0);

    // Calculate grand total
    this.state.grandTotal =
      this.state.upperTotal +
      (this.state.upperBonus || 0) +
      this.state.lowerTotal +
      (this.state.fiverBonus || 0);

    // reset for next roll
    this.state.roll = 0;
    this.state.selectedLine = null;
    this.state.preview = Array(Object.keys(this.state.categories).length).fill(null);
    this.state.hold = [false, false, false, false, false];
    this.state.dice = [null, null, null, null, null];
    this.state.turn++;

    // game over, or next roll
    let maxTurns = this.debug.shortGame || 13;
    if (this.state.turn <= maxTurns) {
      this.doTrend();
      this.state.mode = this.state.modes.PRE_ROLL;
    }
    else {
      this.state.mode = this.state.modes.GAME_OVER;
    }
  }

  _chooseHolds(refresh) {
    // set which dice to hold, based on the selection.
    // refresh: recalculate assuming a new roll just happened
    if (this.state.selectedLine === null) {
      return;
    }

    if (this.state.selectedLine <= 5) {
      // Upper section: hold dice matching the number
      const val = this.state.selectedLine + 1;
      for (let i = 0; i < 5; i++) {
        this.state.hold[i] = (this.state.dice[i] === val);
      }
    }
    else if (
      this.state.selectedLine === this.state.categories.THREE_OF_A_KIND ||
      this.state.selectedLine === this.state.categories.FOUR_OF_A_KIND ||
      this.state.selectedLine === this.state.categories.FIVER
    ) {
      // Many of a kind
      // Hold the value that has the most counts
      const counts = Array(7).fill(0);
      for (let i = 0; i < 5; i++) {
        const val = this.state.dice[i];
        if (val !== null && val !== undefined) {
          counts[val]++;
        }
      }
      // Find the value with the highest count, prefer higher value in case of tie
      let maxCount = 0;
      let bestValue = 0;
      for (let v = 1; v <= 6; v++) {
        if (counts[v] > maxCount || (counts[v] === maxCount && v > bestValue)) {
          maxCount = counts[v];
          bestValue = v;
        }
      }
      for (let i = 0; i < 5; i++) {
        this.state.hold[i] = (this.state.dice[i] === bestValue);
      }
    }
    else if (this.state.selectedLine === this.state.categories.FULL_HOUSE) {
      // Full house: find all pairs, triples, etc.
      const counts = Array(7).fill(0);
      for (let i = 0; i < 5; i++) {
        const val = this.state.dice[i];
        if (val !== null && val !== undefined) {
          counts[val]++;
        }
      }
      const pairs = [];
      for (let v = 1; v <= 6; v++) {
        if (counts[v] >= 2) {
          // Collect indexes of dice with this value
          const idxs = [];
          for (let i = 0; i < 5; i++) {
            if (this.state.dice[i] === v) {
              idxs.push(i);
            }
          }
          idxs.length = Math.min(idxs.length, 3);
          pairs.push(idxs);
        }
      }
      // pairs is now an array of arrays of dice indexes for each pair/triple/etc.
      for (let i = 0; i < 5; i++) {
        this.state.hold[i] = pairs.some(pair => pair.includes(i));
      }
    }
    else if (this.state.selectedLine === this.state.categories.SMALL_STRAIGHT ||
             this.state.selectedLine === this.state.categories.LARGE_STRAIGHT) {
      // Straight
      let straight = this._findStraight(this.state.dice);
      const hold = [false, false, false, false, false];
      if (straight[0] >= 2) {
        // Hold the dice that are part of the max straight
        // Not an optimal selection, but good enough for now
        let map = this._diceMap(this.state.dice);
        for (let offset = 0; offset < straight[0]; offset++) {
          const pip = straight[1] + offset;
          if (map[pip] !== undefined) {
            hold[map[pip]] = true;
          }
        }
      }
      this.doHolds(hold);
    }
    else if (this.state.selectedLine === this.state.categories.CHANCE) {
      // Chance
      for (let i = 0; i < 5; i++) {
        this.state.hold[i] = (this.state.dice[i] >= 5);
      }
    }
  }


  _finishRoll() {
    this.state.roll++;
    this._chooseHolds(true);
    if (this.state.roll >= 3) {
      this.state.mode = this.state.modes.TAKE_POINTS;
    } else {
      this.state.mode = this.state.modes.ROLL_READY;
    }
    const straightInfo = this._findStraight(this.state.dice);
  }

  _previewLine(line, dice) {
    if (!dice.every(d => d !== null && d !== undefined)) {
      return null;
    }
    if (this.state.lines[line] !== null && this.state.lines[line] !== undefined) {
      return null;
    }
    // Basic Yahtzee rules
    switch (line) {
      case 0: case 1: case 2: case 3: case 4: case 5:
        // Sum of dice showing (line+1)
        return dice.filter(d => d === line + 1).reduce((sum, d) => sum + d, 0);
      case 6: // Three of a kind
        for (let v = 1; v <= 6; v++) {
          if (dice.filter(d => d === v).length >= 3) return dice.reduce((a, b) => a + b, 0);
        }
        return 0;
      case 7: // Four of a kind
        for (let v = 1; v <= 6; v++) {
          if (dice.filter(d => d === v).length >= 4) return dice.reduce((a, b) => a + b, 0);
        }
        return 0;
      case 8: // Full house (3 of one, 2 of another)
        const counts = Array(7).fill(0);
        dice.forEach(d => counts[d]++);
        if (counts.includes(3) && counts.includes(2)) return 25;
        return 0;
      case 9: // Small straight (sequence of 4)
        let straight4 = this._findStraight(dice);
        return (straight4[0] >= 4) ? 30 : 0;
      case 10: // Large straight (sequence of 5)
        let straight5 = this._findStraight(dice);
        return (straight5[0] >= 5) ? 40 : 0;
      case 11: // Yahtzee (five of a kind)
        if (dice.every(d => d === dice[0])) return 50;
        return 0;
      case 12: // Chance (sum of all dice)
        return dice.reduce((a, b) => a + b, 0);
      default:
        return null;
    }
  }

  _diceMap(dice) {
    // return a map [pip: index]
    // where for each pip in dice[], the index is the first index where that pip occurs
    const map = [];
    dice.forEach((pip, index) => {
      if (!(pip in map)) {
        map[pip] = index;
      }
    });
    return map;
  }

  _findStraight(dice) {
    // returns [length, startValue]
    // where dice is array of dice values (integers, but in our case, always 5 values from 1 to 6)
    let map = this._diceMap(dice);
    let bestLength = 0;
    let bestStart = null;
    map.forEach((index, pip) => {
      let length = 1;
      for (let next = pip + 1; next in map; next++) {
        length++;
      }
      if (length > bestLength) {
        bestLength = length;
        bestStart = pip;
      }
    });
    return [bestLength, bestStart];
  }

  toObject() {
    return {
      turn: this.state.turn,
      roll: this.state.roll,
      dice: this.state.dice,
      lines: this.state.lines,
      grandTotal: this.state.grandTotal,
      isGameOver: this.state.isGameOver(),
    };
  }
}
