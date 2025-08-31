//import Shape from "./shape.js";
import Vector from "./vector.js";

// Class for taking a shell shape and transforming it, adding hexes, etc.
export default class Shell {
  constructor(shape) {
    this.shape = shape;
  }

  // Split dodecahedron into 12 pents, 20 hexes
  subdivide32() {
    this.separatePents(this.shape);
    for (const poly of this.shape.pents) {
      this.scalePoly(this.shape, poly, 0.4);
    }

    if (!this.shape.hexes) {
      this.shape.hexes = [];
    }
    const hexBands = [
      // Top face
      {
        pentIndexes: [0],
        neighborOffsets: [ [0,1], [1,2], [2,3], [3,4], [4,0] ],
        vertexPattern: (p0, p1, p2, i, i2) => [p0[i], p1[1], p1[0], p2[2], p2[1], p0[i2]]
      },
      // Bottom face
      {
        pentIndexes: [11],
        neighborOffsets: [ [0,1], [1,2], [2,3], [3,4], [4,0] ],
        vertexPattern: (p11, p1, p2, i, i2) => [p11[i], p1[3], p1[2], p2[4], p2[3], p11[i2]]
      },
      // Top band
      {
        pentIndexes: [1,2,3,4,5],
        neighborOffsets: [ [4,3] ],
        vertexPattern: (pA, pB, pC) => [pA[4], pC[1], pC[0], pB[3], pB[2], pA[0]]
      },
      // Bottom band
      {
        pentIndexes: [6,7,8,9,10],
        neighborOffsets: [ [4,3] ],
        vertexPattern: (pA, pB, pC) => [pA[4], pC[2], pC[1], pB[4], pB[3], pA[0]]
      }
    ];

    // Then, loop over hexBands and generate hexes:
    for (const band of hexBands) {
      for (const pi of band.pentIndexes) {
        const pent = this.shape.pents[pi];
        for (let i = 0; i < pent.length; i++) {
          var hex;
          // For top/bottom, need to get two neighbors for each edge
          if (band.neighborOffsets.length > 1) {
            const p1 = this.shape.pents[this.shape.info[pi].neighbors[i]];
            const p2 = this.shape.pents[this.shape.info[pi].neighbors[(i + 1) % pent.length]];
            let i2 = (i + 1) % pent.length;
            hex = band.vertexPattern(pent, p1, p2, i, i2);
          } else {
            // For bands, just use fixed neighbor offsets
            const pB = this.shape.pents[this.shape.info[pi].neighbors[band.neighborOffsets[0][0]]];
            const pC = this.shape.pents[this.shape.info[pi].neighbors[band.neighborOffsets[0][1]]];
            hex = band.vertexPattern(pent, pB, pC);
          }
          this.shape.hexes.push(hex);
        }
      }
    }
  }

  subdivide() {
    // 1. Separate pent vertices and shrink
    this.separatePents(this.shape);
    for (const poly of this.shape.pents) {
      this.scalePoly(this.shape, poly, 0.4);
    }
    // For temp, let's just make quads between all the pents.
    // and store them in hexes
    // So to start, pent 0's edges will make quads with the 5 adjacent pents
    if (!this.shape.hexes) {
      this.shape.hexes = [];
    }
    // For pent 0, create quads between each edge and its adjacent pent in the first ring
    // the pent 0 edge is [i, i+1], and its i neighbor uses edge [0, 1]
    const pent0 = this.shape.pents[0];
    for (let i = 0; i < pent0.length; i++) {
      const neighborIdx = this.shape.info[0].neighbors[i];
      const neighborPent = this.shape.pents[neighborIdx];
      // pent0 edge: [i, (i+1)%5]
      // neighbor edge: [0,1]
      const quad = [
      pent0[(i + 1) % pent0.length],
      pent0[i],
      neighborPent[1],
      neighborPent[0]
      ];
      this.shape.hexes.push(quad);
    }
    // For first ring (pents 1-5), create quads between edge 4 and neighbor 4's edge 1
    for (let pi = 1; pi <= 5; pi++) {
      const pent = this.shape.pents[pi];
      const neighborIdx = this.shape.info[pi].neighbors[4];
      const neighborPent = this.shape.pents[neighborIdx];
      // pent edge: [4,0], neighbor edge: [1,2]
      const quad = [
      pent[0],
      pent[4],
      neighborPent[2],
      neighborPent[1]
      ];
      this.shape.hexes.push(quad);
    }
    // Mid-band: connect upper ring (pents 1-5) to lower ring (pents 6-10)
    // Each pent in upper ring (1-5) has a neighbor in lower ring at neighbor index 2
    for (let pi = 1; pi <= 5; pi++) {
      const pentUpper = this.shape.pents[pi];
      const lowerIdx = this.shape.info[pi].neighbors[2];
      const pentLower = this.shape.pents[lowerIdx];
      // pentUpper edge: [2,3], pentLower edge: [0,1]
      const quad = [
      pentUpper[3],
      pentUpper[2],
      pentLower[0],
      pentLower[4]
      ];
      this.shape.hexes.push(quad);
      // For each pent in upper ring (1-5), create quads with neighbor at index 3 using the right edge
      const rightIdx = this.shape.info[pi].neighbors[3];
      const pentRight = this.shape.pents[rightIdx];
      // pentUpper edge: [3,4], pentRight edge: [0,1]
      const quadRight = [
        pentUpper[4],
        pentUpper[3],
        pentRight[1],
        pentRight[0]
      ];
      this.shape.hexes.push(quadRight);
    }
    // Interconnect bottom band pents (pents 6-10)
    for (let pi = 6; pi <= 10; pi++) {
      const pent = this.shape.pents[pi];
      // Each pent in bottom band has neighbor at index 1 (next in band)
      const neighborIdx = this.shape.info[pi].neighbors[1];
      const neighborPent = this.shape.pents[neighborIdx];
      // pent edge: [1,2], neighbor edge: [3,4]
      const quad = [
        pent[2],
        pent[1],
        neighborPent[4],
        neighborPent[3]
      ];
      this.shape.hexes.push(quad);
    }
    // Connect bottom band (pents 6-10) to bottom pent (pent 11)
    const pent11 = this.shape.pents[11];
    for (let i = 6; i <= 10; i++) {
      const pent = this.shape.pents[i];
      // Each pent in bottom band has neighbor at index 4 (which is pent 11)
      // pent edge: [4,0], pent11 edge: [i-6, (i-5)%5]
      const idxInPent11 = (12 - i) % 5;
      const nextIdxInPent11 = (idxInPent11 + 1) % pent11.length;
      const quad = [
      pent[3],
      pent[2],
      pent11[nextIdxInPent11],
      pent11[idxInPent11]
      ];
      this.shape.hexes.push(quad);
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