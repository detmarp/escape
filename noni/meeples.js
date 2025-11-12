export default class Meeples {
  constructor() {
    this.meeples = {
      wheat: { color: '#fae533', label: 'Wheat', type: 'resource' },
      wood: { color: '#5a423d', label: 'Wood', type: 'resource' },
      brick: { color: '#f74045', label: 'Brick', type: 'resource' },
      stone: { color: '#999', label: 'Stone', type: 'resource' },
      glass: { color: '#117ddb', label: 'Glass', type: 'resource' },

      red: { color: '#ff0000', label: 'Red', type: 'building' },
      orange: { color: '#ffa500', label: 'Orange', type: 'building' },
      yellow: { color: '#eeee11', label: 'Yellow', type: 'building' },
      green: { color: '#17b441', label: 'Green', type: 'building' },
      blue: { color: '#0088ff', label: 'Blue', type: 'building' },
      black: { color: '#444', label: 'Black', type: 'building' },
      gray: { color: '#bbb', label: 'Gray', type: 'building' },
      pink: { color: '#ff55ff', label: 'Pink', type: 'building' },

      default: { color: '#faf', label: 'Default' }
    };

    this.alias = {
      r: 'brick',
      y: 'wheat',
      g: 'stone',
      c: 'glass',
      b: 'wood',
    };
  }

  getMeeple(name) {
    if (!(name in this.meeples)) {
      name = this.alias[name];
    }
    const meeple = this.meeples[name] || this.meeples.default;
    const result = { ...meeple };
    result.textColor = this._textColor(result.color);
    return result;
  }

  _textColor(hexColor) {
    // Calculate luminance and return black or white for good contrast
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}