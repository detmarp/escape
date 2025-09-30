import Shape12 from './shape12.js';

export default class GlobeMaker {
  constructor() {

  }

  build(levels, radius) {
    this.shape12 = new Shape12(1);

    this.verts = this.shape12.verts;
    this.polys = this.shape12.polys;

    this._separatePents();

    for (let poly of this.polys) {
      this._scalePoly(poly, 0.4);
    }

    this._makePatches();

    this._setRadius(radius);
    this._vertNoise();
  }

  _makePatches() {
    this.patches = [];
    for (var i = 1; i <= 1; i++) {
      this._addPatch(i, true);
      this._addPatch(i, false);
    }

    console.log(JSON.stringify(this.patches));
  }

  _addPatch(pi, isUp) {
    var centers = [];
    var neighbors = this.shape12.info[pi].neighbors;
    var p0 = pi;
    var n = isUp ? 0 : 1;
    var p1 = neighbors[n + 0];
    var p2 = neighbors[n + 1];
    [p0, p1, p2].forEach(idx => {
      const poly = this.polys[idx];
      var center = this._center(poly);
      centers.push(center);
    });
    const vertsLen = this.verts.length;
    centers.forEach(center => this.verts.push(center));
    this.polys.push([vertsLen, vertsLen + 1, vertsLen + 2]);
    var patch = {
      polyIndex: [p0, p1, p2],
      index: this.patches.length,
    };
    this.patches.push(patch);
    return patch;
  }

  _scalePoly(poly, f) {
    const center = this._center(poly);
    for (let i = 0; i < poly.length; i++) {
      const idx = poly[i];
      const v = this.verts[idx];
      // Move v toward center by factor f
      v[0] = center[0] + (v[0] - center[0]) * f;
      v[1] = center[1] + (v[1] - center[1]) * f;
      v[2] = center[2] + (v[2] - center[2]) * f;
    }
  }

  _vertNoise() {
    for (let v of this.verts) {
      for (let i = 0; i < 3; i++) {
        v[i] += (Math.random() - 0.5) * 0.1;
      }
    }
  }

  _setRadius(radius) {
    for (let v of this.verts) {
      this._normalize(v, radius);
    }
  }

  _normalize(v, scale = 1, origin = [0, 0, 0]) {
    // Subtract origin
    const x = v[0] - origin[0];
    const y = v[1] - origin[1];
    const z = v[2] - origin[2];
    const len = this._length(v, origin) || 1;
    v[0] = origin[0] + (x / len) * scale;
    v[1] = origin[1] + (y / len) * scale;
    v[2] = origin[2] + (z / len) * scale;
  }

  _scale(v, radius) {
    v[0] *= radius;
    v[1] *= radius;
    v[2] *= radius;
  }

  _length(v, origin = [0, 0, 0]) {
    const x = v[0] - origin[0];
    const y = v[1] - origin[1];
    const z = v[2] - origin[2];
    return Math.sqrt(x * x + y * y + z * z);
  }

  _center(poly) {
    const center = [0, 0, 0];
    for (let idx of poly) {
      const v = this.verts[idx];
      center[0] += v[0];
      center[1] += v[1];
      center[2] += v[2];
    }
    const n = poly.length;
    center[0] /= n;
    center[1] /= n;
    center[2] /= n;
    return center;
  }

  _separatePents() {
    // Start a new empty verts array
    const newVerts = [];
    // For each pent (the first 12 polys)
    for (let i = 0; i < 12; i++) {
      const poly = this.polys[i];
      // For each vert index in the poly
      for (let j = 0; j < poly.length; j++) {
        const oldIndex = poly[j];
        // Make a COPY of the old vert
        const newVert = [...this.verts[oldIndex]];
        // Add to new verts array
        const newIndex = newVerts.length;
        newVerts.push(newVert);
        // Fix up the vert index of that poly
        poly[j] = newIndex;
      }
    }
    // Replace verts with newVerts
    this.verts = newVerts;
  }
}
