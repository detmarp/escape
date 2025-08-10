import DaxJunk from './daxjunk.js';
import DaxEz from './daxez.js';
import DaxEngine from './daxengine.js';
import DaxThing from './daxthing.js';

export default class Dax {
  static Thing = DaxThing;

  constructor() {
    this.junk = new DaxJunk();
    this.ez = new DaxEz();
    this.engine = new DaxEngine();
  }
}