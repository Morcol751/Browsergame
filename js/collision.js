// ==================================================
// TILE-KOLLISIONEN
// ==================================================
//
// Hier legst du fest, ob ein Tile begehbar ist.
// Es gibt genau zwei Möglichkeiten:
//
// COLLISION.NICHT_PASSIERBAR
// COLLISION.DRUEBERLAUFEN
//
// Die Zahlen 0-12 entsprechen den ore-IDs aus world.js.
// Einzelne Weltfelder können zusätzlich über
// world.setTileCollision(x, y, ...) überschrieben werden.
// ==================================================

export const COLLISION = {

NICHT_PASSIERBAR:"blocked",

DRUEBERLAUFEN:"walkable"

};



// ==================================================
// NORMALE MAP-TILES
// ==================================================

export const TILE_COLLISION = {

0: COLLISION.DRUEBERLAUFEN,     // Gras
1: COLLISION.NICHT_PASSIERBAR, // Baum / Holz
2: COLLISION.NICHT_PASSIERBAR, // Kohle
3: COLLISION.NICHT_PASSIERBAR, // Kupfer
4: COLLISION.NICHT_PASSIERBAR, // Eisen
5: COLLISION.NICHT_PASSIERBAR, // Silber
6: COLLISION.NICHT_PASSIERBAR, // Gold
7: COLLISION.NICHT_PASSIERBAR, // Diamant
8: COLLISION.NICHT_PASSIERBAR, // Kobalt
9: COLLISION.NICHT_PASSIERBAR, // Mithril
10: COLLISION.NICHT_PASSIERBAR,// Obsidian
11: COLLISION.NICHT_PASSIERBAR,// Adamant
12: COLLISION.NICHT_PASSIERBAR, // Stein
13: COLLISION.NICHT_PASSIERBAR, // Wasser
14: COLLISION.DRUEBERLAUFEN,     // Sand
15: COLLISION.NICHT_PASSIERBAR  // Kautschukbaum

};



// ==================================================
// GEBÄUDE
// ==================================================

export const BUILDING_COLLISION = {

crafting_table: COLLISION.NICHT_PASSIERBAR,

furnace: COLLISION.NICHT_PASSIERBAR,
wood_bridge: COLLISION.DRUEBERLAUFEN

};
