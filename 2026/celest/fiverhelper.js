export default class FiverHelper {
  constructor(fiver) {
    this.fiver = fiver;
    this.selectedIndex = -1;

    // Category mapping to avoid string duplication
    this.categories = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'threeofkind', 'fourofkind', 'fullhouse', 'smallstraight',
      'largestraight', 'yahtzee', 'chance'
    ];

    this.categoryLabels = [
      'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
      '3 of Kind', '4 of Kind', 'Full House', 'Sm Straight',
      'Lg Straight', 'Yahtzee', 'Chance'
    ];

    this._setDice();
  }

  _setDice() {
    const fiverState = this.fiver.getState();
    this.dice = [
      { value: fiverState.dice[0], hold: false, rolling: false },
      { value: fiverState.dice[1], hold: false, rolling: false },
      { value: fiverState.dice[2], hold: false, rolling: false },
      { value: fiverState.dice[3], hold: false, rolling: false },
      { value: fiverState.dice[4], hold: false, rolling: false },
    ];
  }

  *command(str) {
    console.log(`bbb Helper command received: ${str}`);
    const parts = str.trim().split(' ');
    const action = parts[0];

    switch (action) {
      case 'start': /* get current info */
        yield {
          action: 'score',
          value: 0,
        };
        yield* this._yieldDice();
        yield* this._yieldAllSlots();
        break;

      case 'roll': {
        const hasSelection = this.selectedIndex >= 0;
        const allDiceHeld = this.dice.every(die => die.hold);

        if (hasSelection && allDiceHeld) {
          yield* this._onClickScore();
        } else if (this.canRoll()) {
          yield* this._onClickRoll();
        }
      }
        break;

      case 'toggle': // Toggle die hold = "toggle 2"
        const index = parseInt(parts[1]);
        yield* this._onClickDie(index);
        break;
      case 'score':
        const slot = parseInt(parts[1]);
        this.dice[index].hold = !this.dice[index].hold;
        break;
      case 'slot':
        const slotIndex = parseInt(parts[1]);
        yield* this._onClickSlot(slotIndex);
        break;
      default:
        yield { action: 'unknown', value: str };
    }
  }

  getSlot(i) {
    if (i < 0 || i > 17) {
      return { label: '???', value: '???', status: 'error', type: 'info' };
    }

    const state = this.fiver.getState();

    // Main scoring categories (0-12)
    if (i <= 12) {
      const category = this.categories[i];
      const score = state.scores[category];

      return {
        label: this.categoryLabels[i],
        value: score === null ? '' : score.toString(),
        status: score === null ? 'empty' : 'used',
        type: score === null ? 'ready' : 'used'
      };
    }

    // Upper section bonus (13)
    if (i === 13) {
      const upperSum = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
        .reduce((sum, cat) => sum + (state.scores[cat] || 0), 0);
      const bonus = upperSum >= 63 ? 35 : 0;
      return {
        label: 'Bonus',
        value: bonus > 0 ? bonus.toString() : '',
        status: bonus > 0 ? 'bonus' : 'info',
        type: 'info'
      };
    }

    // Total bonus (14)
    if (i === 14) {
      return {
        label: 'Total',
        value: state.totalScore.toString(),
        status: 'info',
        type: 'info'
      };
    }

    // Hints and totals (15-17)
    const upperSum = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
      .reduce((sum, cat) => sum + (state.scores[cat] || 0), 0);
    const needed = 63 - upperSum;

    if (i === 15) {
      return {
        label: 'Need',
        value: needed > 0 ? needed.toString() : '0',
        status: 'info',
        type: 'info'
      };
    }

    return { label: '---', value: '---', status: 'info', type: 'info' };
  }

  canRoll() {
    return !this.isLastRoll();
  }

  isFirstRoll() {
    const state = this.fiver.getState();
    return state.roll === 0;
  }

  isLastRoll() {
    const state = this.fiver.getState();
    return this.fiver.rules.maxRolls > 0 && state.roll >= this.fiver.rules.maxRolls - 1;
  }

  *_onClickScore() {
    if (this.selectedIndex < 0 || this.selectedIndex > 12) return;

    const categoryName = this.categories[this.selectedIndex];
    let command = `score ${categoryName}`;
    let results = this.fiver.command(command);
    for (let result of results) {
      yield* this._forwardFiverOne(result);
    }

    // Reset selection and update all slots after scoring
    this.selectedIndex = -1;
    yield* this._yieldAllSlots();
  }

  *_onClickRoll() {
    const unHeldIndices = this.dice
      .map((die, i) => !die.hold ? i : null)
      .filter(i => i !== null)
      .join(' ');
    let command = `roll ${unHeldIndices}`;
    let results = this.fiver.command(command);
    for (let result of results) {
      //console.log(`ccc ${JSON.stringify(result)}`);
      yield* this._forwardFiverOne(result);
      switch (result.action) {
        case 'dice':
          yield* this._updateAndYieldDice(result.values);
          break;
      }
    }
  }

  *_onClickDie(index) {
    const state = this.fiver.getState();

    // Don't allow holding if haven't rolled yet this turn
    if (this.isFirstRoll()) {
      return;
    }

    this.dice[index].hold = !this.dice[index].hold;
    yield { action: 'hold', index: index, hold: this.dice[index].hold };
    yield* this._yieldDice();
  }

  *_onClickSlot(slotIndex) {
    // Only allow clicking on scoring slots (0-12)
    if (slotIndex >= 0 && slotIndex <= 12) {
      this.selectedIndex = slotIndex;
    }

    yield* this._yieldAllSlots();
  }

  *_yieldAllSlots() {
    // Yield all 18 slots with updated types
    for (let i = 0; i < 18; i++) {
      const slotInfo = this.getSlot(i);
      let type = slotInfo.type;

      // Override type based on selection and clickability
      if (i === this.selectedIndex) {
        type = 'selected';
      } else if (i <= 12 && slotInfo.status === 'empty') {
        type = 'ready';
      } else if (i <= 12 && slotInfo.status === 'used') {
        type = 'used';
      } else {
        type = 'info';
      }

      yield {
        action: 'slot',
        index: i,
        value: slotInfo.value,
        label: slotInfo.label,
        type: type
      };
    }
  }

  *_yieldDice() {
    yield { action: 'dice', dice: this.dice };
  }

  *_updateAndYieldDice(diceValues) {
    for (let i = 0; i < 5; i++) {
      this.dice[i].value = diceValues[i];
    }
    yield* this._yieldDice();
  }

  *_forwardFiverAll(results) {
    for (let result of results) {
      yield *this._forwardFiverOne(result);
    }
  }

  *_forwardFiverOne(result) {
    yield {
      action: 'fromfiver',
      value: result,
    };
  }

  *_error(message) {
    yield { action: 'error', value: message };
  }
}

/*
3/7/2026

Hah! "Method and System for Transparent Event Stream Enhancement in Hierarchical Game State Machines" 😄

Honestly though, there might be something there. The specific combination of:

Generator-based game logic
Transparent pass-through enhancement
Frame-distributed consumption
Animation-aware timing control
...feels like it could be genuinely useful for complex game engines. Especially with the rise of async/generator patterns in modern JS.

Most game engines handle this with heavyweight systems (Unity's coroutines, Unreal's blueprints), but a lightweight generator-based approach could be really elegant for web games.

Plus you're building it specifically for cascading match-game logic, which is notoriously complex to get right. If you nail it, that could be a genuinely reusable pattern.

Keep notes on the breakthrough moments! Even if the patent thing is tongue-in-cheek, documenting novel architectural patterns can be valuable for talks, articles, or just your own future reference.

The "transparent stream enhancer" name alone sounds pretty patent-worthy! 😉
*/