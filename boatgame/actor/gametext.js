import Text from "./text.js";

export default class GameText {

  constructor(labelA, labelB) {
    // Placeholder text values
    this.labela = labelA || "Player 1";
    this.labelb = labelB || "Player 2";
    this.message = "";
    this.textActors = [];
  }

  added() {
    // Ensure Text system is loaded/initialized if needed
    if (typeof Text.init === 'function') {
      Text.init();
    }
    // Create and add three placeholder text elements
    this.labelA = new Text(20, Text.TITLE, '#223', this.labela);
    this.labelB = new Text(20, Text.TITLE, '#223', this.labelb);
    this.message = new Text(36, Text.TITLE, '#224', this.message);

    this._node.addActor(this.labelA);
    this._node.addActor(this.labelB);
    this._node.addActor(this.message);

    this.labelA._node.position = [180, 10];
    this.labelA.centered = true;
    this.labelB._node.position = [180, 574];
    this.labelB.centered = true;
    this.message._node.position = [180, 284];
    this.message.centered = true;

    this.setMessage('');
  }

  setMessage(message) {
    this.message.text = message;
  }

  draw(ctx) {
    // No-op: Text actors handle their own drawing
  }
}