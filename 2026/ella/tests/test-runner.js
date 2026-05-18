class TestRunner {
  constructor({ sink } = {}) {
    this.files = 0;
    this.functionsPassed = 0;
    this.functionsFailed = 0;
    this.setSink(sink);
  }

  setSink(sink) {
    this.sink = typeof sink === 'function' ? sink : null;
  }

  test(name, fn) {
    this.log(`o ${name}`);
    try {
      const result = fn();
      if (result === false) {
        throw new Error('explicit false return');
      }
      this.functionsPassed += 1;
      this.log(`v ${name}`);
    } catch (e) {
      this.functionsFailed += 1;
      this.log(`x ${name}: ${e.stack}`);
    }
    this.log('');
  }

  log(text) {
    if (this.sink) {
      this.sink(text);
    }
  }

  runClass(testClass) {
    this.files += 1;
    this.log(`> ${testClass.constructor.name}`);
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(testClass))) {
      if (key.startsWith('test')) {
        this.test(key, () => testClass[key]());
      }
    }
    this.log('');
  }

  equals(a, b) {
    let got = `Got:  ${JSON.stringify(a)}`;
    let want = `Want: ${JSON.stringify(b)}`;
    if (typeof a !== typeof b) throw new Error(`equals: type mismatch\n${got}\n${want}`);
    if (a === b) return true;
    if (a == null || b == null) throw new Error(`equals: null mismatch\n${got}\n${want}`);
    throw new Error(`equals: unsupported type or value mismatch\n${got}\n${want}`);
  }

  results() {
    const summary = `Files: ${this.files}, Passed: ${this.functionsPassed}, Failed: ${this.functionsFailed}`;
    this.log(summary);
    return summary;
  }
}

const runner = new TestRunner();
window.runner = runner;
