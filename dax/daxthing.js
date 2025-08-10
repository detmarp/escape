export default class DaxThing {
  static nextId = 0;

  constructor(label) {
    this.id = DaxThing.nextId++;
    this.label = label || `thing${this.id.toString().padStart(3, '0')}`;
  }
}
