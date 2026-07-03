class TestDummy {
  testSimple() {
    if (1 + 1 !== 2) throw new Error('math failed');
    return true;
  }

  test2() {
    return true;
  }

  test3() {
    return true;
  }

  testLog() {
    runner.log('logged message 1');
    runner.log('logged message 2');
    return true;
  }
}

runner.runClass(new TestDummy());
