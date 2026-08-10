# Design Review: Event Architecture for MVP Space Game
## Meeting Transcript - 2026-08-08 (Reconvened)

**Attendees:**
- **Alice** (Systems Designer, detail-oriented, wants clean decisions)
- **Bob** (Gameplay Designer, pragmatic, needs code to feel natural)
- **Carol** (Technical Designer, infrastructure-minded, thinks about scale)

---

## OPENING (ROUND 2)

**Carol:** Okay, we're back. The first meeting was too abstract. Let's actually **code through** a real game sequence and see where the pain is. Bob, load up the test save. HQ level 3, Launchpad level 2 upgrading, that sort of thing.

**Bob:** Sure. So game starts. Player sees: "HQ [3]", "Launchpad [2] (45s remaining)", etc. Now the player clicks "upgrade" on the Assembly building. What event fires?

**Alice:** That's the question. Do we fire:
- `upgradeBegin` (explicit)
- `upgrade` with `action: 'begin'` (generic)

Let's think through both.

---

## SCENARIO 1: PLAYER CLICKS UPGRADE ASSEMBLY

**Carol:** Explicit approach first. Event fires:
```javascript
{
  type: 'upgradeBegin',
  buildingId: 'assembly-1',
  level: 1,
  cost: 500,
  duration: 30000,
  id: 12
}
```

Handler:
```javascript
_doEvent_upgradeBegin(event) {
  const building = this.spaceport.getBuilding(event.buildingId);
  this.spaceport.setMoney(this.spaceport.getMoney() - event.cost);
  building.upgradeEnd = event.timestamp + event.duration;
  building.upgrading = true;
}
```

**Bob:** Clean. Now 30 seconds pass. The game fires:
```javascript
{
  type: 'upgradeEnd',
  buildingId: 'assembly-1',
  newLevel: 2,
  id: 13
}
```

Handler:
```javascript
_doEvent_upgradeEnd(event) {
  const building = this.spaceport.getBuilding(event.buildingId);
  building.level = event.newLevel;
  building.upgrading = false;
  building.upgradeEnd = null;
}
```

**Carol:** I like this. Each event is one thing. The handler does one thing. No branching.

**Alice:** But now the player clicks "speedup" and pays 25 gems. What event fires?

---

## THE SPEEDUP PROBLEM

**Bob:** We need a third event type: `upgradeSpeedup`. The building is mid-upgrade, so:
```javascript
{
  type: 'upgradeSpeedup',
  buildingId: 'assembly-1',
  gemsSpent: 25,
  instantCompletion: true,
  id: 14
}
```

Handler:
```javascript
_doEvent_upgradeSpeedup(event) {
  const building = this.spaceport.getBuilding(event.buildingId);
  this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);
  building.upgrading = false;
  building.upgradeEnd = null;
  // Do we set level here? Or do we fire upgradeEnd immediately?
  // This is getting awkward...
}
```

**Carol:** Wait. If the building was supposed to finish in 20 seconds, and we speedup, does `upgradeSpeedup` complete the upgrade? Or does it just remove the timer and we wait for `upgradeEnd` at its original time?

**Alice:** That's the issue. In the "explicit types" approach, we've now got three separate events that all affect the same state machine. Do they conflict? Can you speedup twice? What if speedup fires but the upgrade was already done?

**Bob:** Right. So maybe the "generic with action field" approach makes more sense here. One handler that checks: "what action are we doing?"

```javascript
_doEvent_upgrade(event) {
  const building = this.spaceport.getBuilding(event.buildingId);

  if (event.action === 'begin') {
    this.spaceport.setMoney(this.spaceport.getMoney() - event.cost);
    building.upgrading = true;
    building.upgradeEnd = event.timestamp + event.duration;
  } else if (event.action === 'speedup') {
    this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);
    // Now what? Complete it immediately, or just remove timer?
  } else if (event.action === 'end') {
    building.level = event.newLevel;
    building.upgrading = false;
    building.upgradeEnd = null;
  }
}
```

**Carol:** But wait, we're back to the branching logic Alice said was ugly. And the handler is already getting complicated.

