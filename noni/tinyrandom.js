export default class TinyRandom {
  constructor(seed) {
    seed = seed ?? Math.floor(Math.random() * 0x100000000);
    this.randomSeed = seed >>> 0;
  }

  random(range) {
    if (range <= 0) return 0;
    this.randomSeed = ((this.randomSeed * 1664525 + 1013904223) >>> 0);
    const frac = this.randomSeed / 0x100000000;
    return Math.floor(frac * range);
  }

  shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.random(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  choose(list) {
    if (list.length === 0) return null;
    const index = this.random(list.length);
    return list[index];
  }

  sample(list, count) {
    const shuffled = this.shuffle([...list]);
    return shuffled.slice(0, Math.min(count, list.length));
  }
}
