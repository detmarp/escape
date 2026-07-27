# Space Race Game - Minimal Plan

## Core Concept
Time-based solo resource game. Build structures, collect resources, watch timers count down.

## Mechanics
- **Resources**: $M (money)
- **Buildings**:
  - Factory (energy production)
  - Assembly building (metal production)
  - Launch pad (spacecraft production)
  - Astronaut school (train astronauts)
  - Astronaut corps (astronaut management)
  - Laboratory (research/upgrades)
- **Actions**: Build, Upgrade, Collect
- **Time**: Real-time timers. Buildings take time to complete.

## UI Layout
- Header: Resource display (Energy / Metal / Crystals)
- Main: Building list with buttons
- Each building shows: level, production rate, time remaining

## Game Loop
- `update(unixTimestamp)`: Steps forward all processes
- Iterates through each process, checking if `dueTime <= currentTime`
- For each crossed threshold, generate event (e.g., building complete, production tick)
- Continue until all remaining processes have `dueTime > currentTime`
- Process: `{ id, type, dueTime, relatedBuildingId, ... }`

## Data Structure
- State: `{ money, buildings, processes, history, lastUpdate }`
- Building: `{ id, name, level, productionRate, buildTime, completedAt }`
- Process: `{ id, type, dueTime, buildingId }` (type: 'build', 'produce', etc.)
- History: `{ launches, missionsCompleted, disasters, retiredAstronauts, inMemoriamAstronauts }`

## Next Steps
1. Implement Space class with init/update/save/load
2. Build UI with Boreal
3. Add real-time update loop via RAF
4. Persist to localStorage
