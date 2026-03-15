// building a yahtzee game,
// called fiver.  see fiverhelper for a command sort of setup.
// write me a full fiver game, but only a concise headless version.
// the owner can examine state, with getState() that yields a object of the current game state.
// this class has no concept of UX, is single game, single player.
// it does not, for example, know which dice the player is "keeping". it just sijply knows the rules of fiver (yahtzee)
// it's ok for the actions returned by command to include helper actions, like {action:roll, dice:[0,1,4]}, then follwed by {action"dice", values:[1,1,3,6,2]}
export default class Fiver {
  constructor(params = {}) {
    this._setRules(params.rules);
    this.reset();
  }

  _setRules(rules = {}) {
    this.rules = {
      maxRolls: 3,
      ...rules
    };
  }

  reset() {
    this.dice = [undefined, undefined, undefined, undefined, undefined];
    this.roll = 0;
    this.scores = {
      ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
      threeofkind: null, fourofkind: null, fullhouse: null, smallstraight: null,
      largestraight: null, yahtzee: null, chance: null
    };
    this.turn = 1;
    this.gameOver = false;
    this.totalScore = 0;
  }

  *command(str) {
    console.log(`ccc Fiver command received: ${str}`);
    const parts = str.trim().split(' ');
    const action = parts[0].toLowerCase();

    switch (action) {
      case 'roll':
        yield* this._processRoll(parts.slice(1));
        break;
      case 'score':
        yield* this._processScore(parts[1]);
        break;
      case 'reset':
        this.reset();
        yield { action: 'reset', value: null };
        yield { action: 'state', value: this.getState() };
        break;

      default:
        yield* this._error(`Unknown command: ${action}`);
    }
  }

  *_error(message) {
    yield { action: 'error', value: message };
  }

  *_processRoll(diceToRoll) {
    if (this.rules.maxRolls > 0 && this.roll >= this.rules.maxRolls) {
      yield* this._error('No rolls remaining');
      return;
    }

    // Determine which dice to roll
    let rollDice;
    if (diceToRoll.length === 0) {
      // Roll all dice
      rollDice = [0, 1, 2, 3, 4];
    } else {
      rollDice = diceToRoll.map(d => parseInt(d)).filter(d => d >= 0 && d <= 4);
    }

    yield { action: 'roll', dice: rollDice };

    // Roll the specified dice
    for (let i of rollDice) {
      this.dice[i] = Math.floor(Math.random() * 6) + 1;
    }

    this.roll++;
    yield { action: 'dice', values: [...this.dice] };
    yield { action: 'roll', value: this.roll };
  }

  *_processScore(category) {
    if (!category) {
      yield* this._error('No category specified');
      return;
    }

    const cat = category.toLowerCase();
    if (!(cat in this.scores)) {
      yield* this._error(`Invalid category: ${category}`);
      return;
    }

    if (this.scores[cat] !== null) {
      yield* this._error(`Category ${category} already scored`);
      return;
    }

    const score = this._calculateScore(cat);
    this.scores[cat] = score;
    this.totalScore += score;

    yield { action: 'scored', category: cat, value: score };

    // Start next turn
    this.roll = 0;
    this.turn++;

    // Check if game is over
    if (Object.values(this.scores).every(s => s !== null)) {
      this.gameOver = true;
      yield { action: 'gameOver', finalScore: this.totalScore };
    } else {
      yield { action: 'nextTurn', turn: this.turn };
    }
  }

  _calculateScore(category) {
    const counts = new Array(7).fill(0);
    for (let die of this.dice) {
      counts[die]++;
    }

    switch (category) {
      case 'ones': return counts[1] * 1;
      case 'twos': return counts[2] * 2;
      case 'threes': return counts[3] * 3;
      case 'fours': return counts[4] * 4;
      case 'fives': return counts[5] * 5;
      case 'sixes': return counts[6] * 6;

      case 'threeofkind':
        return counts.some(c => c >= 3) ? this.dice.reduce((a, b) => a + b, 0) : 0;

      case 'fourofkind':
        return counts.some(c => c >= 4) ? this.dice.reduce((a, b) => a + b, 0) : 0;

      case 'fullhouse':
        const hasThree = counts.some(c => c === 3);
        const hasTwo = counts.some(c => c === 2);
        return (hasThree && hasTwo) ? 25 : 0;

      case 'smallstraight':
        const sorted = [...new Set(this.dice)].sort();
        for (let i = 0; i <= sorted.length - 4; i++) {
          if (sorted[i + 1] === sorted[i] + 1 &&
              sorted[i + 2] === sorted[i] + 2 &&
              sorted[i + 3] === sorted[i] + 3) {
            return 30;
          }
        }
        return 0;

      case 'largestraight':
        const sortedLarge = [...new Set(this.dice)].sort();
        return (sortedLarge.length === 5 &&
                sortedLarge[4] - sortedLarge[0] === 4) ? 40 : 0;

      case 'yahtzee':
        return counts.some(c => c === 5) ? 50 : 0;

      case 'chance':
        return this.dice.reduce((a, b) => a + b, 0);

      default:
        return 0;
    }
  }

  getState() {
    return {
      dice: [...this.dice],
      roll: this.roll,
      scores: { ...this.scores },
      turn: this.turn,
      gameOver: this.gameOver,
      totalScore: this.totalScore
    };
  }
}
