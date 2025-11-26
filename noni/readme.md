## playtest notes
* Roe - resources need to snap to middle of the cell squares or it will really bug me

## x

all the possible board states

let's leave specials out of it for now.  I might have to redesign those.

* (game over)
* (place resource)
* (place resource) (place building)
* [undo resource] [end turn]
* [undo building] [end turn]
* (place building) [undo resource] [end turn]
* (place building) [undo building] [end turn]
* (place building) [undo resource] [end game]
* (place building) [undo building] [end game]

resource [color] [cell]
building [category] [cell] a, b, ... (list of resource cells to clear)

commands:
* [resource] [cell]
* [category] [cell], unresource [cell], ...
* endturn
* endgame

undo commands:
* unresource [cell]
* unbuilding [cell], [resource] [cell], ...

editor commands
* [resource] [cell]
* [category] [cell]
* unresource [cell]
* unbuilding [cell]
* endturn
* endgame
* unend

undo commands:
* unresource [cell]
* unbuilding [cell], [resource] [cell], ...

hand
* map of { category: card }

buildings
* [category, ...]
* (can exclude pink, once played)

resources
* [resource, ...], [resource, ...]
* (note that the resource in play is already appended to second list)

cell
* building
* resource
* wildcard
* points
* fed

building plan
* [resource] [cell], ...
* for a given category

resource playables
* [cell], ...

building placements
* array of "category" commands

score
* total, display, map of { category: points }, penalty

state
* new | underway | gameover

setup
* gameseed, [{category: cardcode}, ...], otherpink

## Meeples
Player can
* tap resource in resourcebin
* A - start dragging resource from resource bin
* drop resource back in resource bin
* drop resource on good cell
* drop resource somewhere else
* tap building in buildingbin
* B - start dragging building from buildingbin
* drop building back in buildingbin
* drop building on good cell, for legal placement
* drop building somewhere else
* undo resource by picking up last resource, goto A
* undo building by picking up last building, goto B

without animation, let's do
* populate resourcebin, or update resourcebin upon endturn
* populate buildingbin, or update buildingbin when building is built, or when undo building
* move illegal drop back to home bin
* move resource back in bounds, when it overlaps edge
* move building back in bounds, when it overlaps edge
* remove resource from cell when its building is built
* restore resource from cell upon building undo

pieces are created / destroyed
* resource created, in resourcebin, at populate time (start or endturn)
* resource created, in cell, at building undo
* resource destroyed, from cell, at building time
* building created, in buildingbin, at populate time (start or when building)
* building destroyed, from buildingbin, at building undo
*

## Finger-based gameplay actions
* (excluding specials)
* Forward play
  * Drag resource to board
  * Drag building to board
  * End turn
* Undo
  * Drag resource from board
  * Drag building from board
* Special
  * drag or select to do special action
  * We need special undo action, too
* Hint
  * Select building placement
  * Set building plan
  * Flip card
  * Rotate card shape

## Savegame definition
Saved: {"settings":{},"history":[{"gameSeed":596568,"timeStamp":1764004376921,"started":true,"cells":[[],[],[],[],[],[],[],[],[],[],[],[],["stone"],[],[],[]],"specials":[],"points":0,"resources":{"row":["wheat","stone","wood"],"drawPile":["wood","wheat","brick","stone","glass","wheat","glass","brick","brick","wood","glass","stone"],"picked":null},"deckHash":2754852755},{"gameSeed":705955,"timeStamp":1764004399294,"started":true,"cells":[[],[],[],[],[],[],[],[],[],[],[],[],["glass"],[],[],[]],"specials":[],"points":0,"resources":{"row":["stone","glass","glass"],"drawPile":["wheat","glass","stone","brick","wood","wheat","brick","stone","wood","wheat","wood","brick"],"picked":null},"deckHash":2754852755}],"count":857,"autocontinue":true,"quickstart":true,"autoquickstart":true,"editmode":false,"botbutton":true,"logsavedata":true}
savedata.js:45 0: {"gameSeed":596568,"timeStamp":1764004376921,"started":true,"cells":[[],[],[],[],[],[],[],[],[],[],[],[],["stone"],[],[],[]],"specials":[],"points":0,"resources":{"row":["wheat","stone","wood"],"drawPile":["wood","wheat","brick","stone","glass","wheat","glass","brick","brick","wood","glass","stone"],"picked":null},"deckHash":2754852755}
savedata.js:45 1: {"gameSeed":705955,"timeStamp":1764004399294,"started":true,"cells":[[],[],[],[],[],[],[],[],[],[],[],[],["glass"],[],[],[]],"specials":[],"points":0,"resources":{"row":["stone","glass","glass"],"drawPile":["wheat","glass","stone","brick","wood","wheat","brick","stone","wood","wheat","wood","brick"],"picked":null},"deckHash":2754852755}

A saved blob has
* settings: {}
* optional history: []

Each history[] is a savedgame blob

savedgame
* Example, typical, - WITHOUT specials
  * gameseed: int
  * timestamp: int
  * state: new|playing|gameover
  * cells: [[],[],[] x16 ], each cell has 0 or 1 strings
  * pool: ['wood','wheat' ... x15]
  * deck: ['cott','fact' ... x8], one for each 8 colors/categories
  * score: int
