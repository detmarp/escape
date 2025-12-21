/* Paxi is the logical container of the game.
*/
export default class Paxi {
  constructor(hanoi, delegate) {
    this.hanoi = hanoi;
    this.delegate = delegate;
  }

  work() {
  }

  onTap(peg) {
    if (this.selected == null) {
      if (this.hanoi.canSelect(peg)) {
        this.selected = peg;
      } else {
        this.selected = null;
      }
      return;
    }
    if (this.selected === peg) {
      this.selected = null;
      return;
    }
    this.hanoi.doMove(this.selected, peg);
    this.selected = null;

    this.delegate.onSave();
  }

  onSetSize(size) {
    if (size >= 3 && size <= 10) {
      this.delegate.onResize(size);
    }
  }

  onNewGame() {
    this.delegate.onRestart();
  }
}