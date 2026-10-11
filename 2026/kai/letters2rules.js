export default class Letters2Rules {
  constructor() {
    this.data = {};

    this.cardTypes = {
      guard: {
        card: { name: 'Guard', rank: 1, suit: 'guard' },
        rules: { needOther: true, needCard: true },
      },
      priest: {
        card: { name: 'Priest', rank: 2, suit: 'priest' },
        rules: { needOther: true },
      },
      baron: {
        card: { name: 'Baron', rank: 3, suit: 'baron' },
        rules: { needOther: true },
      },
      handmaid: {
        card: { name: 'Handmaid', rank: 4, suit: 'handmaid' },
        rules: { },
      },
      prince: {
        card: { name: 'Prince', rank: 5, suit: 'prince' },
        rules: { needAny: true },
      },
      king: {
        card: { name: 'King', rank: 6, suit: 'king' },
        rules: { needOther: true },
      },
      countess: {
        card: { name: 'Countess', rank: 7, suit: 'countess' },
        rules: { },
      },
      princess: {
        card: { name: 'Princess', rank: 8, suit: 'princess' },
        rules: { },
      },
    };
    let deckSetup = [
      { type: 'guard', count: 5 },
      { type: 'priest', count: 2 },
      { type: 'baron', count: 2 },
      { type: 'handmaid', count: 2 },
      { type: 'prince', count: 2 },
      { type: 'king', count: 1 },
      { type: 'countess', count: 1 },
      { type: 'princess', count: 1 },
    ];

    this.data.deck = [];
    for (let setup of deckSetup) {
      for (let i = 0; i < setup.count; i++) {
        this.data.deck.push({ ...this.cardTypes[setup.type].card });
      }
    }
  }
}
