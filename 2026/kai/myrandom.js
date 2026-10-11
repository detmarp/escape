export default class MyRandom {
  constructor(seed) {
    seed ??= Date.now()
    this.seed = Math.floor(Math.abs(seed));
  }

  next(n) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor(this.seed / 233280 * n);
  }

  shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = this.next(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
}
