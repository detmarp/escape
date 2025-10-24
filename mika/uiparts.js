export default class UiParts {
  constructor(tiny) {
    this.tiny = tiny;

    this.meeples = {
      wheat: { color: '#fae533', label: 'Wheat' },
      wood: { color: '#5a423d', label: 'Wood' },
      brick: { color: '#f74045', label: 'Brick' },
      stone: { color: '#999', label: 'Stone' },
      glass: { color: '#117ddb', label: 'Glass' },

      red: { color: '#ff0000', label: 'Red' },
      orange: { color: '#ffa500', label: 'Orange' },
      yellow: { color: '#ffff00', label: 'Yellow' },
      green: { color: '#00ff44', label: 'Green' },
      blue: { color: '#0088ff', label: 'Blue' },
      black: { color: '#444', label: 'Black' },
      gray: { color: '#bbb', label: 'Gray' },
      pink: { color: '#ff55ff', label: 'Pink' },

      default: { color: '#f0f', label: 'Default' }
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
    return this.meeples[name] || this.meeples.default;
  }
}
