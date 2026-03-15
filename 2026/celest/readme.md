# Fiver / Celest game

## Class Ownership Diagram
```
Program
+-- Fiver
+-- ScreenMain
    +-- FiverHelper (wraps Fiver)
    +-- MainLayout
    |   +-- Ux2
    |   +-- Celest
    +-- Mediator (coordinates others)
        +-- -> Fiver (ref)
        +-- -> FiverHelper (ref)
        +-- -> MainLayout (ref)
```

## Classes
### Program
* The top level engine
* Loads screens
* Runs the ReqeustAnimatinoFrame loop
* Creates and owns the current Fiver game core

### ScreenMain
* Creates and runs the UX for the main game mode
* Owns: MainLayout, FiverHelper and Mediator
* Has delegate funcs, for MainLayout - for the layout buttons to call

### Mediator
* Coordinates between Fiver game core, FiverHelper, and MainLayout
* Processes actions from helper and updates UI accordingly
* Handles slot updates with labels/values and dice display changes
* Runs the main update loop with actions processing

### Fiver
* Headless Yahtzee (Fiver) game engine with core logic
* Manages dice state, scoring, and game rules
* Provides command interface for roll, score, and reset actions
* Completely UI-agnostic, single player game state

### FiverHelper
* Wrapper around Fiver core that manages dice hold/roll states
* Provides command interface that forwards to Fiver game
* Tracks which dice are held, rolling, or available
* Bridges between UI interactions and core game logic

### MainLayout
* Main UI layout manager for the game interface
* Creates and positions header, status, dice, history, and button areas
* Uses Celest for canvas and Ux2 for UI components
* Handles score updates and slot display management

### Ux2
* Extended UI component library extending base Ux class
* Provides game-specific elements
