export default class Output {
  constructor() {
    this._clear();
  }

  update(text) {
    this.current = text;
  }

  append(text) {
    this._trim();
    this.history += text.trim() + '\n';
    this.current = '';
  }

  _trim() {
    if (/^\s*$/.test(this.history)) {
      this.history = '';
    } else {
      this.history = this.history.trimEnd() + '\n\n';
    }
  }

  _clear() {
    this.history = '';
    this.current = '';
  }
}