# Energy Canvas Engine
Version 2026-07-18

A lightweight 2D canvas engine built on a node/agent architecture, inspired by Unity's transform hierarchy.

## Core System

- **NodeTree** — hierarchical tree of nodes with parent/child transforms, recursive work and draw traversal
- **Agent** — components attached to nodes that handle logic (update, draw, TTL, events)
- **Actor pattern** — agents are actors with lifecycle methods (`added`, `update`, `draw`, `term`)
- **Event queue** — decoupled message passing between agents
- **TTL support** — nodes and agents can auto-expire after a set time

## Design Goals

Minimal overhead, no dependencies, canvas 2d only. Nodes handle transforms and hierarchy; agents handle behavior. Keep it simple.
