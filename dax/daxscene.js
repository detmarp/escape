export default class DaxScene {
  constructor() {
    this.things = [];
  }

  add(thing) {
    this.things.push(thing);
  }

  find(label) {
    return this.things.find(thing => thing.label === label);
  }
}