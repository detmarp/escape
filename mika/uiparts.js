export default class UiParts {
  constructor(tiny) {
    this.tiny = tiny;

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
