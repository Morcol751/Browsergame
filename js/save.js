export class SaveManager{


constructor(game){


this.game=game;


this.autosaveTime=60000;


this.open=false;


this.message="";

this.messageTime=0;




this.button={

x:30,

y:0,

width:60,

height:60

};


// =================================
// INDEXEDDB
// =================================
//
// Spielstände liegen künftig in IndexedDB.
// localStorage wird nur noch für die automatische
// Übernahme alter Spielstände verwendet.

this.dbName="forgeveinSaveDB";

this.dbVersion=1;

this.storeName="saves";

this.saveKey="main";

this.legacyLocalStorageKey="factorioSave";


// Vorhandenen alten localStorage-Spielstand einmalig
// nach IndexedDB übernehmen.

this.migrateLegacySave().catch(
e=>{

console.error(
"Save-Migration fehlgeschlagen:",
e
);

}
);








// AUTOSAVE

setInterval(

()=>{


this.save(false);


},

this.autosaveTime


);








window.addEventListener(
"keydown",
(e)=>{



if(
e.key.toLowerCase()==="f5"
){


this.save(true);


}






if(
e.key==="Escape"
){


this.open=false;


}



});


}





// =================================
// INDEXEDDB ÖFFNEN
// =================================

openDatabase(){


return new Promise(
(resolve,reject)=>{


let request =
indexedDB.open(
this.dbName,
this.dbVersion
);


request.onupgradeneeded =
()=>{


let db =
request.result;


if(
!db.objectStoreNames.contains(
this.storeName
)
){


db.createObjectStore(
this.storeName
);


}


};


request.onsuccess =
()=>{


resolve(
request.result
);


};


request.onerror =
()=>{


reject(
request.error
);


};


}
);


}







// =================================
// SAVE IN INDEXEDDB SCHREIBEN
// =================================

async writeIndexedSave(json){


let db =
await this.openDatabase();


return new Promise(
(resolve,reject)=>{


let transaction =
db.transaction(
this.storeName,
"readwrite"
);


let store =
transaction.objectStore(
this.storeName
);


store.put(
json,
this.saveKey
);


transaction.oncomplete =
()=>{


db.close();


resolve();


};


transaction.onerror =
()=>{


let error =
transaction.error;


db.close();


reject(error);


};


transaction.onabort =
()=>{


let error =
transaction.error;


db.close();


reject(error);


};


}
);


}







// =================================
// SAVE AUS INDEXEDDB LESEN
// =================================

async readIndexedSave(){


let db =
await this.openDatabase();


return new Promise(
(resolve,reject)=>{


let transaction =
db.transaction(
this.storeName,
"readonly"
);


let store =
transaction.objectStore(
this.storeName
);


let request =
store.get(
this.saveKey
);


request.onsuccess =
()=>{


let result =
request.result;


db.close();


resolve(
typeof result==="string"
?
result
:
null
);


};


request.onerror =
()=>{


let error =
request.error;


db.close();


reject(error);


};


}
);


}







// =================================
// SAVE AUS INDEXEDDB LÖSCHEN
// =================================

async deleteIndexedSave(){


let db =
await this.openDatabase();


return new Promise(
(resolve,reject)=>{


let transaction =
db.transaction(
this.storeName,
"readwrite"
);


let store =
transaction.objectStore(
this.storeName
);


store.delete(
this.saveKey
);


transaction.oncomplete =
()=>{


db.close();


resolve();


};


transaction.onerror =
()=>{


let error =
transaction.error;


db.close();


reject(error);


};


transaction.onabort =
()=>{


let error =
transaction.error;


db.close();


reject(error);


};


}
);


}







// =================================
// ALTEN LOCALSTORAGE-SAVE MIGRIEREN
// =================================

async migrateLegacySave(){


let legacySave =
localStorage.getItem(
this.legacyLocalStorageKey
);


if(!legacySave)
return false;


// Falls bereits ein IndexedDB-Save existiert,
// wird der alte Save nicht darübergeschrieben.

let existing =
await this.readIndexedSave();


if(existing){


localStorage.removeItem(
this.legacyLocalStorageKey
);


console.log(
"📦 Alter localStorage-Save entfernt – IndexedDB-Save existiert bereits."
);


return false;


}


await this.writeIndexedSave(
legacySave
);


localStorage.removeItem(
this.legacyLocalStorageKey
);


console.log(
"✅ Alter localStorage-Spielstand nach IndexedDB migriert."
);


return true;


}








showMessage(text){


this.message=text;


this.messageTime=
Date.now()+2500;


}









async save(show=true){



let game=this.game;



// Ressourcen werden extrem kompakt gespeichert:
//
// Eine einzige 32-Bit-Zahl enthält:
// - 25 Bit Weltindex
// - 4 Bit Erztyp
// - 2 Bit Qualität
// - 1 Bit "liegt auf Sand"
//
// Damit vermeiden wir zehntausende JSON-Objekte.
// 25 Bit Index reichen bis 33.554.432 Weltfelder
// (also auch für 5000x5000).
let compactTiles=[];


// Wasser und Sand werden nicht mehr Tile für Tile gespeichert.
// Stattdessen speichern wir zusammenhängende Bereiche pro Zeile.
//
// Ein Run:
// [y, startX, laenge, ore]
//
// Beispiel:
// [120, 400, 18, 13]
// = in Zeile 120 sind X 400-417 Wasser.


let terrainRuns=[];

let resourceCounts={
trees:0,rubberTrees:0,stone:0,coal:0,copper:0,iron:0,silver:0,
gold:0,diamond:0,cobalt:0,mithril:0,obsidian:0,adamant:0
};






// =================================
// WELT SPEICHERN
// =================================


for(
let y=0;
y<game.world.height;
y++
){


let activeTerrain=0;

let runStart=0;

let runLength=0;



let flushTerrainRun=()=>{


if(
activeTerrain===13 ||
activeTerrain===14
){


terrainRuns.push([

y,

runStart,

runLength,

activeTerrain

]);


}


activeTerrain=0;

runLength=0;


};




for(
let x=0;
x<game.world.width;
x++
){



let tile =
game.world.tiles[y][x];

if(tile!==0 && !tile.building){
switch(tile.ore){
case 1:resourceCounts.trees++;break;
case 2:resourceCounts.coal++;break;
case 3:resourceCounts.copper++;break;
case 4:resourceCounts.iron++;break;
case 5:resourceCounts.silver++;break;
case 6:resourceCounts.gold++;break;
case 7:resourceCounts.diamond++;break;
case 8:resourceCounts.cobalt++;break;
case 9:resourceCounts.mithril++;break;
case 10:resourceCounts.obsidian++;break;
case 11:resourceCounts.adamant++;break;
case 12:resourceCounts.stone++;break;
case 15:resourceCounts.rubberTrees++;break;
}
}



// =================================
// LEERES FELD
// =================================


if(tile===0){


flushTerrainRun();

continue;


}



// =================================
// GEBÄUDE
// =================================
//
// Gebäude werden bereits separat in
// data.buildings gespeichert.
//
// Deshalb nicht nochmal als normales
// Welt-Tile in den Save schreiben.
// =================================


if(tile.building){


flushTerrainRun();

continue;


}



// =================================
// REINES WASSER / REINER SAND
// =================================
//
// Nur Terrain ohne Ressource/Gebäude
// wird komprimiert.
// =================================


if(
tile.ore===13 ||
tile.ore===14
){


if(activeTerrain===tile.ore){


runLength++;


}
else{


flushTerrainRun();


activeTerrain=tile.ore;

runStart=x;

runLength=1;


}


continue;


}



// =================================
// NORMALES TILE / RESSOURCE
// =================================


flushTerrainRun();


let index =
y*game.world.width+x;


// 25 Bit Weltindex
if(index>0x1FFFFFF){

throw new Error(
"Welt ist fuer das kompakte Save-Format zu gross."
);

}


let ore =
(tile.ore || 0) & 0xF;


let quality =
(tile.quality || 1) & 0x3;


let onSand =
(tile.underlyingOre===14)
? 1
: 0;


let packed =
(
(index & 0x1FFFFFF) |
(ore << 25) |
(quality << 29) |
(onSand << 31)
) >>> 0;


compactTiles.push(packed);



}


// Run am Ende der Zeile abschließen.

flushTerrainRun();



}








let data={



player:{


x:game.player.x,

y:game.player.y


},






world:{


width:game.world.width,


height:game.world.height,


// Neues kompaktes Ressourcenformat.
compactTiles:compactTiles,


// Kompakt gespeicherte Wasser-/Sandflächen.
terrainRuns:terrainRuns,


collisionOverrides:
game.world.exportTileCollisionOverrides()


},




// =================================
// FOG OF WAR / WELTKARTE SPEICHERN
// =================================

worldMap:{


discovered:
(
game.worldMap &&
typeof game.worldMap.exportDiscovered==="function"
)
? game.worldMap.exportDiscovered()
: []


},



// WICHTIG:
// Gebäude separat speichern

buildings:
game.building.buildings,









backpack:
game.backpack.items,








inventory:
game.inventory.slots







};









try{



let json =
JSON.stringify(data);


console.log(
"========== SAVE DEBUG =========="
);

console.log(
"Speicher:",
"IndexedDB"
);

console.log(
"Gesamter JSON:",
Math.round(json.length/1024),
"KB"
);

console.log(
"Kompakte Ressourcen-Tiles:",
compactTiles.length
);

console.log(
"Terrain-Runs (Wasser/Sand):",
terrainRuns.length
);

console.log(
"World-Block:",
Math.round(
JSON.stringify(data.world).length/1024
),
"KB"
);

console.log(
"WorldMap-Block:",
Math.round(
JSON.stringify(data.worldMap).length/1024
),
"KB"
);

console.log("========== RESSOURCEN DEBUG ==========");
console.log("Bäume:",resourceCounts.trees);
console.log("Kautschukbäume:",resourceCounts.rubberTrees);
console.log("Steine:",resourceCounts.stone);
console.log("Kohle:",resourceCounts.coal);
console.log("Kupfer:",resourceCounts.copper);
console.log("Eisen:",resourceCounts.iron);
console.log("Silber:",resourceCounts.silver);
console.log("Gold:",resourceCounts.gold);
console.log("Diamant:",resourceCounts.diamond);
console.log("Kobalt:",resourceCounts.cobalt);
console.log("Mithril:",resourceCounts.mithril);
console.log("Obsidian:",resourceCounts.obsidian);
console.log("Adamant:",resourceCounts.adamant);
console.log(
"Erze gesamt:",
resourceCounts.coal+resourceCounts.copper+resourceCounts.iron+
resourceCounts.silver+resourceCounts.gold+resourceCounts.diamond+
resourceCounts.cobalt+resourceCounts.mithril+resourceCounts.obsidian+
resourceCounts.adamant
);
console.log("======================================");

console.log(
"================================"
);



await this.writeIndexedSave(

json

);





console.log(

"Spiel gespeichert:",

Math.round(
json.length/1024
),

"KB | Ressourcen-Tiles:",

compactTiles.length,

"| Terrain-Runs:",

terrainRuns.length

);





if(show){


this.showMessage(

"💾 Spiel gespeichert!"

);


}



}

catch(e){



console.error(

"Speichern fehlgeschlagen:",

e

);



this.showMessage(

"❌ Speicherfehler!"

);



}



}









async load(){



let save =
await this.readIndexedSave();


// Sicherheits-Fallback für einen alten Save,
// falls die automatische Migration beim Start
// noch nicht fertig gewesen sein sollte.

if(!save){


let legacySave =
localStorage.getItem(
this.legacyLocalStorageKey
);


if(legacySave){


save=legacySave;


try{


await this.writeIndexedSave(
legacySave
);


localStorage.removeItem(
this.legacyLocalStorageKey
);


console.log(
"✅ Alter localStorage-Spielstand beim Laden nach IndexedDB migriert."
);


}
catch(e){


console.warn(
"Migration beim Laden fehlgeschlagen – alter Save wird trotzdem geladen.",
e
);


}


}


}





if(!save){



this.showMessage(

"❌ Kein Spielstand vorhanden"

);



return false;



}







let data =
JSON.parse(save);



let game=this.game;









// =================================
// WELT RESET
// =================================


for(
let y=0;
y<game.world.height;
y++
){


for(
let x=0;
x<game.world.width;
x++
){


game.world.tiles[y][x]=0;


}



}









// =================================
// WASSER / SAND KOMPAKT LADEN
// =================================
//
// Neue Saves speichern Wasser und Sand
// als Runs. Alte Saves besitzen dieses
// Feld nicht und funktionieren weiterhin,
// weil dort Wasser/Sand noch in tiles
// enthalten waren.
// =================================


if(
data.world &&
Array.isArray(data.world.terrainRuns)
){


for(
let run of data.world.terrainRuns
){


if(
!Array.isArray(run) ||
run.length<4
)
continue;


let y=run[0];

let startX=run[1];

let length=run[2];

let ore=run[3];


if(
(ore!==13 && ore!==14) ||
!Number.isInteger(y) ||
!Number.isInteger(startX) ||
!Number.isInteger(length) ||
length<=0
)
continue;


if(
y<0 ||
y>=game.world.height
)
continue;


let endX =
Math.min(
game.world.width,
startX+length
);


for(
let x=Math.max(0,startX);
x<endX;
x++
){


game.world.tiles[y][x]={

ore:ore,

quality:1

};


}


}


}







// =================================
// KOMPAKTE RESSOURCEN LADEN
// =================================
//
// Neue Saves: eine 32-Bit-Zahl pro Tile.
// Alte Saves mit data.world.tiles werden
// darunter weiterhin unterstützt.
// =================================


if(
data.world &&
Array.isArray(data.world.compactTiles)
){


for(
let packed of data.world.compactTiles
){


if(
!Number.isInteger(packed) ||
packed<0
)
continue;


// Auf unsigned 32 Bit normalisieren.
packed = packed >>> 0;


let index =
packed & 0x1FFFFFF;


let ore =
(packed >>> 25) & 0xF;


let quality =
(packed >>> 29) & 0x3;


let onSand =
(packed >>> 31) & 0x1;


let x =
index % game.world.width;


let y =
Math.floor(
index / game.world.width
);


if(
x<0 ||
y<0 ||
x>=game.world.width ||
y>=game.world.height ||
ore<=0 ||
ore===13 ||
ore===14
)
continue;


game.world.tiles[y][x]={

ore:ore,

quality:quality || 1,

underlyingOre:
onSand
? 14
: 0

};


}


}




// =================================
// NORMALE TILES LADEN
// =================================


if(
data.world &&
!Array.isArray(data.world.compactTiles) &&
data.world.tiles
){



for(
let tile of data.world.tiles
){



game.world.tiles[tile.y][tile.x]={


ore:tile.o,

quality:tile.q,

underlyingOre:tile.u || 0

};



}



}






// =================================
// INDIVIDUELLE TILE-KOLLISIONEN LADEN
// =================================

game.world.importTileCollisionOverrides(
(data.world && data.world.collisionOverrides) || []
);




// =================================
// SPIELER
// =================================


if(data.player){


game.player.x =
data.player.x;


game.player.y =
data.player.y;


}





// =================================
// GEBÄUDE LADEN
// =================================


game.building.buildings =
data.buildings || [];





// Gebäude aus Liste wieder erzeugen

for(
let building of game.building.buildings
){


for(
let dx=0;
dx<building.width;
dx++
){


for(
let dy=0;
dy<building.height;
dy++
){



let buildingPart =
(dx===0 && dy===0)
?
"origin"
:
"child";


game.world.tiles
[
building.y+dy
]
[
building.x+dx
]
=
{


building:
building.id,

buildingPart:
buildingPart,

underlyingOre:(()=>{
if(Array.isArray(building.underlyingTiles)){
let saved=building.underlyingTiles.find(
t=>t.dx===dx && t.dy===dy
);
if(saved) return saved.ore || 0;
}
if(building.id==="wood_bridge") return 13;
return building.underlyingOre || 0;
})(),

ore:0,


quality:1



};



}



}



}



// =================================
// FOG OF WAR / WELTKARTE LADEN
// =================================
//
// Erst NACH den Gebäuden importieren, damit der
// Karten-Cache beim Neuaufbau bereits die komplette
// geladene Welt inklusive Gebäude sieht.

if(
game.worldMap &&
typeof game.worldMap.importDiscovered==="function"
){


game.worldMap.importDiscovered(
(data.worldMap && data.worldMap.discovered) || []
);


}



// =================================
// BACKPACK / INVENTAR
// =================================


game.backpack.items =
data.backpack || [];





game.inventory.slots =
data.inventory || [];









console.log(

"Spiel geladen"

);





this.showMessage(

"📂 Spiel geladen!"

);





return true;



}









async reset(){



try{


await this.deleteIndexedSave();


}
catch(e){


console.error(
"IndexedDB-Spielstand konnte nicht gelöscht werden:",
e
);


}


// Alten Save ebenfalls entfernen,
// falls noch einer vorhanden ist.

localStorage.removeItem(
this.legacyLocalStorageKey
);


location.reload();



}















draw(ctx,canvas){



this.button.x = 30;


this.button.y =
canvas.height-90;





ctx.save();




// ======================
// BUTTON
// ======================


ctx.fillStyle="#303030";


ctx.fillRect(

this.button.x,

this.button.y,

this.button.width,

this.button.height

);





ctx.strokeStyle="#777";


ctx.lineWidth=3;



ctx.strokeRect(

this.button.x,

this.button.y,

this.button.width,

this.button.height

);







ctx.fillStyle="white";


ctx.font="32px Arial";


ctx.textAlign="center";


ctx.textBaseline="middle";



ctx.fillText(

"💾",

this.button.x+30,

this.button.y+30

);









// ======================
// MENÜ
// ======================


if(this.open){



let width=300;


let height=220;



let x =
canvas.width/2-width/2;



let y =
canvas.height/2-height/2;







ctx.fillStyle=
"rgba(0,0,0,0.9)";



ctx.fillRect(

x,

y,

width,

height

);






ctx.strokeStyle="white";


ctx.lineWidth=3;



ctx.strokeRect(

x,

y,

width,

height

);






ctx.fillStyle="white";


ctx.font="26px Arial";


ctx.textAlign="center";



ctx.fillText(

"Spielstand",

canvas.width/2,

y+40

);







ctx.font="20px Arial";



ctx.fillText(

"💾 Speichern",

canvas.width/2,

y+90

);





ctx.fillText(

"📂 Laden",

canvas.width/2,

y+130

);





ctx.fillText(

"🗑 Reset",

canvas.width/2,

y+170

);



}









// ======================
// MELDUNG
// ======================


if(

Date.now()<this.messageTime

){



ctx.fillStyle=

"rgba(0,0,0,0.7)";



ctx.fillRect(

canvas.width/2-150,

canvas.height-150,

300,

45

);






ctx.fillStyle="white";


ctx.font="22px Arial";


ctx.textAlign="center";


ctx.textBaseline="middle";



ctx.fillText(

this.message,

canvas.width/2,

canvas.height-128

);



}







ctx.restore();



}




















click(mx,my,canvas){



this.button.x = 30;


this.button.y =
canvas.height-90;









// ======================
// BUTTON
// ======================


if(


mx>=this.button.x &&


mx<=this.button.x+this.button.width &&


my>=this.button.y &&


my<=this.button.y+this.button.height


){



this.open =
!this.open;



return;



}









if(!this.open)

return;







let width=300;


let height=220;



let x =
canvas.width/2-width/2;



let y =
canvas.height/2-height/2;









if(


mx<x ||


mx>x+width ||


my<y ||


my>y+height


){



this.open=false;



return;



}











// ======================
// SPEICHERN
// ======================


if(


my>y+60 &&


my<y+110


){



this.save(true);



}











// ======================
// LADEN
// ======================


else if(


my>y+110 &&


my<y+150


){



this.load();



}











// ======================
// RESET
// ======================


else if(


my>y+150 &&


my<y+200


){



if(

confirm(

"Spielstand wirklich löschen?"

)

){



this.reset();



}



}



}



}
