export default {
  blueprints: {
    hq: {
      name: 'Headquarters',
      levels: [
        {
          upgrade: {
            time: 20,
            speedupCost: {
              currency: 'gems',
              amount: 2,
            },
          },
        },
        {
          collect: {
            currency: 'gold',
            capacity: 100,
            perMinute: 10,
          }
        },
        {},
      ]
    },
    launchpad: {
      name: 'Launchpad',
      levels: [
        {},
        {},
        {},
        {},
        {},
      ]
    }
  }
};