**Alice:** And it's not even clear: after speedup fires, do we **also** fire upgradeEnd? Or does speedup **replace** the upgradeEnd that was pending?

---

## DEEPER PROBLEM: STATE MACHINES

**Carol:** This is the real issue. Upgrade is a **state machine**:
```
idle -> upgrading -> done
```

And speedup is a **transition** that says "jump directly from upgrading to done."

In an event-driven system, how do you represent that cleanly?

**Bob:** Okay, so maybe speedup doesn't just set a flag. Maybe it **generates an upgradeEnd event** immediately. So the flow is:
1. Player clicks upgrade → `upgradeBegin` event fired
2. Game processes `upgradeBegin` → building is now upgrading
3. 30 seconds scheduled for `upgradeEnd`
4. Player clicks speedup → `upgradeSpeedup` event fired
5. Game processes `upgradeSpeedup` → spends gems, **and immediately schedules upgradeEnd for now instead of 30s from now**

**Alice:** So speedup doesn't directly mutate state. It just moves the timer. Then upgradeEnd fires immediately and completes the upgrade. That's cleaner.

**Carol:** But now upgradeSpeedup is doing something weird: it's not a state change, it's a **reschedule**. Is that an event? Or is it a helper function?

**Bob:** It has to be an event, because we want to replay the game. If we load from save and speedup happened, we need to know speedup happened.

**Alice:** Right. So the event is: "player paid gems to accelerate this."

**Carol:** Then the code looks like:
```javascript
_doEvent_upgradeSpeedup(event) {
  const building = this.spaceport.getBuilding(event.buildingId);
  this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);

  // Immediately trigger completion by rescheduling upgradeEnd
  const upgradeEndEvent = {
    type: 'upgradeEnd',
    buildingId: event.buildingId,
    newLevel: building.level + 1,
    timestamp: event.timestamp  // Fire NOW
  };

  // Add to pending events queue for immediate processing
  // ...but wait, how does that work?
}
```

---

## THE REAL ISSUE: EVENT GENERATION

**Bob:** Ah, I see the problem. Events are supposed to be **deterministic and replay-able**. But if one event generates another event mid-processing, now we've got questions:
- When does the generated event get added to the queue?
- Can one event generate multiple events?
- Do they all fire in the same timestamp, or does the generated event get a new timestamp?

**Carol:** This is why the explicit-types approach looked cleaner. Separate event = clear separation of concerns. But it **also** has this problem: speedup needs to do something to the state that affects upgradeEnd.

**Alice:** Unless... upgradeSpeedup **merges with** upgradeEnd. There's only one outcome: the upgrade completes immediately. So:

```javascript
{
  type: 'upgradeComplete',  // Could be from timeout OR speedup
  buildingId: 'assembly-1',
  completedVia: 'timeout'  // OR 'speedup'
}
```

**Bob:** So we collapse upgradeBegin + upgradeEnd + speedup into two events: `upgradeBegin` and `upgradeComplete`. The complete event doesn't care **why** it completed.

**Carol:** But then we lose information. We want to track: "Did the player speedup, or did it complete naturally?" for analytics, achievements, etc.

**Alice:** So:
```javascript
{
  type: 'upgradeComplete',
  buildingId: 'assembly-1',
  speedupUsed: true,  // or false
  gemsSpent: 25       // or 0
}
```

**Bob:** That's... actually pretty clean. upgradeBegin fires when the player clicks. upgradeComplete fires when it's done, regardless of reason.

---

## SCENARIO 2: PLAYER LAUNCHES ROCKET

**Carol:** Okay, now let's test this model against something else. Player has 4 missions available. Player picks one and launches a rocket. What events?

**Bob:** Depends on how granular we want mission moments. Do we have separate events for:
- `rocketLaunch` (leaves the launchpad)
- `rocketStage` (first stage separation)
- `rocketOrbit` (reaches orbit)
- `rocketDecay` (starts decaying)
- `rocketReentry` (enters atmosphere)
- `rocketLanding` (lands on pad)
- `missionSuccess` (mission objective complete)
- `missionFailure` (mission failed)

That's 8 events just for one mission.

