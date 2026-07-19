# Gemma Purpose and Architecture

## Purpose
- Gemma is a small Windows Python tool for viewing and lightly validating source graphics data used by JS games.
- Primary workflow: drop a JSON sheet file, auto-associate a companion PNG, parse sprite/stamp definitions, and preview what was parsed.
- Keep iteration fast and practical for authoring/debugging game content.

## Scope
- Viewer first, validator second.
- Validation should be easy and lightweight, not strict schema-heavy.
- Defaults are preferred so partially complete JSON still previews.

## Layer Boundaries
- `partydata.py`
  - Pure data structures only.
  - `Stamp` contains integer source and origin values.
  - `Sprite` contains indexed stamps (supports sparse indexes) and computed size.
  - No file I/O and no rendering.

- `partymodel.py`
  - In-memory runtime state only.
  - Owns dictionaries for images, sprites, and global stamps.
  - Tracks selected/current image and simple load/error state.
  - Knows nothing about UX drawing.

- `partysystem.py`
  - Glue/middle layer.
  - Handles file paths, JSON loading, image loading, and parse mapping into model.
  - On JSON drop, attempts image association first, then parses JSON.
  - Keeps parsing simple with defaults.

- `partyux.py`
  - Draws and presents model/system state.
  - Renders text summary and parsed stamp previews.
  - Uses real stamp source rectangles from the associated image.

- `gemma.py`
  - App composition and run loop.
  - Instantiates one system and one UX (UX receives system).
  - Supports queued pre-run events for debug bootstrapping.

## Current JSON Parse Rules
- Root JSON is expected to be an object.
- If `sprites` exists, it should be an array.
- For each sprite entry:
  - `label`: if missing/blank, default to `basename.index`.
  - `source`: default `[0, 0, 16, 16]`.
  - `origin`: default `[0, 0]`.
  - `columns`: default `1`.
  - `frame`: default `0`.
- `columns > 1` generates multiple adjacent stamps left-to-right.
- Stamp indexes are integer-based and stored as `frame + columnOffset`.
- Global stamp keys use `spriteName.index`.

## Rendering Rules
- Draw one preview per known stamp.
- Use the actual stamp width/height from parsed source rect.
- Horizontal layout advances by each stamp width.
- Row wrap uses tallest stamp in the row to place the next row.
- Draw stamp key text under each preview.

## Practical Notes
- Keep the code toy-sized and easy to modify.
- Prefer clear, direct logic over generic abstraction.
- Add complexity only when content files demand it.