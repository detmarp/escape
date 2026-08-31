export default {
  id: 100,
  data: {
    test: 1,
    buildings: [
      {
        type: 'hq',
        level: 0,
        id: 1,
      },
      {
        type: 'launchpad',
        level: 0,
        id: 2,
      },
    ],
    pending: [
      {
        event: {
          event: 'upgrade',
          buildingId: 1,
        },
        time: -1000,
      },
      {
        event: {
          event: 'upgrade',
          buildingId: 2,
        },
        time: -20000,
      },
    ],
  currency: { gold: 100, gems: 5 },
  history: {},
  achievements: [],
  missions: [],
  rockets: [],
  tech: [],
  },
};
