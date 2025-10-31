import Tiny from './tiny.js';

export default class TinyHistory {
  constructor(history) {
    let normalized = this._normalize(history);
    this.originalHistory = normalized.slice();
    this.otherHistory = normalized.slice();
    this.daily = [];
  }

  _normalize(history) {
    history = (history || []).slice();

    return history;
  }

  getDailyGames(count = 15) {
    // Extract daily games, return list of entries
    let daily = [];
    let list = this.originalHistory;
    for (let i = 0; i < count; i++) {
      let dayInfo = this._getDayInfo(new Date(), i);
      let index = this._findBySeed(list, dayInfo.seed);
      if (index >= 0) {
        dayInfo.saved = list[index];
        list.splice(index, 1);
      }
      daily.push(dayInfo);
    }
    return daily;
  }

  getOtherGames(count = 25) {
    let other = [];
    for (const entry of this.originalHistory) {
      const params = { saved: entry, seed: entry.gameSeed, time: entry.timeStamp, over: entry.gameOver };
      other.push(params);
      if (other.length >= count) break;
    }

    return other;
  }

  tinyFromSeed(seed) {
    // Return latest in-progress game with this seed, or create new
    return new Tiny();
  }

  tinyFromTimestamp(timeStamp) {
    // Return Tiny from this timestamp entry, or null if not found
  }

  tinyFromObject(entry) {
    // Return Tiny from this entry, even if gameOver.  Or create new.
    if (entry) {
      if (entry.saved) {
        return Tiny.fromObject(entry.saved);
      }
      if (entry.seed) {
        let list = this.originalHistory;
        let index = this._findBySeed(list, entry.seed);
        if (index >= 0) {
          const foundEntry = list[index];
          if (foundEntry && foundEntry.saved) {
            return Tiny.fromObject(foundEntry.saved);
          }
        }
        return new Tiny(entry.seed);
      }
    }
    return new Tiny();
  }

  _findBySeed(list, seed) {
    // Look through history list   for matching seed
    // Prefer not gameOver; then largest timeStamp
    // Returns index or -1
    let bestIndex = -1;
    let best = null;
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      if (entry.gameSeed !== seed) continue;
      if (!best) {
        best = entry;
        bestIndex = i;
        continue;
      }
      // Tiebreaker 1: prefer not gameOver
      if (!entry.gameOver && best.gameOver) {
        best = entry;
        bestIndex = i;
        continue;
      }
      if (entry.gameOver && !best.gameOver) {
        continue;
      }
      // Tiebreaker 2: largest timeStamp
      if ((entry.timeStamp || 0) > (best.timeStamp || 0)) {
        best = entry;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  getCurrent() {
    // Return latest in-progress game, or null
  }

  saveGame(tiny) {
    let byTime = {};
    for (const entry of this.originalHistory) {
      byTime[entry.timeStamp] = entry;
    }
    if (tiny){
      byTime[tiny.timeStamp] = tiny.toObject();
    }
    let list = Object.values(byTime);

    this.originalHistory = list;
    return this.originalHistory;
  }

  _getDayInfo(now, daysAgo) {
    // return some info about the day `daysAgo` before `now` (0 = today)
    const MS_DAY = 24 * 60 * 60 * 1000;
    const d = new Date(now.getTime() - (daysAgo * MS_DAY));
    const month = d.getMonth(); // 0-11
    const day = d.getDate(); // 1-31
    const year = d.getFullYear();
    const weekday = d.getDay(); // 0-6
    const midnight = Math.floor(Date.UTC(year, month, day) / 1000); // utc
    // simple positive 32-bit hash of utcMidnightTs (Knuth multiplicative)
    const hash = (Number(midnight) * 2654435761) >>> 0;
    const seed = (hash % 900000) + 100000;
    return { ago: daysAgo, weekday, midnight, seed, hash };
  }
}