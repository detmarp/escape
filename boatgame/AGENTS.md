# Ella Game Development Plan

*Focus guide for executive function support - concrete steps to avoid decision paralysis*

## Current Status: ScreenDemo Phase
You're working in `screendemo.js` - this is your main sandbox.

## Immediate Next Steps (Pick ONE)

### Phase 1: Bot Logic (botb.js)
**GOAL**: Make the AI smarter and more interesting to watch

**Current**: Basic chooseTarget() method exists
**Next**:
- [ ] Add hunt mode (when hit a ship, search adjacent cells)
- [ ] Add target priority (edges, corners, ship-sized gaps)
- [ ] Test with simple console.log to see decisions

**Files**: `botb.js` (line ~40 chooseTarget method)

### Phase 2: Demo Controls
**GOAL**: Step/pause buttons that actually work

**Current**: Buttons exist but handlers are empty
**Next**:
- [ ] Add pause/run state to screendemo
- [ ] Wire up _onRun() and _onStep() methods
- [ ] Make demo respect pause state in _nextTurn()

**Files**: `screendemo.js` (lines ~170-190)

## Later Phases (Don't start until current phase done)

### Phase 3: DemoPlayer Flow
**GOAL**: Smooth, visual turn sequence

**Current**: demoplayer.js has state machine plan but incomplete
**Target**: Full animation sequence with timing
**Files**: `actor/demoplayer.js`

### Phase 4: Effects System
**GOAL**: Visual polish - splashes, explosions, particles

**Current**: Placeholders in comments
**Target**: Canvas-based particle effects
**Files**: New `effects/` folder

## Focus Rules
1. **One phase at a time** - finish before moving on
2. **Baby steps** - each change should be ~10 lines max
3. **Test immediately** - see it working before next step
4. **Use console.log liberally** - debug as you go

## When Stuck
- Check browser console for errors
- Add console.log to see what's happening
- Take a 5-minute break
- Ask for specific help on the current step only

## Code Style Guidelines

### DO
- **Modern JS patterns** - use arrow functions, destructuring, modules
- **Separation of responsibilities** - keep concerns isolated
- **Logic/UX separation** - if a module only needs logic, don't mix in UI code
- **Crisp, short code** - aim for clarity over verbosity
- **Always use {} brackets** - even for one-liners

```javascript
// Good
if (condition) {
  doThing();
}

// Bad
if (condition) doThing();
```

### DON'T
- **Add comments** unless truly needed for complex logic
- **Mix concerns** - keep game logic separate from rendering
- **Verbose code** when concise is just as clear

---
*Updated: May 2, 2026*
*Current focus: Phase 1 (Bot Logic) OR Phase 2 (Demo Controls) - pick one!*