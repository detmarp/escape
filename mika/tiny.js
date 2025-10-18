export default class Tiny {
  constructor() {
    this.gameSeed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  }

  static fromObject(obj = {}) {
    const instance = new Tiny();
    if (obj && typeof obj.gameSeed !== 'undefined' && obj.gameSeed !== null) {
      if (typeof obj.gameSeed === 'number') {
        instance.gameSeed = obj.gameSeed;
      } else if (typeof obj.gameSeed === 'string' && /^\d+$/.test(obj.gameSeed)) {
        instance.gameSeed = parseInt(obj.gameSeed, 10);
      }
    }
    return instance;
  }

  toObject() {
    return {
      gameSeed: this.gameSeed,
    };
  }
}