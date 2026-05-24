import ShipGame from '../shipgame.js';
import BotA from '../bota.js';

class TestBotA {
  testPlaceRandomShips() {
    let game, bot, code;
    for (let i = 0; i < 100; i++) {
      game = new ShipGame();
      bot = new BotA(game, 0);
      bot.placeShips();
      code = game.boards[0]._boardCode();
      //runner.log(code);
      runner.isTrue(code.includes('a'));
      runner.isTrue(code.includes('b'));
      runner.isTrue(code.includes('c'));
      runner.isTrue(code.includes('d'));
      runner.isTrue(code.includes('e'));
    }
  }
}

runner.runClass(new TestBotA());