**Alice:** Or we go generic: `missionStep` with a `phase` field:
```javascript
{
  type: 'missionStep',
  rocketId: 'rocket-1',
  phase: 'launch'  // 'stage', 'orbit', 'decay', 'reentry', 'landing', 'success', 'failure'
}
```

**Carol:** But that's exactly what we said was ugly. If we do that, the handler becomes:
```javascript
_doEvent_missionStep(event) {
  switch(event.phase) {
    case 'launch': ...
    case 'stage': ...
    // 8 different cases
  }
}
```

**Bob:** Plus we lose discoverability. If I search for "where does reentry logic go?", I'm looking for a method. With `missionStep`, it's buried inside a switch.

**Alice:** So explicit types: `missionStepLaunch`, `missionStepStage`, etc. Even though there are 8 of them. Each one has its own handler.

**Carol:** Okay, let's go with that. Player launches rocket at timestamp 1000:
```javascript
{
  type: 'missionStepLaunch',
  rocketId: 'rocket-1',
  missionId: 'mission-3',
  timestamp: 1000,
  id: 15
}
```

Handler:
```javascript
_doEvent_missionStepLaunch(event) {
  const rocket = this.spaceport.getRocket(event.rocketId);
  const mission = this.spaceport.getMission(event.missionId);
  rocket.status = 'in_flight';
  mission.status = 'active';
  // Schedule next phase (stage separation) for 5 seconds later
  this.schedulePending(1005, 'missionStepStage', { rocketId: event.rocketId, missionId: event.missionId });
}
```

**Bob:** Wait, the handler is **scheduling new events**? I thought events were just state mutations.

**Carol:** That's a third approach we haven't talked about. If a handler can schedule future events, then the game doesn't need pre-computed mission timelines. Each step schedules the next step.

**Alice:** But now we've got implicit dependencies. When do the scheduled events actually get added? At the end of processing this event? We need clear rules.

---

## TAKING STOCK

**Carol:** Alright, let me lay this out. We have **three competing models**:

### Model 1: Explicit Event Types (Flat)
```
upgradeBegin, upgradeEnd
upgradeComplete (merge begin+end)
missionStepLaunch, missionStepStage, missionStepOrbit, ...
```
- **Pro:** Clean, searchable, one handler per type, no branching
- **Con:** Type count explodes (30+), handlers can't talk to each other, state machine conflicts (speedup interrupts upgrade)

### Model 2: Generic with Action Fields (Compact)
```
upgrade { action: 'begin' | 'end' | 'speedup' }
missionStep { phase: 'launch' | 'stage' | ... }
```
- **Pro:** Fewer types (15-20), compact
- **Con:** Branching logic in handlers, buried in conditionals, harder to search/test

### Model 3: Handlers Schedule Future Events (Generative)
```
upgradeBegin fires → handler schedules upgradeEnd for 30s from now
missionStepLaunch fires → handler schedules missionStepStage for 5s from now
```
- **Pro:** Natural game flow, no pre-computed timelines
- **Con:** Events are no longer pure snapshots, handlers have side effects, replay becomes fragile

**Bob:** So which one actually works?

**Alice:** None of them, perfectly. Each one solves a different problem but creates new ones.

**Carol:** I think the answer is: **Model 1 is cleanest, but we need to design the state machine right from the start.**

For upgrade, instead of separate upgradeBegin/upgradeEnd events, we recognize that an upgrade has a **lifecycle**:
- User initiates upgrade → `upgradeBegin` event
- Timer expires → `upgradeComplete` event (not `upgradeEnd`)
- Player speedup interrupts → `upgradeSpeedup` event, which **is a separate thing** (the upgrade still completes normally, but we also track that speedup was used)

So there's no conflict. Three parallel concerns, not competing state transitions.

**Alice:** And for missions, we accept that there are 8 mission phases. That's not complexity, that's just the game.

**Bob:** Okay, but then the event type count is... what, 40?

