export default class Mediator {
  constructor(fiver, helper, layout) {
    this.fiver = fiver;
    this.helper = helper;
    this.layout = layout;
    this.actions = null;

    this._setAll();
  }

  work(dt, time, frame) {
    const clampedDt = Math.min(dt, 99.9).toFixed(1);
    const clampedTime = time.toFixed(2);
    //console.log('dt:', clampedDt, 'time:', clampedTime, 'frame:', frame);

    this._doActions();
  }

  _doActions() {
    if (this.actions) {
      const result = this.actions.next();
      if (!result.done) {
        this._action(result.value);
      } else {
        this.actions = null;
      }
    }
  }

  _action(action) {
    console.log(`aaa Action from helper: ${JSON.stringify(action)}`);
    switch (action.action) {
      case 'slot':
        let label = action.label;
        let value = action.value !== undefined ? String(action.value) : '';
        let type = action.type || '';
        this.layout.updateSlot(action.index, label, value, type);
        break;
      case 'dice':
        this._setDice(action.dice);
        break;
    }
  }

  _setAll() {
    this._setButtons();
    this.layout.updateScore(this.fiver.totalScore);
  }

  _setDice(dice) {
    for (let i = 0; i < 5; i++) {
      const dieObj = dice[i];
      let state = 'normal';

      if (dieObj.rolling) {
        state = 'rolling';
      } else if (dieObj.hold) {
        state = 'held';
      }

      this.layout.updateDice(i, dieObj.value, state);
    }
  }

  _setButtons() {
    for (let i = 0; i < 18; i++) {
      const slot = this.helper.getSlot(i);
      this.layout.updateSlot(i, slot.label, slot.value, slot.status);
    }
  }

  command(command) {
    this.actions = this.helper.command(command);
  }
}
