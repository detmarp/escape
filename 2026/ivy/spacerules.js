export default {
  blueprints: {
    'hangar': {
      name: 'Hangar',
      levels: [
        {},
        {},
      ],
      cost: 100,
      buildTime: 5,
      productionRate: 10,
      productionType: 'money',
    },
    'launchpad': {
      name: 'Launch Pad',
      levels: [ {} ],
      cost: 500,
      buildTime: 15,
      productionRate: 0,
      productionType: null,
    },
    'bank': {
      name: 'Bank',
      levels: [ {} ],
      cost: 200,
      buildTime: 8,
      productionRate: 15,
      productionType: 'money',
    },
    'hq': {
      name: 'HQ',
      levels: [ {} ],
      cost: 300,
      buildTime: 10,
      productionRate: 5,
      productionType: 'money',
    },
  },
  rules: {
    costScaling: 1.2,
    maxLevel: 100,
    disasterChance: 0.05,
  },
  setup: {
    basic: {
      money: 10,
      buildings: [
        { id: 'hangar', level: 0 },
        { id: 'launchpad', level: 0 },
        { id: 'hq', level: 0 },
      ],
    },
  },
};
