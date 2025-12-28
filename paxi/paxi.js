/*
  Paxi is a general UX manager for the Tower of Hanoi game.

  Injected with Hanoi game object
  Calls back to its owner through delegate methods.
  Manages a general UX state, but does not know the specifics of the view.
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

  systemSize(size) {
    if (this.canSize(size)) {
      this.delegate.onResize(size);
    }
  }

  systemNewGame() {
    this.delegate.onRestart();
  }

  canSize(size) {
    return size >= 3 && size <= 10;
  }

  canTap(peg) {
  }

  *doCommand(command, params = {}) {
    if (command === 'tap') {
      let peg = params.peg;
      if (peg >= 0 && peg < this.hanoi.pegs.length) {
        if (this.selected) {
          let fromPeg = this.selected.peg;
          if (this.hanoi.canMove(fromPeg, peg)) {
            this.hanoi.doMove(fromPeg, peg);
            this.selected = null;
            this.delegate.onSave();
            yield* this._doResult({ action: 'move', fromPeg, toPeg: peg });
            return;
          }
          else {
            yield* this._error({ message: `Cannot move from peg ${fromPeg} to peg ${peg}` });
            this.selected = null;
            yield* this._doResult({ action: 'deselect', peg });
            return;
          }
        }
        else {
          if(this.hanoi.canSelect(peg)) {
            this.selected = peg;
            this.selected = {
              peg,
              diskIndex: this.hanoi.pegs[peg][this.hanoi.pegs[peg].length - 1],
              y: this.hanoi.pegs[peg].length - 1,
            };
            yield* this._doResult({ action: 'select', peg });
            return;
          }
          else {
            yield* this._error({ message: `Cannot select peg ${peg}` });
            return;
          }
        }
      }
    }
    yield* this._error({ message: `Error: ${command}, params: ${JSON.stringify(params)}` });
  }

  *_error(params) {
    yield { type: 'error', params };
  }

  *_doResult(result) {
    if (this.debug) {
      console.log(`Paxi chunk: ${JSON.stringify(result)}`);
    }
    yield result;
  }
}