**Carol:** Let me count:
- Upgrade: `upgradeBegin`, `upgradeComplete`, `upgradeSpeedup` (3)
- Research: `researchBegin`, `researchComplete`, `researchSpeedup` (3)
- Make rocket: `makeRocketBegin`, `makeRocketComplete` (2)
- Select mission: `selectMission` (1)
- Launch rocket: `launchRocket` (1)
- Mission phases: `missionStepLaunch`, `missionStepStage`, `missionStepOrbit`, `missionStepDecay`, `missionStepReentry`, `missionStepLanding`, `missionStepSuccess`, `missionStepFailure` (8)
- Collect reward: `collectMissionReward`, `collectBuildingReward` (2)
- Shop: `shopBuy`, `shopSell` (2)
- System: `techResearched`, `achievementUnlock`, `gameLoaded`, `gameSaved` (4)

That's 29. Close to 25, maybe a bit higher depending on what we cut.

**Alice:** And every handler is dead simple. No branching. Pure state mutation.

**Bob:** I can live with 30 event types if the code is clean and testable.

**Carol:** The key insight is: **events are not actions, they're state changes.** An action can cause multiple events (or none). A player clicks "speedup" and we fire a speedup event. We also fire a completion event. Two separate events, two separate concerns.

---

## FINAL MODEL

**Alice:** So the architecture is:

1. **~30 explicit event types** covering all state changes
2. **One handler per type:** `_doEvent_eventName()`
3. **No branching logic** in handlers—each handler is 3-5 lines
4. **No event generation inside handlers**—all events are pre-computed or timer-based
5. **Clear separation**: User actions → events fired immediately. Timers → events fired at scheduled time.

**Bob:** And if we realize a handler is getting complex, we don't try to merge events. We split them further.

**Carol:** Exactly. The architecture supports growth. Start with 30, scale to 50 if needed.

**Alice:** CamelCase for all event types and handler names. Searchable. Consistent.

---

## CODE SKETCH: The Real Test (REVISED WITH EVENTS AND ACTIONS)

**Carol:** Okay, here's the key insight we're adding. **Critical reminder: the whole thing is a generator.** It checks timestamps, sorts next-up moments, turns them into events, handles the events, and yields **both events and actions** back to the caller, one at a time. The event fires, generates one or more actions, and each action is yielded as state changes. Each yield is a checkpoint where Screen1 can update the UI.

So we have two types of yields:
- **Events**: Timestamped game moments (scheduled or user-triggered)
- **Actions**: The actual state mutations that happen

One event can yield multiple actions.

```javascript
*update(now) {
  // Fire timer-based events
  for (const pending of this.pendingEvents) {
    if (pending.fireAt <= now) {
      yield { isEvent: true, data: pending };

      const actions = this.processEvent(pending);  // Returns array of actions
      for (const action of actions) {
        yield { isEvent: false, data: action };
        this.processAction(action);  // Mutates state
      }

      // remove from pending
    }
  }

  // Process user actions (from input queue)
  for (const userInput of this.inputQueue) {
    const event = this.actionToEvent(userInput);
    yield { isEvent: true, data: event };

    const actions = this.processEvent(event);
    for (const action of actions) {
      yield { isEvent: false, data: action };
      this.processAction(action);  // Mutates state

      // If this event scheduled a future event, add it
      if (event.type === 'upgradeBegin') {
        this.pendingEvents.push({
          type: 'upgradeComplete',
          buildingId: event.buildingId,
          fireAt: now + event.duration
        });
      }
    }
  }
}

processEvent(event) {
  const handler = this['_doEvent_' + event.type];
  return handler(event);  // Returns array of actions
}

_doEvent_upgradeBegin(event) {
  return [
    { type: 'deductMoney', amount: event.cost },
    { type: 'setUpgrading', buildingId: event.buildingId, upgrading: true },
  ];
}

_doEvent_upgradeComplete(event) {
  return [
    { type: 'incrementLevel', buildingId: event.buildingId },
    { type: 'setUpgrading', buildingId: event.buildingId, upgrading: false },
  ];
}

_doEvent_upgradeSpeedup(event) {
  const actions = [
    { type: 'deductGems', amount: event.gemsSpent },
  ];

  // Reschedule the pending completion
  const pendingComplete = this.pendingEvents.find(e =>
    e.type === 'upgradeComplete' && e.buildingId === event.buildingId
  );
  if (pendingComplete) {
    pendingComplete.fireAt = event.timestamp;  // Fire immediately
  }

  return actions;
}

processAction(action) {
  if (action.type === 'deductMoney') {
    this.spaceport.setMoney(this.spaceport.getMoney() - action.amount);
  } else if (action.type === 'setUpgrading') {
    const b = this.spaceport.getBuilding(action.buildingId);
    b.upgrading = action.upgrading;
  } else if (action.type === 'incrementLevel') {
    const b = this.spaceport.getBuilding(action.buildingId);
    b.level++;
  } else if (action.type === 'deductGems') {
    this.spaceport.setGems(this.spaceport.getGems() - action.amount);
  }
}
```

