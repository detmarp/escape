export default class SaveData {
  constructor() {
    //this._debugClear();
    this._normalize();
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem('saveData');
      if (raw) this.data = JSON.parse(raw);
    } catch (err) {
      console.warn('SaveData.load failed:', err);
    }
    this._normalize();
  }

  save() {
    this._normalize();
    this.data.count += 1;
    try {
      localStorage.setItem('saveData', JSON.stringify(this.data));
    } catch (err) {
      console.warn('SaveData.save failed:', err);
    }
  }

  _normalize() {
    this.data = this.data || {};
    this.data.settings = this.data.settings || {};
    this.data.history = this.data.history || [];
    this.data.count = this.data.count || 0;
  }

  _debugClear() {
    localStorage.removeItem('saveData');
    this.data = {};
    this._normalize();
  }

  _debugPrint(prefix) {
    console.log(prefix, JSON.stringify(this.data));
    if (this.data.history) {
      this.data.history.forEach((entry, index) => {
        console.log(index, JSON.stringify(entry));
      });
    }
  }
}