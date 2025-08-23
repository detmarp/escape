export default class Vector {
  static addTo(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
    return a;
  }

  static add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  static subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  static subttractTo(a, b) {
    a[0] -= b[0];
    a[1] -= b[1];
    a[2] -= b[2];
    return a;
  }

  static scale(a, scalar) {
    return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
  }

  static scaleTo(a, scalar) {
    a[0] *= scalar;
    a[1] *= scalar;
    a[2] *= scalar;
    return a;
  }

  static dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  static cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  static length(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  }

  static distance(a, b) {
    return Math.sqrt(
      (a[0] - b[0]) * (a[0] - b[0]) +
      (a[1] - b[1]) * (a[1] - b[1]) +
      (a[2] - b[2]) * (a[2] - b[2])
    );
  }

  static normalize(a) {
    const len = Vector.length(a);
    if (len === 0) return [0, 0, 0];
    return [a[0] / len, a[1] / len, a[2] / len];
  }
}
