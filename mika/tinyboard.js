export default class TinyBoard {
  constructor(tiny) {
    this.tiny = tiny;

    this.cells = Array.from({ length: 16 }, (_, i) => ({
      resource: null,
      building: null,
      index: i,
    }));
  }
}