**Bob:** So now Screen1 gets a stream of objects: some are events (the "why"), some are actions (the "what changed"). The UI can react to actions for rendering, and maybe show events in a log.

**Alice:** And each event handler just returns a list of actions. No direct state mutation in the handler. The actions are the mutations.

**Carol:** Right. And a single event like `upgradeComplete` yields two actions: `incrementLevel` and `setUpgrading`. Both are observable checkpoints.

**Bob:** How many total event types and action types do we end up with?

**Carol:** Events are still ~35-40. Actions are separate—maybe 15-20 fundamental state mutations like `deductMoney`, `incrementLevel`, `setUpgrading`, `addRocket`, etc. Many events can reuse the same actions.

---

## DECISION

**Alice:** I'm convinced. Explicit types, one handler per type, pure state mutation. ~35-40 events for MVP.

**Bob:** And we're not trying to be clever about it. We're not using action fields or generic types. Each event is exactly what it is.

**Carol:** The architecture scales. If we add a new mechanic, we add a new event type. No refactoring of existing handlers.

**Alice, Bob, Carol (together):** Let's do it.

---

## ACTION ITEMS

1. **List all ~35-40 event types** with exact names and required fields
2. **Draft Space class** with all handler stubs (`_doEvent_*`)
3. **Implement event scheduling** system (pendingEvents, fireAt)
4. **Code the simplest flow**: game load → upgradeBegin → upgradeComplete
5. **Test determinism**: replay save file, verify same events fire

---

## NOTES

- **Alice's insight:** Events are state changes, not user actions. A user action can fire multiple events.
- **Bob's insight:** The code has to feel natural to write. If handlers are convoluted, the model is wrong.
- **Carol's insight:** Pre-compute everything you can. Handlers don't schedule future events—the scheduler does that. Keeps causality clear.
- **What we **didn't** do:** We didn't compromise with action fields or phase conditionals. We accepted that 35-40 types is fine.

---

## ROUND 3: THE GENERATOR AWAKENING

