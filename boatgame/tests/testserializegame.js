import ShipGame from '../shipgame.js';
import ShipBoard from '../shipboard.js';

class TestSerializeGame {
  ships1 = [
    { size: 5, offset: 0, vertical: true },
    { size: 4, offset: 2, vertical: true },
    { size: 3, offset: 4, vertical: true },
    { size: 2, offset: 6, vertical: true },
  ];
  ships2 = [
    { size: 5, offset: 0 },
    { size: 4, offset: 20},
    { size: 3, offset: 40},
    { size: 2, offset: 60},
  ];
  shots1 = [ 0, 1, 2, 3, 4, 10, 11, 12 ];
  code1 = 'A*B*C.d...A*B.c.d...a.b.c.....a.b.......a...........................................................';
  code2 = 'aaaaa...............bbbb................ccc.................dd......................................';

  testSimpleBoard0() {
    const a1 = ShipBoard.fromObject({
      ships: this.ships1,
      shots: this.shots1,
    });
    runner.equals(a1._boardCode(), this.code1);

    const a2 = ShipBoard.fromObject({
      ships: this.ships2,
    });
    runner.equals(a2._boardCode(), this.code2);
  }

  testWholeGame1() {
    const saved1 = {
      boards: [
        {
          ships: this.ships1,
          shots: this.shots1,
        },
        {
          ships: this.ships2,
        },
      ]
    };
    const a1 = ShipGame.fromObject(saved1);
    runner.equals(a1.boards[0]._boardCode(), this.code1);
    runner.equals(a1.boards[1]._boardCode(), this.code2);
  }

  testShooting() {
  }
}

runner.runClass(new TestSerializeGame());
