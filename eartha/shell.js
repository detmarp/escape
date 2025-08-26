import Shape from "./shape.js";
import Vector from "./vector.js";

// Class for taking a shell shape and transforming it, adding hexes, etc.
export default class Shell {
  constructor(shape) {
    this.shape = shape;
  }

  subdivide() {
    this.separatePents(this.shape);
    for (const poly of this.shape.pents) {
      this.scalePoly(this.shape, poly, 0.4);
    }

    if (!this.shape.hexes) {
      this.shape.hexes = [];
    }
    // For the 5 vertex indexes on pent[0], create a hex centered at each edge midpoint
    const p0 = this.shape.pents[0];
    for (let i = 0; i < p0.length; i++) {
      const p1 = this.shape.pents[this.shape.info[0].neighbors[i]];
      const p2 = this.shape.pents[this.shape.info[0].neighbors[(i + 1) % p0.length]];
      let i2 = (i + 1) % p0.length;
      var hex = [
        p0[i],
        p1[1],
        p1[0],
        p2[2],
        p2[1],
        p0[i2],
      ];
      console.log("hex:", JSON.stringify(hex));
      this.shape.hexes.push(hex);
    }

    // Make the bottom-face hexes
    const p11 = this.shape.pents[11];
    for (let i = 0; i < p11.length; i++) {
      const p1 = this.shape.pents[this.shape.info[11].neighbors[i]];
      const p2 = this.shape.pents[this.shape.info[11].neighbors[(i + 1) % p11.length]];
      let i2 = (i + 1) % p11.length;
      var hex = [
        p11[i],
        p1[3],
        p1[2],
        p2[4],
        p2[3],
        p11[i2],
      ];
      console.log("hex:", JSON.stringify(hex));
      this.shape.hexes.push(hex);
    }

    // make the top-band hexes
    for (let i = 0; i < 5; i++) {
      const pA = this.shape.pents[i + 1];
      const pB = this.shape.pents[this.shape.info[i + 1].neighbors[4]];
      const pC = this.shape.pents[this.shape.info[i + 1].neighbors[3]];
      var hex = [
        pA[4],
        pC[1],
        pC[0],
        pB[3],
        pB[2],
        pA[0],
      ];
      console.log("hex:", JSON.stringify(hex));
      this.shape.hexes.push(hex);
    }

    // make bottom band hexes
    for (let i = 0; i < 5; i++) {
      const pA = this.shape.pents[i + 6];
      const pB = this.shape.pents[this.shape.info[i + 6].neighbors[4]];
      const pC = this.shape.pents[this.shape.info[i + 6].neighbors[3]];
      var hex = [
        pA[4],
        pC[2],
        pC[1],
        pB[4],
        pB[3],
        pA[0],
      ];
      console.log("hex:", JSON.stringify(hex));
      this.shape.hexes.push(hex);
    }

  }

  normalize(count) {
    for (let i = 0; i < count; i++) {
      this.normalizeStep();
    }
  }

  normalizeStep() {
    // make edges
    const polys = [...this.shape.pents, ...(this.shape.hexes || [])];
    const edgeMap = new Map();
    for (let polyIdx = 0; polyIdx < polys.length; polyIdx++) {
      const poly = polys[polyIdx];
      for (let j = 0; j < poly.length; j++) {
        const a = poly[j];
        const b = poly[(j + 1) % poly.length];
        const key = [Math.min(a, b), Math.max(a, b)].join(",");
        edgeMap.set(key, [polyIdx, j]);
      }
    }
    //
    let totalLength = 0;
    let edgeCount = 0;
    for (const key of edgeMap.keys()) {
      const [a, b] = key.split(",").map(Number);
      const va = this.shape.verts[a];
      const vb = this.shape.verts[b];
      const len = Vector.distance(va, vb);
      totalLength += len;
      edgeCount++;
    }
    const avgEdgeLength = edgeCount > 0 ? totalLength / edgeCount : 0;
    console.log("Average edge length:", avgEdgeLength);

    var t = 0.6;
    var lengthTarget = avgEdgeLength * 0.9;

    //
    // Move edge vertices away/toward center to adjust edge length towards average
    for (const key of edgeMap.keys()) {
      const [a, b] = key.split(",").map(Number);
      const va = this.shape.verts[a];
      const vb = this.shape.verts[b];

      // Find center of edge
      const center = [
      (va[0] + vb[0]) / 2,
      (va[1] + vb[1]) / 2,
      (va[2] + vb[2]) / 2
      ];

      // Current edge vector and length
      const dirA = [va[0] - center[0], va[1] - center[1], va[2] - center[2]];
      const dirB = [vb[0] - center[0], vb[1] - center[1], vb[2] - center[2]];
      const currLen = Vector.distance(va, vb);

      // Desired half-length
      const targetHalfLen = lengthTarget / 2;
      const newHalfLen = dirA.map((v, i) => v * (1 - t) + (v / (currLen / 2)) * targetHalfLen * t);

      // Move vertices
      this.shape.verts[a] = [
      center[0] + newHalfLen[0],
      center[1] + newHalfLen[1],
      center[2] + newHalfLen[2]
      ];
      this.shape.verts[b] = [
      center[0] + newHalfLen[0] * -1,
      center[1] + newHalfLen[1] * -1,
      center[2] + newHalfLen[2] * -1
      ];
    }
    //
    for (let i = 0; i < this.shape.verts.length; i++) {
      const vert = this.shape.verts[i];
      const len = Vector.length(vert);
      const targetLen = this.shape.radius || 10;
      const newLen = len * (1 - t) + targetLen * t;
      Vector.scaleTo(vert, newLen / len);
      this.shape.verts[i] = vert;
    }
  }

  getPolyCenter(poly) {
    let center = [0, 0, 0];

    for (const vertIndex of poly) {
      const vert = this.shape.verts[vertIndex];
      Vector.addTo(center, vert);
    }

    Vector.scaleTo(center, 1 / poly.length);
    return center;
  }

  separatePents(shape) {
    const used = new Set();

    for (let i = 0; i < shape.pents.length; i++) {
      const pent = shape.pents[i];

      for (let j = 0; j < pent.length; j++) {
        const vertIndex = pent[j];

        if (used.has(vertIndex)) {
          // Vertex already used, create a copy
          const newIndex = shape.verts.length;
          shape.verts.push([...shape.verts[vertIndex]]);
          shape.pents[i][j] = newIndex;
        } else {
          // First time using this vertex
          used.add(vertIndex);
        }
      }
    }
  }

    scalePoly(shape, poly, scale = 1) {
    // Find center of poly
    const center = poly.reduce(
      (acc, idx) => {
        const v = shape.verts[idx];
        return Vector.addTo(acc, v);
      },
      [0, 0, 0]
    );
    Vector.scaleTo(center, 1 / poly.length);

    // For each vert, scale its vector from center
    for (const idx of poly) {
      const v = shape.verts[idx];
      const dir = [
        v[0] - center[0],
        v[1] - center[1],
        v[2] - center[2]
      ];
      Vector.scaleTo(dir, scale);  // Just scale, don't normalize first
      shape.verts[idx] = Vector.add([...center], dir);
    }
  }

}