export default {
  buildings: [
    {
      id: 'factory',
      name: 'Factory',
      cost: 100,
      buildTime: 5,
      productionRate: 10,
      productionType: 'money',
    },
    {
      id: 'assembly',
      name: 'Assembly',
      cost: 150,
      buildTime: 8,
      productionRate: 8,
      productionType: 'money',
    },
    {
      id: 'launchpad',
      name: 'Launch Pad',
      cost: 500,
      buildTime: 15,
      productionRate: 0,
      productionType: null,
    },
    {
      id: 'school',
      name: 'Astronaut School',
      cost: 300,
      buildTime: 10,
      productionRate: 0,
      productionType: null,
    },
    {
      id: 'corps',
      name: 'Astronaut Corps',
      cost: 400,
      buildTime: 12,
      productionRate: 0,
      productionType: null,
    },
    {
      id: 'lab',
      name: 'Laboratory',
      cost: 600,
      buildTime: 20,
      productionRate: 0,
      productionType: null,
    },
  ],
  rules: {
    costScaling: 1.2,
    maxLevel: 100,
    disasterChance: 0.05,
  },
  setup: {
    basic: {
      startingMoney: 1000,
      startingBuildings: [],
    },
  },
};
