export default class Chat {
  constructor() {
  }

  setup() {
  }

  start(prompt, callback) {
    this._running = true;
    let paragraph = `You said: ${prompt}. ${this.hint || ""}\n`;
    callback(paragraph, true);
  }

  stop() {
  }
}
