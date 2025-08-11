import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import DaxJunk from './daxjunk.js';
import DaxEz from './daxez.js';
import DaxEngine from './daxengine.js';

export default class Dax {
  static THREE = THREE;

  constructor() {
    this.engine = new DaxEngine(this);
    this.ez = new DaxEz(this);
    this.junk = new DaxJunk();
  }
}