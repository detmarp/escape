export default class FiverState {
  constructor() {
    this.score = 0;
    this.isOver = false;
    this.turn = 1;
    this.roll = 0;  // counts rolls already happened, 0 - 3
    this.dice = [ null, null, null, null, null ];
    this.hold = [ false, false, false, false, false ];
    this.categories = {
      ONES: 0,
      TWOS: 1,
      THREES: 2,
      FOURS: 3,
      FIVES: 4,
      SIXES: 5,
      THREE_OF_A_KIND: 6,
      FOUR_OF_A_KIND: 7,
      FULL_HOUSE: 8,
      SMALL_STRAIGHT: 9,
      LARGE_STRAIGHT: 10,
      FIVER: 11,
      CHANCE: 12,
    };
    this.modes = {
      PRE_ROLL: 0,
      ROLL_READY: 1,
      TRANSITION: 2,
      TAKE_POINTS: 3,
      GAME_OVER: 4,
    };
    this.lines = Array(Object.keys(this.categories).length).fill(null);
    this.preview = Array(Object.keys(this.categories).length).fill(null);
    this.selectedLine = null;
    this.mode = this.modes.PRE_ROLL;
    this.upperBonus = 0;
    this.upperTotal = 0;
    this.fiverBonus = 0;
    this.lowerTotal = 0;
    this.grandTotal = 0;
  }

  isGameOver() {
    return this.mode === this.modes.GAME_OVER;
  }

  isCanSelect() {
    return this.mode === this.modes.ROLL_READY || this.mode === this.modes.TAKE_POINTS;
  }
}
