# Code Generation Instructions

## Use trailing commas
- When syntax allows, use trailing commas in multi-line object and array literals.

## Code Style Preferences

- **No comments in code**: Never add comments to code unless explicitly requested by the user
- **Clean minimal code**: Focus on writing self-explanatory, clean code without commentary
- **Let code speak**: Variable names, function names, and structure should be clear enough without comments

## When Code Comments Are Acceptable

- Only when the user explicitly asks for comments or documentation
- For complex algorithms where the logic is truly non-obvious
- For API documentation when specifically requested

## Examples

**Don't do this:**
```javascript
// Create canvas element
this.canvas = document.createElement('canvas');
this.ctx = this.canvas.getContext('2d');  // Set context
```

**Do this instead:**
```javascript
this.canvas = document.createElement('canvas');
this.ctx = this.canvas.getContext('2d');
```

## Particle System Architecture

### Core Components
- **SpriteA**: Texture atlas system for sprite loading and rendering
- **PartA**: Core particle engine for entity management and physics
- **FX**: Effects templates and emitter definitions loaded from JSON

### Design Decisions
- **Unified entities**: Emitters and particles share same struct - particles can spawn other particles
- **Two particle types**: Sprite particles (flipbook animations) + rect particles (colored squares)
- **Template-driven**: JSON definitions for emitter behavior, runtime instances for performance
- **Two emitter modes**: One-shot bursts (explosions) + persistent streams (fires, smoke)
- **Flexible lifetime**: TTL particles (auto-expire) + forever particles (manual cleanup)
- **Performance focused**: Object pooling, minimal string operations, efficient lookups

### File Structure
- `spritea.js`: Sprite sheet loading with grid-based JSON format
- `parta.js`: Particle system engine (render + physics)
- `actor/fx.js`: Effects data manager (loads particle.json templates)
- `data/particle.json`: Emitter definitions for naval battle effects
- `data/sheet00.json`: Sprite atlas metadata for animations

### API Patterns
```javascript
// One-shot effects
fx.emit("explosion", x, y)

// Persistent effects
fx.add("campfire", x, y)

// Sprite rendering
sprites.draw(ctx, spriteId, x, y, scale, frame)
```