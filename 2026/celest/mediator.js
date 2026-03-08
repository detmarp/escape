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
    let text = '';
    for (let i = 0; i < 5; i++) {
      const dieObj = this.helper.dice[i];
      const rolling = dieObj.rolling ? 'R' : '';
      const debugStr = dieObj.hold ? `[${dieObj.value}]${rolling}` : `${dieObj.value}${rolling}`;
      text += `${debugStr} `;
    }
    this.layout.dice.dice.textContent = text;
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
