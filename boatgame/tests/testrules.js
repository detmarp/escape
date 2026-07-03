import ShipGame from '../shipgame.js';

class TestRules {
  testShipGameDefaultRules() {
    const game = new ShipGame();

    if (game.rules.allowAdjacent !== false) {
      throw new Error('allowAdjacent default should be false');
    }

    if (game.rules.allowDiagonal !== false) {
      throw new Error('allowDiagonal default should be false');
    }

    if (game.rules.continueAfterHit !== true) {
      throw new Error('continueAfterHit default should be true');
    }

    return true;
  }

  testShipGameRuleOverrideMerge() {
    const game = new ShipGame({
      rules: {
        allowAdjacent: true,
      },
    });

    if (game.rules.allowAdjacent !== true) {
      throw new Error('allowAdjacent override should be true');
    }

    if (game.rules.allowDiagonal !== false) {
      throw new Error('allowDiagonal should keep default false');
    }

    if (game.rules.continueAfterHit !== true) {
      throw new Error('continueAfterHit should keep default true');
    }

    return true;
  }
}

runner.runClass(new TestRules());
