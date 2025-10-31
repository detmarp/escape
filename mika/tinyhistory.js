import Tiny from './tiny.js';

export default class TinyHistory {
  constructor(history) {
    // history is array of entries
    this.history = history;
  }

  _normalize() {
    this.history = this.history || [];
  }

  findDaily(count = 15) {
    // Extract daily games, return list of entries
    return [
      { one: 1,
        two: 2 },
      { three: 3,
        four: 4 },
    ];
  }

  tinyFromSeed(seed) {
    // Return latest in-progress game with this seed, or create new
    return new Tiny();
  }

  tinyFromTimestamp(timeStamp) {
    // Return Tiny from this timestamp entry, or null if not found
  }

  tinyFromObject(entry) {
    // Return Tiny from this entry, even if gameOver
  }

  getCurrent() {
    // Return latest in-progress game, or null
  }

  addGame(tiny) {
    // Add new game to history, return array
  }

}