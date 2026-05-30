export default class MyRandom {
  constructor(seed) {
    if (typeof seed !== 'number' || !Number.isInteger(seed)) {
      seed = Date.now() & 0x7fffffff;
    }
    this.seed = seed & 0x7fff;
    this.state = this.seed || 1;
  }

  // Classic 15-bit LCG: X_{n+1} = (a * X_n + c) % m
  // a=1103515245, c=12345, m=2^15
  next() {
    this.state = (this.state * 1103515245 + 12345) & 0x7fff;
    return this.state;
  }

  int(n) {
    if (n < 1) {
      this.next();
      return 0;
    }
    // Multiply-and-shift: unbiased for n <= 32768
    // Math: (next() * n) >>> 15
    return (this.next() * n) >>> 15;
  }

  float() {
    return this.next() / 32768;
  }

  shuffle(list) {
    let arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
