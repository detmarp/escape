// event0.js - Example event sequence for a complete MVP game session
// This is a reference showing every event type and how they sequence

/*
  Brainstorming events ...

  human can - thru buttons or lists:
    start building upgrade
    early finish building upgrade
    start building a craft
    early speedup to finish a craft
    select a mission
    collect money from hq
    start research
    shop an item, acquire an item or IAP bundle
    inspect a craft - to uplevel its success chances
    launch a craft
    abort a launch ( in the first 10 seconds of countdown)

  game can, based on logic or pending events:
    finish upgrading building
    finish research
    finish building craft
    insert new building in progress
    insert new craft in progress
    collect money to the bank, reset hq
    start a launch countdown
    blastoff
    perform some mission moment, like separate stages, spacewalk, orbit, orbital decay, reentry, landing, explode, burn up on reentry, crash
    start a mission
    complete a mission (with success or failure, updating history, hall of fame, in memorium, rewards)

    possible verbs:
      upgrade
      upgraded
      make
      made
      mission
      research
      researched
      buy
      inspect
      abort
      step

*/

export const eventSequence = [
  // === GAME LOAD (time has passed, pending events fired) ===
  {
    type: "game_loaded",
    timeElapsed: 7200000,  // 2 hours
    eventsProcessed: 5,
    timestamp: -0,
  },

  // Events that fired while player was away
  {
    type: "research_complete",
    techType: "alox",
    timestamp: -7200,
  },
  {
    type: "tech_certified",
    techType: "alox",
    timestamp: -7200,
  },
  {
    type: "rocket_ready",
    rocketId: "r7_v1_001",
    rocketType: "r7_v1",
    timestamp: -7200,
  },
  {
    type: "mission_success",
    missionId: "early_satellite_01",
    rocketId: "r7_v1_000",
    reward: { money: 500 },
    timestamp: -7200,
  },
  {
    type: "achievement_unlocked",
    achievementId: "first_orbit",
    timestamp: -7200,
  },

  // === ACTIVE GAMEPLAY (player actions) ===
  {
    type: "upgrade_initiated",
    buildingId: "hq",
    newLevel: 5,
    cost: { money: 1200 },
    buildTime: 300000,  // 5 minutes
    timestamp: -0,
  },
  {
    type: "money_spent",
    amount: 1200,
    purpose: "upgrade",
    buildingId: "hq",
    timestamp: -0,
  },

  {
    type: "mission_selected",
    missionId: "sputnik_launch",
    missionType: "satellite_orbit",
    timestamp: -0,
  },

  {
    type: "rocket_construction_initiated",
    rocketId: "r7_v1_002",
    rocketType: "r7_v1",
    missionId: "sputnik_launch",
    payload: "sputnik",
    cost: { money: 800 },
    buildTime: 600000,  // 10 minutes
    ownedBy: "assembly",
    timestamp: -0,
  },
  {
    type: "money_spent",
    amount: 800,
    purpose: "rocket_construction",
    rocketId: "r7_v1_002",
    timestamp: -0,
  },

  {
    type: "research_initiated",
    techType: "multistage_rockets",
    cost: { money: 2000 },
    researchTime: 1800000,  // 30 minutes
    timestamp: -0,
  },
  {
    type: "money_spent",
    amount: 2000,
    purpose: "research",
    techType: "multistage_rockets",
    timestamp: -0,
  },

  // === TIME PASSES (player leaves game) ===
  // Simulating 15 minutes of real time

  {
    type: "upgrade_complete",
    buildingId: "hq",
    newLevel: 5,
    timestamp: -300,  // 5 min after events started
  },

  {
    type: "rocket_ready",
    rocketId: "r7_v1_002",
    rocketType: "r7_v1",
    missionId: "sputnik_launch",
    ownedBy: "launchpad",  // transferred from assembly
    timestamp: -600,  // 10 min after
  },

  {
    type: "mission_started",
    missionId: "sputnik_launch",
    rocketId: "r7_v1_002",
    timestamp: -600,  // auto-launch when ready
  },

  {
    type: "rocket_launched",
    rocketId: "r7_v1_002",
    missionId: "sputnik_launch",
    timestamp: -600,
  },

  {
    type: "rocket_in_orbit",
    rocketId: "r7_v1_002",
    missionId: "sputnik_launch",
    timestamp: -600,  // assume instant for MVP
  },

  {
    type: "rocket_landing_initiated",
    rocketId: "r7_v1_002",
    landTime: -60,  // 9 minutes in flight
    timestamp: -600,
  },

  {
    type: "rocket_landed",
    rocketId: "r7_v1_002",
    status: "success",
    timestamp: -60,
  },

  {
    type: "mission_success",
    missionId: "sputnik_launch",
    rocketId: "r7_v1_002",
    reward: { money: 600, gems: 5 },
    timestamp: -60,
  },

  {
    type: "money_earned",
    amount: 600,
    source: "mission_reward",
    missionId: "sputnik_launch",
    timestamp: -60,
  },

  {
    type: "gems_earned",
    amount: 5,
    source: "mission_reward",
    missionId: "sputnik_launch",
    timestamp: -60,
  },

  // Research still running (doesn't complete within 15 min window)

  // === COLLECTION ===
  {
    type: "collection_initiated",
    buildingId: "hq",
    timestamp: -0,  // player manually collects
  },

  {
    type: "money_earned",
    amount: 150,  // HQ passive income
    source: "building_collection",
    buildingId: "hq",
    timestamp: -0,
  },

  {
    type: "collection_complete",
    buildingId: "hq",
    amountCollected: 150,
    timestamp: -0,
  },

  // === ABORT SCENARIO (example, wouldn't all happen) ===
  // Uncomment to show abort flow:
  /*
  {
    type: "mission_aborted",
    missionId: "sputnik_launch",
    rocketId: "r7_v1_002",
    reason: "player_abort",
    refund: { money: 400 },  // partial refund
    timestamp: -0,
  },
  {
    type: "money_earned",
    amount: 400,
    source: "mission_refund",
    missionId: "sputnik_launch",
    timestamp: -0,
  },
  */

  // === SYSTEM EVENTS ===
  {
    type: "game_saved",
    timestamp: -0,
  },

  {
    type: "game_reset",
    timestamp: -0,
  },
];

export default eventSequence;
