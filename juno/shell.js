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
    for (const poly of this.shape.polys) {
      this.scalePoly(this.shape, poly, 0.4);
    }

    if (!this.shape.hexes) {
      this.shape.hexes = [];
    }
    const hexBands = [
      // Top face
      {
        polyIndexes: [0],
        neighborOffsets: [ [0,1], [1,2], [2,3], [3,4], [4,0] ],
        vertexPattern: (p0, p1, p2, i, i2) => [p0[i], p1[1], p1[0], p2[2], p2[1], p0[i2]]
      },
      // Bottom face
      {
        polyIndexes: [11],
        neighborOffsets: [ [0,1], [1,2], [2,3], [3,4], [4,0] ],
        vertexPattern: (p11, p1, p2, i, i2) => [p11[i], p1[3], p1[2], p2[4], p2[3], p11[i2]]
      },
      // Top band
      {
        polyIndexes: [1,2,3,4,5],
        neighborOffsets: [ [4,3] ],
        vertexPattern: (pA, pB, pC) => [pA[4], pC[1], pC[0], pB[3], pB[2], pA[0]]
      },
      // Bottom band
      {
        polyIndexes: [6,7,8,9,10],
        neighborOffsets: [ [4,3] ],
        vertexPattern: (pA, pB, pC) => [pA[4], pC[2], pC[1], pB[4], pB[3], pA[0]]
      }
    ];

    // Then, loop over hexBands and generate hexes:
    for (const band of hexBands) {
      for (const pi of band.polyIndexes) {
        const pent = this.shape.polys[pi];
        for (let i = 0; i < pent.length; i++) {
          var hex;
          // For top/bottom, need to get two neighbors for each edge
          if (band.neighborOffsets.length > 1) {
            const p1 = this.shape.polys[this.shape.info[pi].neighbors[i]];
            const p2 = this.shape.polys[this.shape.info[pi].neighbors[(i + 1) % pent.length]];
            let i2 = (i + 1) % pent.length;
            hex = band.vertexPattern(pent, p1, p2, i, i2);
          } else {
            // For bands, just use fixed neighbor offsets
            const pB = this.shape.polys[this.shape.info[pi].neighbors[band.neighborOffsets[0][0]]];
            const pC = this.shape.polys[this.shape.info[pi].neighbors[band.neighborOffsets[0][1]]];
            hex = band.vertexPattern(pent, pB, pC);
          }
          this._addPoly(hex, 'hex');
        }
      }
    }
  }

  subdivide() {
    // 1. Separate pent vertices and shrink
    this.separatePents(this.shape);
    for (const poly of this.shape.polys) {
      this.scalePoly(this.shape, poly, 0.4);
    }
    // For temp, let's just make quads between all the pents.
    // and store them in hexes
    // So to start, pent 0's edges will make quads with the 5 adjacent pents
    if (!this.shape.hexes) {
      this.shape.hexes = [];
    }

    // Create 5 new verts at midpoints between pent 0 and its neighbors
    var topRingVert = this.shape.verts.length;
    const pent0Center = this.getPolyCenter(this.shape.polys[0]);
    for (let i = 0; i < 5; i++) {
      const neighborAIdx = this.shape.info[0].neighbors[i];
      const neighborBIdx = this.shape.info[0].neighbors[(i + 1) % 5];
      const neighborACenter = this.getPolyCenter(this.shape.polys[neighborAIdx]);
      const neighborBCenter = this.getPolyCenter(this.shape.polys[neighborBIdx]);
      // Midpoint between pent0Center, neighborACenter, neighborBCenter
      const midpoint = [
        (pent0Center[0] + neighborACenter[0] + neighborBCenter[0]) / 3,
        (pent0Center[1] + neighborACenter[1] + neighborBCenter[1]) / 3,
        (pent0Center[2] + neighborACenter[2] + neighborBCenter[2]) / 3
      ];
      this.shape.verts.push(midpoint);
    }

    // For pent 0, create quads between each edge and its adjacent pent in the first ring
    // the pent 0 edge is [i, i+1], and its i neighbor uses edge [0, 1]
    const pent0 = this.shape.polys[0];
    for (let i = 0; i < pent0.length; i++) {
      const neighborIdx = this.shape.info[0].neighbors[i];
      const neighborPent = this.shape.polys[neighborIdx];
      // pent0 edge: [i, (i+1)%5]
      // neighbor edge: [0,1]
      const quad = [
      pent0[(i + 1) % pent0.length],
      pent0[i],
      topRingVert + (i - 1 + 5) % 5,
      neighborPent[1],
      neighborPent[0],
      topRingVert + ((i + 0) % 5)
      ];
      this._addPoly(quad, 'top');
    }

    var midUpperRingVert = this.shape.verts.length;
    const upperBandCenters = [];
    for (let i = 1; i <= 5; i++) {
      const pentAIdx = i;
      const pentBIdx = (i % 5) + 1;
      // Find the shared lower pent between pentA and pentB
      const neighborsA = this.shape.info[pentAIdx].neighbors;
      const neighborsB = this.shape.info[pentBIdx].neighbors;
      // Lower band pents are 6-10
      const sharedLower = neighborsA.find(n => neighborsB.includes(n) && n >= 6 && n <= 10);
      if (sharedLower !== undefined) {
        const centerA = this.getPolyCenter(this.shape.polys[pentAIdx]);
        const centerB = this.getPolyCenter(this.shape.polys[pentBIdx]);
        const centerLower = this.getPolyCenter(this.shape.polys[sharedLower]);
        const midpoint = [
          (centerA[0] + centerB[0] + centerLower[0]) / 3,
          (centerA[1] + centerB[1] + centerLower[1]) / 3,
          (centerA[2] + centerB[2] + centerLower[2]) / 3
        ];
        this.shape.verts.push(midpoint);
        upperBandCenters.push(this.shape.verts.length - 1);
      }
    }

    var midLowerRingVert = this.shape.verts.length;
    const lowerBandCenters = [];
    for (let i = 6; i <= 10; i++) {
      const pentAIdx = i;
      const pentBIdx = (i % 5) + 6;
      // Find the shared upper pent between pentA and pentB
      const neighborsA = this.shape.info[pentAIdx].neighbors;
      const neighborsB = this.shape.info[pentBIdx].neighbors;
      // Upper band pents are 1-5
      const sharedUpper = neighborsA.find(n => neighborsB.includes(n) && n >= 1 && n <= 5);
      if (sharedUpper !== undefined) {
        const centerA = this.getPolyCenter(this.shape.polys[pentAIdx]);
        const centerB = this.getPolyCenter(this.shape.polys[pentBIdx]);
        const centerUpper = this.getPolyCenter(this.shape.polys[sharedUpper]);
        const midpoint = [
          (centerA[0] + centerB[0] + centerUpper[0]) / 3,
          (centerA[1] + centerB[1] + centerUpper[1]) / 3,
          (centerA[2] + centerB[2] + centerUpper[2]) / 3
        ];
        this.shape.verts.push(midpoint);
        lowerBandCenters.push(this.shape.verts.length - 1);
      }
    }

    // For first ring (pents 1-5), create quads between edge 4 and neighbor 4's edge 1
    for (let pi = 1; pi <= 5; pi++) {
      const pent = this.shape.polys[pi];
      const neighborIdx = this.shape.info[pi].neighbors[4];
      const neighborPent = this.shape.polys[neighborIdx];
      // pent edge: [4,0], neighbor edge: [1,2]
      const quad = [
      pent[0],
      pent[4],
      midUpperRingVert + (pi - 1 + 5) % 5,
      neighborPent[2],
      neighborPent[1],
      topRingVert + ((pi + 4) % 5)
      ];
      this._addPoly(quad, 'upper');
    }
    // Mid-band: connect upper ring (pents 1-5) to lower ring (pents 6-10)
    // Each pent in upper ring (1-5) has a neighbor in lower ring at neighbor index 2
    for (let pi = 1; pi <= 5; pi++) {
      const pentUpper = this.shape.polys[pi];
      const lowerIdx = this.shape.info[pi].neighbors[2];
      const pentLower = this.shape.polys[lowerIdx];
      // pentUpper edge: [2,3], pentLower edge: [0,1]
      const quad = [
      pentUpper[3],
      pentUpper[2],
      midUpperRingVert + (pi + 3 + 5) % 5,
      pentLower[0],
      pentLower[4],
      midLowerRingVert + (pi - 2 + 5) % 5,
      ];
      this._addPoly(quad, 'mid');
      // For each pent in upper ring (1-5), create quads with neighbor at index 3 using the right edge
      const rightIdx = this.shape.info[pi].neighbors[3];
      const pentRight = this.shape.polys[rightIdx];
      // pentUpper edge: [3,4], pentRight edge: [0,1]
      const quadRight = [
        pentUpper[4],
        pentUpper[3],
        midLowerRingVert + (pi - 2 + 5) % 5,
        pentRight[1],
        pentRight[0],
        midUpperRingVert + (pi + 4 + 5) % 5,
      ];
      this._addPoly(quadRight, 'lower');
    }

    var bottomRingVert = this.shape.verts.length;
    // Create 5 new verts at midpoints between pent 11 and its neighbors
    const pent11Center = this.getPolyCenter(this.shape.polys[11]);
    for (let i = 0; i < 5; i++) {
      const neighborAIdx = this.shape.info[11].neighbors[i];
      const neighborBIdx = this.shape.info[11].neighbors[(i + 1) % 5];
      const neighborACenter = this.getPolyCenter(this.shape.polys[neighborAIdx]);
      const neighborBCenter = this.getPolyCenter(this.shape.polys[neighborBIdx]);
      // Midpoint between pent11Center, neighborACenter, neighborBCenter
      const midpoint = [
      (pent11Center[0] + neighborACenter[0] + neighborBCenter[0]) / 3,
      (pent11Center[1] + neighborACenter[1] + neighborBCenter[1]) / 3,
      (pent11Center[2] + neighborACenter[2] + neighborBCenter[2]) / 3
      ];
      this.shape.verts.push(midpoint);
    }
    // Interconnect bottom band pents (pents 6-10)
    for (let pi = 6; pi <= 10; pi++) {
      const pent = this.shape.polys[pi];
      // Each pent in bottom band has neighbor at index 1 (next in band)
      const neighborIdx = this.shape.info[pi].neighbors[1];
      const neighborPent = this.shape.polys[neighborIdx];
      // pent edge: [1,2], neighbor edge: [3,4]
      const quad = [
        pent[2],
        pent[1],
        midLowerRingVert + (pi + 3) % 5,
        neighborPent[4],
        neighborPent[3],
        bottomRingVert + (7 - pi + 10) % 5
      ];
      this._addPoly(quad, 'bottom');
    }
    // Connect bottom band (pents 6-10) to bottom pent (pent 11)
    const pent11 = this.shape.polys[11];
    for (let i = 6; i <= 10; i++) {
      const pent = this.shape.polys[i];
      // Each pent in bottom band has neighbor at index 4 (which is pent 11)
      // pent edge: [4,0], pent11 edge: [i-6, (i-5)%5]
      const idxInPent11 = (12 - i) % 5;
      const nextIdxInPent11 = (idxInPent11 + 1) % pent11.length;
      const quad = [
      pent[3],
      pent[2],
      bottomRingVert + (12 - i) % 5,
      pent11[nextIdxInPent11],
      pent11[idxInPent11],
      bottomRingVert + (16 - i) % 5
      ];
      this._addPoly(quad, 'quad');
    }

      // let's make a summary object and print it
      var shell = {
      }
      shell.verts = this.shape.verts.slice(0, 60);
      shell.pents = this.shape.polys.slice(0, 12).map(poly => poly.slice(0, 5));
      shell.centers = this.shape.polys.slice(0, 12).map(poly => this.getPolyCenter(poly));
      shell.neighbors = this.shape.info.slice(0, 12).map(info => info.neighbors.slice(0, 5));
      shell.quads = [];
      for (let i = 12; i < this.shape.polys.length; i++) {
        const poly = this.shape.polys[i];
        const quad = poly.filter(idx => idx < 60);
        if (quad.length > 0) {
          shell.quads.push(quad);
        }
      }
      shell.vertMap = Array(60).fill(null);
      for (let pi = 0; pi < 12; pi++) {
        const poly = shell.pents[pi];
        for (let vi = 0; vi < poly.length; vi++) {
          const vertIdx = poly[vi];
          shell.vertMap[vertIdx] = [pi, vi];
        }
      }
      console.log("sss");
      console.log(JSON.stringify(shell));

  }

  _addPoly(indexes, id) {
    var index = this.shape.polys.length;
    this.shape.polys.push(indexes);
    if (!this.shape.info[index]) {
      this.shape.info[index] = {};
    }
    this.shape.info[index].id = id;
  }

  normalize(count) {
    for (let i = 0; i < count; i++) {
      this.normalizeStep();
    }
  }

  normalizeStep() {
    // make edges
    const polys = [...this.shape.polys, ...(this.shape.hexes || [])];
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

    for (let i = 0; i < shape.polys.length; i++) {
      const pent = shape.polys[i];

      for (let j = 0; j < pent.length; j++) {
        const vertIndex = pent[j];

        if (used.has(vertIndex)) {
          // Vertex already used, create a copy
          const newIndex = shape.verts.length;
          shape.verts.push([...shape.verts[vertIndex]]);
          shape.polys[i][j] = newIndex;
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