*(Five minutes of silence. They've been staring at the generator code.)*

**Bob:** Hold on. I just realized something. When we yield an event, the caller gets it **immediately**. Before we've processed the next one. Before we've caught up on time.

**Carol:** Right. That's the point. Screen1 gets events one at a time and can render each one.

**Alice:** But that means... the order matters. A lot. If we're iterating `for (const pending of this.pendingEvents)`, and we yield upgradeComplete, then the UI sees upgradeComplete. But what if two things fire at the same timestamp? Launchpad finishes AND Lab research finishes?

**Carol:** We process them in... whatever order they're in the array?

**Bob:** That's wrong. If both fire at timestamp 5000, the order we yield them changes the UI sequence. And if we save/load, we need to guarantee the same order.

**Alice:** So we need to **sort pendingEvents by timestamp**, not just iterate.

**Carol:** Okay, so:
```javascript
const sorted = this.pendingEvents
  .filter(e => e.fireAt <= now)
  .sort((a, b) => a.fireAt - b.fireAt);

for (const pending of sorted) {
  yield pending;
  this.processEvent(pending);
  // remove from this.pendingEvents
}
```

**Bob:** But if two events have the same timestamp, which fires first?

**Alice:** That's the thing. If both complete at the same millisecond, we need a tiebreaker. Event ID? Priority field?

**Carol:** Or we just accept that they fire in arbitrary order—but we **document** that as a quirk of the implementation. The important thing is they both fire before time moves forward.

**Bob:** But replay won't work. If we load a save and re-run, the order might be different, and the events might not be deterministic.

**Alice:** This is a problem.

---

## THE DETERMINISM CRISIS

**Carol:** Okay, so determinism requires:
1. **Sorted by timestamp** (clearly required)
2. **Tiebreaker for simultaneous events** (event ID, or priority, or entry order)
3. **User actions before timer events?** Or timer events first?

**Bob:** Think about it: player loads game at time 5000. Two things fire at 5000: an upgrade completes (timer), and the player immediately clicks "speedup" (user action). Which should fire first?

**Alice:** Probably the upgrade complete, then the speedup. Because the speedup acts on the now-completed upgrade.

**Carol:** But the generator doesn't know about the speedup yet. It just knows about pending events. User actions come from the input queue, which is only populated when Screen1 receives player input.

**Bob:** So the actual flow is:
1. Generator starts at time 5000
2. Fires all pending events scheduled for <= 5000
3. Yields each one
4. After generator yields, control returns to Screen1
5. Screen1 processes the input queue (player clicks)
6. Screen1 calls generator again
7. Generator processes the input queue events

**Alice:** Ah. So user actions are **never** interleaved with timer events. Timer events are drained first, then user actions, then timer events again.

**Carol:** Which means there's no ambiguity. The tiebreaker is: all timer events fire, then all input events fire.

**Bob:** But then if the player clicks "speedup" right as the upgrade completes, it feels simultaneous, but actually the upgrade fires, then speedup fires. That's good—speedup acts on completed state.

**Alice:** Wait, no. Speedup was supposed to reschedule the completion. But if completion already fired, speedup rescheduling it does nothing.

---

## THE SPEEDUP REDESIGN (AGAIN)

**Carol:** Right. So speedup is actually different from what we coded. Speedup should **fire BEFORE** the upgrade completes. It reschedules the completion to now, then the next iteration of the generator fires the (now imminent) completion.

**Bob:** So we need to know: when the player clicks speedup, is the upgrade still pending? If yes, reschedule. If no, the upgrade already completed, speedup does nothing.

**Alice:** Which means the code is:
```javascript
_doEvent_upgradeSpeedup(event) {
  const b = this.spaceport.getBuilding(event.buildingId);
  this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);

  // Is there a pending upgradeComplete?
  const pendingComplete = this.pendingEvents.find(e =>
    e.type === 'upgradeComplete' && e.buildingId === event.buildingId
  );
  if (pendingComplete) {
    pendingComplete.fireAt = event.timestamp;  // Reschedule to now
  }
  // If no pending, speedup is a no-op (upgrade already done)
}
```

**Carol:** And then what? After we process upgradeSpeedup, do we immediately re-sort and fire the rescheduled upgradeComplete? Or do we wait until the next call to update()?

**Bob:** If we re-sort and re-fire immediately, speedup is instant. The next yield is upgradeComplete. From the UI's perspective, speedup → complete happens in one animation frame.

**Alice:** But that breaks the generator abstraction. We're not just iterating pendingEvents anymore. We're reshuffling and re-iterating mid-process.

**Carol:** Unless... we don't reschedule mid-loop. We reschedule, but we don't re-process until the next call to update(). So:
1. Player clicks speedup
2. upgradeSpeedup event fired, processed, yielded
3. Speedup reschedules the pending completion
4. update() returns
5. Next RAF frame, Screen1 calls update() again
6. update() sees the rescheduled completion and fires it immediately

**Bob:** That feels right. Each call to update() processes one "batch" of events for a given timestamp.

**Alice:** But then there's a frame delay between speedup and completion. That might feel janky in the UI.

**Carol:** Unless Screen1 is smart. When it gets upgradeSpeedup event, it can look ahead: "Is there a pending completion?" If yes, it can show both animations in one frame.

**Bob:** That's getting complicated. Maybe speedup should just... fire an upgradeComplete event immediately?

---

## THE RADICAL IDEA

**Alice:** What if user actions can generate synchronous events? Like:

```javascript
_doEvent_upgradeSpeedup(event) {
  this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);

  // Find pending completion
  const pending = this.pendingEvents.find(e => ...);
  if (pending) {
    // Generate the completion event synchronously
    return {
      type: 'upgradeComplete',
      buildingId: event.buildingId,
      newLevel: /* calculate */
    };
  }
}
```

And then in the generator:

```javascript
*update(now) {
  // ... process timers ...

  for (const action of this.inputQueue) {
    const event = this.actionToEvent(action);
    yield event;
    const syncEvent = this.processEvent(event);

    if (syncEvent) {
      // User action generated a follow-up event
      yield syncEvent;
      this.processEvent(syncEvent);
    }
  }
}
```

**Carol:** No. That breaks determinism again. Now the number of events yielded depends on the game state when the action fires. Replay becomes fragile.

**Bob:** Right. Actions should always fire the same number of events, every time.

**Alice:** So speedup always fires speedup + completion, even if the upgrade already finished?

**Carol:** Or speedup always fires just speedup, and completion fires when it fires. Speedup doesn't guarantee immediate completion.

**Bob:** But that's weird UX. Player pays gems, expects instant result.

---

## THE REAL ANSWER

**Alice:** Okay, I think the issue is that we've been designing speedup wrong from the start. Speedup isn't "reschedule completion." Speedup is "change the cost structure."

What if the flow is:
1. Player clicks speedup while upgrade is pending
2. upgradeSpeedup event fires immediately (user action)
3. Handler checks: is upgrade pending? If yes, cancel it and fire upgradeComplete immediately **within the same handler call**

No, wait, that's event generation again.

**Carol:** What if we change the rule: **Speedup cancels the pending event and generates a completion event, but the completion event is synthetic.** It still gets yielded, still gets processed normally, but it's marked as `synthetic: true`.

```javascript
_doEvent_upgradeSpeedup(event) {
  const b = this.spaceport.getBuilding(event.buildingId);
  this.spaceport.setGems(this.spaceport.getGems() - event.gemsSpent);

  // Find and remove the pending completion
  const pendingIdx = this.pendingEvents.findIndex(e =>
    e.type === 'upgradeComplete' && e.buildingId === event.buildingId
  );
  if (pendingIdx !== -1) {
    this.pendingEvents.splice(pendingIdx, 1);

    // Queue a synthetic completion to fire immediately
    this.inputQueue.push({
      _synthetic: true,
      type: 'upgradeComplete',
      buildingId: event.buildingId,
      newLevel: /* calc */
    });
  }
}
```

**Bob:** Wait, that's even weirder. The handler is modifying the input queue?

**Alice:** Yeah, that's not clean.

**Carol:** Maybe the cleanest answer is the simplest: **Don't support speedup in the MVP.** Just have upgradeBegin and upgradeComplete. Speedup is post-launch.

**Bob:** _(laughs)_ We literally just decided to include speedup three sections ago.

**Alice:** Because we didn't think through the generator semantics. Now that we have, it's complicated.

---

## THE HONEST CONCLUSION

**Carol:** Okay, here's what's actually true:
1. **The generator model is sound.** Each iteration processes one logical moment in time.
2. **Events must be deterministic.** Replay must yield identical events in identical order.
3. **User actions are fast, timers are scheduled.** They don't interleave except at frame boundaries.
4. **But speedup is awkward.** It's the only action that modifies a scheduled event.

**Alice:** So either:
- **Option A:** Speedup doesn't reschedule. It just says "player paid gems." The upgrade still completes at original time. (Weird UX.)
- **Option B:** Speedup cancels the pending event and generates completion immediately. (Breaks the generator model slightly.)
- **Option C:** Don't have speedup. (Safe, but limits gameplay.)

**Bob:** What if we do Option B but we're honest about it? The generator is allowed to queue synthetic events that fire in the same update() call. We document it, we test it, we live with it.

**Carol:** I can live with that. Speedup is special because it's the only action that immediately completes a pending state. We handle it explicitly.

**Alice:** And we don't do this for any other event. Speedup is the exception, not the rule.

**Bob:** So the rule is: **Handlers must not generate events**. Except speedup. Speedup generates a completion event.

**Carol:** That's still a rule violation. Let me think...

What if the rule is: **Handlers can reschedule events, but cannot generate new ones.** Speedup reschedules upgradeComplete to fireAt = now. Then, at the end of the current update() iteration, we re-sort pending and process any that are now due.

**Alice:** That's cleaner. No synthetic events. Just "rescheduling is allowed."

**Bob:** So the generator becomes:
```javascript
*update(now) {
  let processed = true;
  while (processed) {
    processed = false;

    const pending = this.pendingEvents
      .filter(e => e.fireAt <= now)
      .sort((a, b) => a.fireAt - b.fireAt);

    for (const event of pending) {
      this.pendingEvents.remove(event);
      yield event;
      this.processEvent(event);  // May reschedule other events
      processed = true;
    }

    // Then user actions
    for (const action of this.inputQueue) {
      const event = this.actionToEvent(action);
      yield event;
      this.processEvent(event);  // May reschedule pending
      processed = true;  // Re-check pending after
    }
  }
}
```

**Carol:** That's a loop-until-stable model. After each event, we check if any new events became due and process them.

**Alice:** It works. It's clean. No magic.

**Bob:** How many times does this loop run in practice?

**Carol:** For most events, once. Speedup might cause two iterations: speedup processes, reschedules completion, loop detects completion is now due, processes it.

**Alice:** That's acceptable. It's rare enough.

---

## FINAL GENERATOR MODEL

**Carol:** Updated recommendation:

```javascript
*update(now) {
  let hasMore = true;

  while (hasMore) {
    hasMore = false;

    // Sort and process all pending events due by now
    const due = this.pendingEvents
      .filter(e => e.fireAt <= now)
      .sort((a, b) => a.fireAt - b.fireAt || a.id - b.id);

    for (const event of due) {
      this.pendingEvents.remove(event);
      yield event;
      this.processEvent(event);
      hasMore = true;  // Loop again to check if handler rescheduled anything
    }

    // Process input actions
    const actions = this.inputQueue.splice(0);  // Drain queue
    for (const action of actions) {
      const event = this.actionToEvent(action);
      yield event;
      this.processEvent(event);
      hasMore = true;  // Loop again to check if handler rescheduled anything
    }

    // If no events fired and no actions processed, we're done
    if (!due.length && !actions.length) {
      hasMore = false;
    }
  }
}
```

**Alice:** This is clean. Deterministic. Handles rescheduling. No synthetic events.

**Bob:** And it's testable. We can feed in a save state, call update(now), and verify the exact sequence of yielded events.

**Carol:** One rule: **Handlers can only reschedule existing pending events. They cannot create new ones.** Exception: actionToEvent can create multiple events from a single action if needed.

**Alice:** Wait, that's still event generation.

**Carol:** Right. So the rule is: **actionToEvent creates all events synchronously**. Like if the player clicks "build", we create {type: 'buildStart', ...} immediately. The action doesn't generate it; we generate it from the action.

**Bob:** And then the generator processes both the buildStart and any other pending events, in order.

**Alice:** Got it. The boundary is clear: action → events (one-shot, synchronous), events → state mutations (via handlers).

**Carol:** So the event sequence is fully deterministic. Load save, call update(now), get exact same events in exact same order. Replay works.

**Alice:** I'm satisfied. This model is clean.

**Bob:** Same. Let's go with this.

**Carol:** Updated architecture:
1. **~35-40 explicit event types**
2. **One handler per type**
3. **Handlers can reschedule pending events, never create new ones**
4. **Update() is a loop-until-stable generator**
5. **Actions convert to events synchronously, then processed**
6. **All events are deterministic and replayable**

---

## DECISION (ROUND 3)

**Alice:** I'm in.

**Bob:** I'm in.

**Carol:** Motion carries. Let's implement this.

---

## CRITICAL LEARNINGS

- **Alice's realization:** The generator is not "just iteration." It's a state machine that can loop until stable. Handlers have subtle power.
- **Bob's realization:** Speedup is the only action that modifies scheduling. We need to name that explicitly or it's a footgun.
- **Carol's realization:** Determinism requires sorting (by timestamp + id), draining queues, and loop-until-stable. It's more complex than it looks.
