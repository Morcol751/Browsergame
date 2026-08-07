export class WorldMap{


constructor(world){


this.world=world;


this.open=false;



// ======================
// KARTEN-CACHE
// ======================
//
// Die Weltkarte wird intern weiterhin auf einem
// 900x900 Canvas gespeichert. Anders als vorher
// wird dieses Canvas aber NICHT mehr jedes Frame
// komplett neu aufgebaut.
//
// Neue erkundete Bereiche und geänderte Welt-Tiles
// aktualisieren nur die betroffenen Kartenpixel.
// ======================

this.canvas=document.createElement("canvas");

this.canvas.width=900;
this.canvas.height=900;

this.ctx=this.canvas.getContext("2d");


// Anzeigegröße

this.displaySize=500;


// Zoom

this.zoom=1;

this.minZoom=0.5;

this.maxZoom=5;


// Verschiebung

this.offsetX=0;

this.offsetY=0;

this.dragging=false;

this.lastMouseX=0;

this.lastMouseY=0;


// Letzte Spielerposition für Kartenmarker

this.player=null;



// ======================
// FOG OF WAR
// ======================

// Radius in Tiles,
// der um den Spieler herum
// aufgedeckt wird.

this.revealRadius=50;


// 0 = unentdeckt
// 1 = entdeckt

this.discovered =
new Uint8Array(
this.world.width *
this.world.height
);


// Liste der entdeckten Indizes.
// Dadurch muss beim Speichern nicht jedes Mal
// das komplette Uint8Array durchsucht werden.

this.discoveredList=[];


// Spezialfall für Debug/revealmap.
// So kann eine komplett aufgedeckte Karte im Save
// kompakt als {all:true} gespeichert werden.

this.allDiscovered=false;


// Damit revealAround nicht 60x pro Sekunde denselben
// Bereich erneut prüft, merken wir uns das letzte Tile.

this.lastRevealX=null;
this.lastRevealY=null;



// ======================
// FARBEN
// ======================

this.colors={

fog:"#000000",
grass:"#111111",

1:"#8B5A2B",  // Holz
2:"#202020",  // Kohle
3:"#B87333",  // Kupfer
4:"#8A8D8F",  // Eisen
5:"#D8D8D8",  // Silber
6:"#FFD700",  // Gold
7:"#39E6E6",  // Diamant
8:"#245BDB",  // Kobalt
9:"#9B4DFF",  // Mithril
10:"#24102F", // Obsidian
11:"#FF3E96", // Adamant
12:"#707070", // Stein

default:"#54606B" // Gebäude / Sonstiges

};


// RGB-Version derselben Palette für schnellen
// Komplettaufbau über ImageData.

this.colorsRGB={

fog:[0,0,0],
grass:[17,17,17],

1:[139,90,43],
2:[32,32,32],
3:[184,115,51],
4:[138,141,143],
5:[216,216,216],
6:[255,215,0],
7:[57,230,230],
8:[36,91,219],
9:[155,77,255],
10:[36,16,47],
11:[255,62,150],
12:[112,112,112],

default:[84,96,107]

};


// Cache startet komplett schwarz.

this.ctx.fillStyle=this.colors.fog;
this.ctx.fillRect(
0,
0,
this.canvas.width,
this.canvas.height
);


// Weltänderungen abonnieren.
// removeTile() und Gebäudeplatzierungen können dadurch
// einen bereits sichtbaren Kartenpixel sofort aktualisieren.

if(
this.world &&
typeof this.world.addTileChangeListener==="function"
){

this.world.addTileChangeListener(
(x,y)=>{

this.refreshWorldTile(x,y);

}
);

}



window.addEventListener(
"keydown",
(e)=>{


if(
e.key.toLowerCase()==="m"
){

this.open=!this.open;

}


if(
e.key==="Escape"
){

this.open=false;

}


}
);



window.addEventListener(
"wheel",
(e)=>{


if(!this.open)
return;


this.zoom +=
e.deltaY < 0
?
0.1
:
-0.1;


this.zoom =
Math.max(
this.minZoom,
Math.min(
this.zoom,
this.maxZoom
)
);


}
);



window.addEventListener(
"mousedown",
(e)=>{


if(!this.open)
return;


if(e.button===0){

this.dragging=true;

this.lastMouseX=e.clientX;
this.lastMouseY=e.clientY;

}


}
);



window.addEventListener(
"mouseup",
()=>{

this.dragging=false;

}
);



window.addEventListener(
"mousemove",
(e)=>{


if(
!this.open ||
!this.dragging
)
return;


let dx =
e.clientX-this.lastMouseX;

let dy =
e.clientY-this.lastMouseY;


this.offsetX+=dx;
this.offsetY+=dy;


this.lastMouseX=e.clientX;
this.lastMouseY=e.clientY;


}
);


}




// ======================
// FOG INDEX
// ======================

getDiscoveryIndex(x,y){

return(
y*this.world.width+x
);

}



// ======================
// TILE ENTDECKT?
// ======================

isDiscovered(x,y){

if(
x<0 ||
y<0 ||
x>=this.world.width ||
y>=this.world.height
){

return false;

}

return(
this.discovered[
this.getDiscoveryIndex(x,y)
]===1
);

}



// ======================
// WELT -> KARTENPIXEL
// ======================

getMapPixelX(worldX){

return Math.max(
0,
Math.min(
this.canvas.width-1,
Math.floor(
worldX *
this.canvas.width /
this.world.width
)
)
);

}


getMapPixelY(worldY){

return Math.max(
0,
Math.min(
this.canvas.height-1,
Math.floor(
worldY *
this.canvas.height /
this.world.height
)
)
);

}



// ======================
// KARTENPIXEL AUSWERTEN
// ======================
//
// Bei 2500x2500 Welt auf 900x900 Karte liegen
// mehrere Welt-Tiles in einem Kartenpixel.
// Wir prüfen deshalb nur diesen kleinen Block.
// Ressourcen/Gebäude haben Vorrang vor Gras.
// ======================

getMapPixelType(px,py){

let startX =
Math.floor(
px *
this.world.width /
this.canvas.width
);

let endX =
Math.min(
this.world.width,
Math.ceil(
(px+1) *
this.world.width /
this.canvas.width
)
);

let startY =
Math.floor(
py *
this.world.height /
this.canvas.height
);

let endY =
Math.min(
this.world.height,
Math.ceil(
(py+1) *
this.world.height /
this.canvas.height
)
);


let discoveredGround=false;


for(
let y=startY;
y<endY;
y++
){

let row =
this.world.tiles[y];

let baseIndex =
y*this.world.width;


for(
let x=startX;
x<endX;
x++
){

if(
this.discovered[
baseIndex+x
]!==1
)
continue;


discoveredGround=true;

let tile =
row[x];


if(tile!==0){

if(
tile.ore>=1 &&
tile.ore<=12
){

return tile.ore;

}

// Gebäude / sonstige belegte Tiles
return "default";

}

}

}


if(discoveredGround)
return "grass";

return "fog";

}



// ======================
// EINEN KARTENPIXEL
// AKTUALISIEREN
// ======================

refreshMapPixel(px,py){

if(
px<0 ||
py<0 ||
px>=this.canvas.width ||
py>=this.canvas.height
)
return;


let type =
this.getMapPixelType(
px,
py
);

this.ctx.fillStyle =
this.colors[type] ||
this.colors.default;

this.ctx.fillRect(
px,
py,
1,
1
);

}



// ======================
// GEÄNDERTES WELT-TILE
// ======================

refreshWorldTile(x,y){

if(
x<0 ||
y<0 ||
x>=this.world.width ||
y>=this.world.height
)
return;


// Ist der Bereich noch im Fog,
// muss auf der Karte nichts geändert werden.

if(
!this.allDiscovered &&
!this.isDiscovered(x,y)
)
return;


this.refreshMapPixel(
this.getMapPixelX(x),
this.getMapPixelY(y)
);

}



// ======================
// TILE AUFDECKEN
// ======================

// dirtyPixels ist optional und wird beim normalen
// Reveal benutzt, damit ein Kartenpixel pro Bewegung
// höchstens einmal neu berechnet wird.

discoverTile(x,y,dirtyPixels=null){

if(
x<0 ||
y<0 ||
x>=this.world.width ||
y>=this.world.height
){

return false;

}


let index =
this.getDiscoveryIndex(
x,
y
);


if(
this.discovered[index]===1
)
return false;


this.discovered[index]=1;


if(!this.allDiscovered){

this.discoveredList.push(
index
);

}


let px =
this.getMapPixelX(x);

let py =
this.getMapPixelY(y);


if(dirtyPixels){

let mapIndex =
py*this.canvas.width+px;


dirtyPixels.add(
mapIndex
);

}
else{

this.refreshMapPixel(
px,
py
);

}


return true;

}



// ======================
// BEREICH UM SPIELER
// AUFDECKEN
// ======================

revealAround(player){

if(!player)
return;


let centerX =
Math.floor(
player.x
);

let centerY =
Math.floor(
player.y
);


// Solange der Spieler noch im selben Welt-Tile steht,
// gibt es nichts Neues aufzudecken.

if(
centerX===this.lastRevealX &&
centerY===this.lastRevealY
)
return;


this.lastRevealX=centerX;
this.lastRevealY=centerY;


if(this.allDiscovered)
return;


let radius =
this.revealRadius;

let radiusSquared =
radius*radius;

let dirtyPixels =
new Set();


for(
let dy=-radius;
dy<=radius;
dy++
){

for(
let dx=-radius;
dx<=radius;
dx++
){

let distanceSquared =
dx*dx+
dy*dy;


if(
distanceSquared>
radiusSquared
)
continue;


this.discoverTile(
centerX+dx,
centerY+dy,
dirtyPixels
);

}

}


// Nur tatsächlich betroffene Kartenpixel neu zeichnen.

for(
let mapIndex of dirtyPixels
){

let px =
mapIndex %
this.canvas.width;

let py =
Math.floor(
mapIndex /
this.canvas.width
);

this.refreshMapPixel(
px,
py
);

}

}



// ======================
// CACHE KOMPLETT AUFBAUEN
// ======================
//
// Wird nur beim Laden eines Saves oder bei revealmap
// benötigt. Statt Millionen fillRect-Aufrufen wird ein
// 900x900 ImageData erzeugt und einmal aufs Canvas gelegt.
// ======================

rebuildCache(){

let imageData =
this.ctx.createImageData(
this.canvas.width,
this.canvas.height
);

let data =
imageData.data;

let offset=0;


for(
let py=0;
py<this.canvas.height;
py++
){

for(
let px=0;
px<this.canvas.width;
px++
){

let type =
this.getMapPixelType(
px,
py
);

let rgb =
this.colorsRGB[type] ||
this.colorsRGB.default;


data[offset]=rgb[0];
data[offset+1]=rgb[1];
data[offset+2]=rgb[2];
data[offset+3]=255;


offset+=4;

}

}


this.ctx.putImageData(
imageData,
0,
0
);

}



// ======================
// KOMPLETTE KARTE AUFDECKEN
// ======================

revealAll(){

this.discovered.fill(1);

this.discoveredList=[];

this.allDiscovered=true;

this.lastRevealX=null;
this.lastRevealY=null;


this.rebuildCache();

}



// ======================
// FOG OF WAR EXPORT
// ======================
//
// Neue Saves:
// {all:true} bei komplett aufgedeckter Karte
// oder {indices:[...]} im normalen Spiel.
//
// Dadurch muss beim Autosave nicht mehr das komplette
// Millionen-Tile-Array durchsucht werden.
// ======================

exportDiscovered(){

if(this.allDiscovered){

return {
all:true
};

}


return {
indices:[
...this.discoveredList
]
};

}



// ======================
// FOG OF WAR IMPORT
// ======================
//
// Unterstützt sowohl die neuen kompakten Daten als auch
// alte Spielstände, in denen direkt ein Array gespeichert war.
// ======================

importDiscovered(data){

this.discovered.fill(0);

this.discoveredList=[];

this.allDiscovered=false;

this.lastRevealX=null;
this.lastRevealY=null;


// Neuer Spezialfall: komplette Karte entdeckt.

if(
data &&
data.all===true
){

this.discovered.fill(1);

this.allDiscovered=true;

this.rebuildCache();

return;

}


let indices =
Array.isArray(data)
?
data
:
(
data &&
Array.isArray(data.indices)
?
data.indices
:
[]
);


for(
let index of indices
){

if(
Number.isInteger(index) &&
index>=0 &&
index<this.discovered.length &&
this.discovered[index]===0
){

this.discovered[index]=1;

this.discoveredList.push(
index
);

}

}


this.rebuildCache();

}



// ======================
// UPDATE
// ======================

draw(player){

this.player=player;


// Fog wird auch bei geschlossener Karte aufgedeckt.

this.revealAround(
player
);

}



// ======================
// DARSTELLUNG
// ======================

render(ctx,canvas){

if(!this.open)
return;


ctx.save();


// Hintergrund

ctx.fillStyle="rgba(0,0,0,0.85)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


let size =
this.displaySize;

let x =
canvas.width/2-size/2;

let y =
canvas.height/2-size/2;


ctx.save();


// Karte bewegen + zoomen

ctx.beginPath();

ctx.rect(
x,
y,
size,
size
);

ctx.clip();


ctx.translate(
x+size/2+this.offsetX,
y+size/2+this.offsetY
);

ctx.scale(
this.zoom,
this.zoom
);


// Fertigen Karten-Cache zeichnen.
// Das ist jetzt pro Frame nur noch EIN drawImage().

ctx.drawImage(
this.canvas,
-size/2,
-size/2,
size,
size
);


// ======================
// SPAWN-MARKER
// ======================

let spawnMapX =
-size/2 +
(
this.world.spawnX /
this.world.width
)*size;

let spawnMapY =
-size/2 +
(
this.world.spawnY /
this.world.height
)*size;


ctx.fillStyle="yellow";

ctx.beginPath();

ctx.arc(
spawnMapX,
spawnMapY,
6*(size/900),
0,
Math.PI*2
);

ctx.fill();


// ======================
// SPIELER-MARKER
// ======================

if(this.player){

let playerMapX =
-size/2 +
(
this.player.x /
this.world.width
)*size;

let playerMapY =
-size/2 +
(
this.player.y /
this.world.height
)*size;


ctx.fillStyle="red";

ctx.beginPath();

ctx.arc(
playerMapX,
playerMapY,
7*(size/900),
0,
Math.PI*2
);

ctx.fill();

}


ctx.restore();


// Rahmen

ctx.strokeStyle="white";
ctx.lineWidth=3;

ctx.strokeRect(
x,
y,
size,
size
);


ctx.fillStyle="white";
ctx.font="20px Arial";
ctx.textAlign="center";

ctx.fillText(
"Weltkarte",
canvas.width/2,
y-20
);


ctx.font="14px Arial";

ctx.fillText(
"M = schließen | Mausrad = Zoom | Ziehen = Verschieben",
canvas.width/2,
y+size+25
);


ctx.restore();

}


}
