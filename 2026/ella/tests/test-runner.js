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
      if (result !== true) {
        throw new Error('expected true return');
      }
      this.functionsPassed += 1;
      this.log(`v ${name}`);
    } catch (e) {
      this.functionsFailed += 1;
      this.log(`x ${name}: ${e.message}`);
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

  results() {
    const summary = `Files: ${this.files}, Passed: ${this.functionsPassed}, Failed: ${this.functionsFailed}`;
    this.log(summary);
    return summary;
  }
}

const runner = new TestRunner();
window.runner = runner;
