export default class SaveGame {
  constructor() {
    this.data = {};
    this._load();
  }

  startGame() {
    var last = this._last();
    last.underway = true;
    this.data.count = (this.data.count || 0) + 1;
    this._save();
  }

  getCurrentGame() {
  }

  setCurrentGame(data) {
    this.data.current = data;
    this._save();
  }

  quitCurrentGame() {
    this._endGameAndSave(true, 0, false, false, false);
  }

  _last() {
    this.data.last = this.data.last || {};
    return this.data.last;
  }

  _endGameAndSave(quit, score, upperBonus, fiver, fiverBonus) {
    var last = this._last();
    last.quit = quit;
    last.underway = undefined;
    this.data.current = undefined;
    last.stats = undefined;

    this._setHist('under200', score < 200);
    this._setHist('plus200', score >= 200);
    this._setHist('plus250', score >= 250);
    this._setHist('plus300', score >= 300);
    this._setHist('plus400', score >= 400);
    this._setHist('plus500', score >= 500);
    this._setHist('upper', upperBonus);
    this._setHist('fiver', fiver);
    this._setHist('fiverbonus', fiverBonus);

    this._save();
  }

  gameover(state) {
    this._endGameAndSave(
      false,
      state.grandTotal,
      state.upperBonus,
      state.lines[state.categories.FIVER],
      state.fiverBonus
    );
  }

  _save() {
    localStorage.setItem('savegame', JSON.stringify(this.data));
  }

  _load() {
    try {
      const saved = localStorage.getItem('savegame');
      this.data = saved ? JSON.parse(saved) : {};
    } catch (e) {
      this.data = {};
    }
  }

  _setHist(label, value) {
    this.data.hist = this.data.hist || {};
    let data = this.data.hist[label] || {};
    data.count = (data.count || 0) + (value ? 1 : 0);
    data.streak = value ? (data.streak || 0) + 1 : 0;
    this.data.hist[label] = data;
  }
}
