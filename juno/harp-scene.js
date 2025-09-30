import GeoOne from './geoone.js';
import GlobeMaker from './globemaker.js';

export default class HarpScene {
  constructor(program) {
    this.program = program;
    this.dax = this.program.scene.dax;
  }

  run() {
    this.dax.ez.add("groundgrid");

    var globe = new GlobeMaker();
    globe.build(5, 4);
    {
      for(var i = 0; i < 13; i++) {
        var p = globe.verts[i];
        this.dax.ez.nextSize(0.5);
        this.dax.ez.nextCrayon(i);
        this.dax.ez.add('ball');
        this.dax.ez.position(...p);
      }
    }

    var geo = new GeoOne(this.dax.THREE);
    var ob = geo.make(globe.verts, globe.polys);
    ob.position.set(0, 0, 0);

    this.dax.scene.add(ob);
  }
}
