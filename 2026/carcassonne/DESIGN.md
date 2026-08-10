# Carcassonne Graphics Demo - Design Notes

## Overview
A fast, lightweight 2D canvas tile viewer with touch gestures. The viewport displays a grid of 64x64 sprite tiles with smooth panning and pixel-perfect zooming.

## Core Architecture

### Viewport System
- **Tile Grid**: All content is 64x64 tiles
- **Camera**: Tracks position and zoom level
- **Rendering**: Direct canvas drawing, tiles only

### Touch Input
- **Single Finger**: Pan with momentum/inertia
- **Two Fingers**: Zoom with pixel-perfect tracking
- **Inertia**: Averaged over 2 frames to reduce jitter

## Gesture Details

### Pan (One Finger)
1. Track finger movement delta between frames
2. Average velocity over current + previous frame
3. Continue momentum after finger release
4. Gradually decay velocity to zero

### Zoom (Two Fingers)
- Track distance between two touch points
- Calculate scale delta from distance change
- **Pixel-Perfect**: Zoom around the midpoint between fingers
  - Calculate screen position of midpoint
  - Map to world position at current zoom
  - Zoom (scale changes)
  - Adjust camera position so world position stays under midpoint
- Handle rotation gracefully (we do our best, no correction needed)

## File Structure
- `viewport.js`: Camera, viewport bounds, zoom/pan logic
- `tilemap.js`: Tile storage and access (prepared for future data)
- `renderer.js`: Canvas rendering, tile drawing
- `input.js`: Touch gesture detection and velocity tracking
- `index.html`: Canvas container
- `program.js`: Main loop and initialization

## Performance Notes
- No safety checks - assume proper setup
- Direct canvas operations
- Minimal object allocations per frame
- Separate concerns but pragmatic (not over-engineered)

## Future Extensibility
- Tile data loading (JSON format TBD)
- Sprite atlas system (link to boatgame's SpriteA if needed)
- Additional gestures (rotate, etc)
