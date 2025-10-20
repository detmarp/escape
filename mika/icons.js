export default class Icons {
  constructor() {
  }
  // create an SVG element with the given viewBox and size
  _createSVG(size = 64, viewBox = `0 0 ${size} ${size}`) {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }

  _getColors(color) {
    const sIn = String(color || '#000000').trim();
    let s = sIn.startsWith('#') ? sIn.slice(1) : sIn;
    if (s.length === 3) s = s.split('').map(ch => ch + ch).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(s)) s = '000000';
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    const toHex = n => n.toString(16).padStart(2, '0');
    const clamp = n => Math.max(0, Math.min(255, Math.round(n)));

    // shadow: darker (multiply by factor)
    const darkFactor = 0.75;
    const dr = clamp(r * darkFactor);
    const dg = clamp(g * darkFactor);
    const db = clamp(b * darkFactor);

    // light: blend toward white by a blend factor
    const lightBlend = 0.35;
    const lr = clamp(r + (255 - r) * lightBlend);
    const lg = clamp(g + (255 - g) * lightBlend);
    const lb = clamp(b + (255 - b) * lightBlend);

    const origHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const darkHex = `#${toHex(dr)}${toHex(dg)}${toHex(db)}`;
    const lightHex = `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;

    return [origHex, darkHex, lightHex];
  }

  makeHouse(size = 64, color = '#ddd') {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = this._createSVG(size);

    // Single polygon house using 9 verts (includes a door notch). One fill color, one stroke.
    const [fillColor] = this._getColors(color);
    const strokeColor = '#444';

    // 9 normalized verts outlining the house (clockwise)
    const layout = [
      [0.5, 0.05],
      [0.1, 0.3], [0.1, 0.9],
      [0.4, 0.9], [0.4, 0.6],
      [0.7, 0.6], [0.7, 0.9],
      [0.9, 0.9], [0.9, 0.3],
    ];

    // compute bounds & scale to fit svg
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x,y] of layout) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const pad = Math.max(2, size * 0.04);
    const availW = size - pad * 2;
    const availH = size - pad * 2;
    const scale = Math.min(availW / (maxX - minX), availH / (maxY - minY));
    const tx = pad - minX * scale + (availW - (maxX - minX) * scale) / 2;
    const ty = pad - minY * scale + (availH - (maxY - minY) * scale) / 2;

    const to2d = ([x,y]) => `${x * scale + tx},${y * scale + ty}`;
    const pts = layout.map(to2d);

    const poly = document.createElementNS(xmlns, 'polygon');
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('fill', fillColor);
    poly.setAttribute('stroke', strokeColor);

    svg.appendChild(poly);
    return svg;
  }

  makeCube(size = 64, color = '#aaa') {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = this._createSVG(size);
    const [origColor, darkColor, lightColor] = this._getColors(color);

    const layout = [
      [0.45, 0.05],  // top center
      [0.1, 0.22], [0.9, 0.22],  // upper outside corners
      [0.6, 0.4],  // center vertex
      [0.1, 0.7], [0.9, 0.7],  // lower outside corners
      [0.6, 0.95],  // bottom center
    ];

    // compute bounds of normalized coords
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x,y] of layout) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const pad = Math.max(2, size * 0.04);
    const availW = size - pad * 2;
    const availH = size - pad * 2;
    const scale = Math.min(availW / (maxX - minX), availH / (maxY - minY));
    const tx = pad - minX * scale + (availW - (maxX - minX) * scale) / 2;
    const ty = pad - minY * scale + (availH - (maxY - minY) * scale) / 2;

    const xmlnsNs = xmlns;

    console.log(`ttt (${tx},${ty}) scale(${scale})`);
    const to2d = ([x,y]) => `${x * scale + tx},${y * scale + ty}`;
    const pts = layout.map(to2d);

    function makeFace(pointIndices, faceColor, edgeColor) {
      const poly = document.createElementNS(xmlnsNs, 'polygon');
      const ptsList = pointIndices.map(i => pts[i]);
      console.log(`ccc ${JSON.stringify(ptsList.join(' '))}`);
      poly.setAttribute('points', ptsList.join(' '));
      poly.setAttribute('fill', faceColor);
      poly.setAttribute('stroke', edgeColor);
      return poly;
    }

    // faces using indices into pts array
    const top = makeFace([0,1,3,2], lightColor, '#444');
    const left = makeFace([3,1,4,6], origColor, '#444');
    const right = makeFace([2,3,6,5], darkColor, '#444');

    svg.appendChild(right);
    svg.appendChild(left);
    svg.appendChild(top);

    return svg;
  }
}