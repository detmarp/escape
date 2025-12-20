/* Paxi is the logical container of the game.
*/
export default class Paxi {
  constructor(hanoi, delegate) {
    this.hanoi = hanoi;
    this.delegate = delegate;
  }

  work() {
  }

  onNewGame() {
    this.delegate.onRestart();
  }
}