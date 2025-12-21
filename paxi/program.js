import Container from "./container.js";
import Controller from "./controller.js";

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  async run() {
    await this.load();

    this.parent.innerHTML = '';
    this.container = new Container(this.parent, 3/4);

    this.controller = new Controller(this, this.container);

    this._animate();
  }

  async load() {
    const str = localStorage.getItem('savedata');
    if (!str) {
      this.savedata = {};
    }
    else {
      try {
        this.savedata = JSON.parse(str);
      } catch (e) {
        this.savedata = {};
      }
    }
    this._logSavedata('load');
    return this.savedata;
  }

  async save() {
    try {
      localStorage.setItem('savedata', JSON.stringify(this.savedata));
      this._logSavedata('save');
    } catch (e) {
    }
  }

  async erase() {
    localStorage.removeItem('savedata');
    this.savedata = {};
  }

  _work() {
    this.container.work();
    this.controller.work();
  }

  _animate(callback) {
    this._work();
    const loop = () => {
      this._work();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _logSavedata(label = '') {
    try {
      if (this.savedata.settings.logsavedata) {
        console.log(`Savedata: ${label} ${JSON.stringify(this.savedata)}`);
      }
    } catch (e) {
    }
  }
}