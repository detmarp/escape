import ShipGame from '../shipgame.js';

class TestSerializeGame {
  testA() {
    const game = new ShipGame({
      rules: {
        allowAdjacent: true,
        continueAfterHit: false,
      },
    });

    const obj = game.toObject();
    const loaded = ShipGame.fromObject(obj);

  }
}

runner.runClass(new TestSerializeGame());
