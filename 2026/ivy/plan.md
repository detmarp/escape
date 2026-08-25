# Space Race Game - MVP Plan

## Core Concept
Time-based solo resource game. Build a space program from 1947 onward.
Real-time timers for buildings. Newspaper date advances through achievements.

## Architecture (implemented)
- **Command** → UI emits (e.g. button click)
- **Event** → queued in `pending[]` with a fire time
- **Action** → yielded from `*update()`, mutates state, reported to UI
- `SpaceGame` owns the generator loop, `SpaceCity`/`SpaceUtil` are stubs

## Resources (next)
- **Gold** ($) — earned from buildings, spent on construction
- **Gems** (💠) — premium currency, speedups, IAP-simulated in MVP

## Newspaper Date
- Starts: **January 1947**
- Base tick: 1 game month per real hour (slow drift)
- Achievement jumps: milestones add months/years
  - First rocket launch: +3 months
  - First satellite: +1 year
  - First manned flight: +2 years
  - Major failure: +6 months
- Newspaper date gates tech tree (blueprints have `minYear`)
- No rivals in MVP

## Headlines (stretch)
- Triggered by achievements and newspaper date milestones
- Displayed in old-timey newspaper font on screen
- Examples: "Sputnik Orbits Earth!", "Rocket Explodes on Pad"

## Buildings
- HQ — passive gold production
- Hangar — rocket storage
- Launch Pad — launch missions
- Bank — gold storage
- Laboratory — research

## Missions (MVP target: 3)
1. Suborbital hop (early, cheap)
2. Satellite launch (the big milestone)
3. Manned orbital (stretch)

## Data Files
- `data/city0.js` — default starting city
- `spacerules.js` — blueprints, costs, production rates
- More data files as test fixtures

## UI
- `Ux` class — div builders, buttons, text panels
- `Screen2` — main game screen with debug buttons
- Boreal for scrollable containers
- `Persist` — localStorage save/load

## Next Steps
1. Add gold + gems resources
2. Wire blueprints from spacerules into SpaceGame
3. Implement newspaper date with base tick + achievement jumps
4. Building production/collection ticks
5. Store generated from blueprints dynamically
6. Headlines display (stretch)
