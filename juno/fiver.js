import FiverState from './fiverstate.js';

export default class Fiver {
  constructor() {
    this.state = new FiverState();
    this.state.mode = this.state.modes.PRE_ROLL
  }

  canRoll() {
    return !this.state.isGameOver() && this.state.roll < 3;
  }

  doRoll() {
    if (!this.canRoll()) {
      return;
    }
    this.state.mode = this.state.modes.TRANSITION;
    for (let i = 0; i < 5; i++) {
      if (!this.state.hold || !this.state.hold[i]) {
        this.state.dice[i] = 1 + Math.floor(Math.random() * 6);
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
    }
  }

  doHolds(holds) {
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
    if (this.state.turn < 13) {
      this.doTrend();
      this.state.mode = this.state.modes.PRE_ROLL
    }
    else {
      this.state.mode = this.state.modes.GAME_OVER;
    }
  }

  _finishRoll() {
    this.state.roll++;
    if (this.state.roll >= 3) {
      this.state.mode = this.state.modes.TAKE_POINTS;
    } else {
      this.state.mode = this.state.modes.ROLL_READY;
    }
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
        if (
          (dice.includes(1) && dice.includes(2) && dice.includes(3) && dice.includes(4)) ||
          (dice.includes(2) && dice.includes(3) && dice.includes(4) && dice.includes(5)) ||
          (dice.includes(3) && dice.includes(4) && dice.includes(5) && dice.includes(6))
        ) return 30;
        return 0;
      case 10: // Large straight (sequence of 5)
        if (
          dice.slice().sort().join(',') === '1,2,3,4,5' ||
          dice.slice().sort().join(',') === '2,3,4,5,6'
        ) return 40;
        return 0;
      case 11: // Yahtzee (five of a kind)
        if (dice.every(d => d === dice[0])) return 50;
        return 0;
      case 12: // Chance (sum of all dice)
        return dice.reduce((a, b) => a + b, 0);
      default:
        return null;
    }
  }
}
