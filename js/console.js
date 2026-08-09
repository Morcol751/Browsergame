export class Console{



constructor(game){



this.game = game;



this.open=false;



this.input="";



this.passwordMode=false;


this.passwordInput="";



this.passwordHash=
"ceb64a2951d0adb087fb86fb4577dc303132c4e3b5962c30736a3b0cb7be9363";







window.addEventListener(
"keydown",
async (e)=>{



// ======================
// KONSOLE / PASSWORT ÖFFNEN
// ======================



if(
e.key==="/" &&
!this.open &&
!this.passwordMode
){



e.preventDefault();


e.stopImmediatePropagation();



this.passwordMode=true;


this.passwordInput="";



if(this.game){


this.game.inputLocked=true;


}



return;



}








// ======================
// PASSWORT-EINGABE AKTIV
// ======================



if(
this.passwordMode
){



e.preventDefault();


e.stopImmediatePropagation();





// PASSWORT-EINGABE SCHLIESSEN


if(
e.key==="Escape"
){



this.passwordInput="";


this.passwordMode=false;




if(this.game){


this.game.inputLocked=false;


}



return;



}








// PASSWORT PRÜFEN


if(
e.key==="Enter"
){



let valid =
await this.checkPassword(
this.passwordInput
);



this.passwordInput="";


this.passwordMode=false;



if(valid){



this.open=true;


this.input="";



console.log(
"🔓 Debug-Konsole entsperrt."
);



}
else{



this.open=false;



console.warn(
"❌ Falsches Konsolen-Passwort."
);



if(this.game){


this.game.inputLocked=false;


}



}



return;



}








// BACKSPACE


if(
e.key==="Backspace"
){



this.passwordInput =
this.passwordInput.slice(
0,
-1
);



return;



}








// PASSWORT EINGEBEN


if(
e.key.length===1
){



this.passwordInput+=e.key;



}



return;



}









// ======================
// KONSOLE AKTIV
// ======================



if(
this.open
){



e.preventDefault();


e.stopImmediatePropagation();





// KONSOLE SCHLIESSEN


if(
e.key==="Escape"
){



this.input="";


this.open=false;




if(this.game){


this.game.inputLocked=false;


}



return;



}








// ENTER AUSFÜHREN


if(
e.key==="Enter"
){



this.execute(
this.input
);



this.input="";


this.open=false;




if(this.game){


this.game.inputLocked=false;


}



return;



}










// BACKSPACE


if(
e.key==="Backspace"
){



this.input =
this.input.slice(
0,
-1
);



return;



}










// TEXT EINGABE


if(
e.key.length===1
){



this.input+=e.key;



}




return;



}



},
true
);




}










async checkPassword(password){



try{



let encoder =
new TextEncoder();



let data =
encoder.encode(
password
);



let hashBuffer =
await crypto.subtle.digest(
"SHA-256",
data
);



let hashArray =
Array.from(
new Uint8Array(
hashBuffer
)
);



let hashHex =
hashArray
.map(
b=>b.toString(16).padStart(2,"0")
)
.join("");



return (
hashHex===this.passwordHash
);



}
catch(e){



console.error(
"Passwortprüfung fehlgeschlagen:",
e
);



return false;



}



}










execute(command){



let args =
command.trim().split(" ");







// ======================
// KOMPLETTE KARTE AUFDECKEN
// ======================



if(
args[0]==="revealmap"
){



if(
this.game.worldMap &&
typeof this.game.worldMap.revealAll==="function"
){



this.game.worldMap.revealAll();



console.log(
"🗺️ Komplette Weltkarte aufgedeckt!"
);



}



return;



}








// ======================
// ZU RESSOURCE TELEPORTIEREN
// ======================



if(
args[0]==="tp"
){



let target =
(args[1] || "").toLowerCase();





// Spawn


if(
target==="spawn"
){



this.game.player.x =
this.game.world.spawnX;


this.game.player.y =
this.game.world.spawnY;



console.log(
"📍 Zum Spawn teleportiert!"
);



return;



}








// Ressourcen-Namen -> ore-ID


let resourceIds = {



tree:1,
wood:1,
baum:1,
holz:1,


coal:2,
kohle:2,


copper:3,
kupfer:3,


iron:4,
eisen:4,


silver:5,
silber:5,


gold:6,


diamond:7,
diamant:7,


cobalt:8,
kobalt:8,


mithril:9,


obsidian:10,


adamant:11,


stone:12,
stein:12,


water:13,
wasser:13,


sand:14,


rubber_tree:15,
rubbertree:15,
rubber:15,
kautschuk:15,
kautschukbaum:15



};





let oreId =
resourceIds[target];




if(
oreId===undefined
){



console.log(
"❌ Unbekannte Ressource:",
target
);



console.log(
"Beispiele: tp iron | tp rubber_tree | tp water | tp stone | tp spawn"
);



return;



}








let world =
this.game.world;


let player =
this.game.player;


let bestTile=null;


let bestDistance=Infinity;






// Gesamte Welt nach dem nächstgelegenen Vorkommen durchsuchen.


for(
let y=0;
y<world.height;
y++
){



for(
let x=0;
x<world.width;
x++
){



let tile =
world.tiles[y][x];



if(
tile===0 ||
tile.ore!==oreId
)
continue;



let dx =
x-player.x;



let dy =
y-player.y;



let distance =
dx*dx+
dy*dy;



if(
distance<bestDistance
){



bestDistance=distance;



bestTile={

x:x,

y:y

};



}



}



}







if(!bestTile){



console.log(
"❌ Keine passende Ressource auf der Karte gefunden:",
target
);



return;



}









// Begehbares Feld direkt um die Ressource suchen.


let directions=[


{x:0,y:-1},

{x:1,y:0},

{x:0,y:1},

{x:-1,y:0},


{x:1,y:-1},

{x:1,y:1},

{x:-1,y:1},

{x:-1,y:-1}


];



let destination=null;





for(let dir of directions){



let tx =
bestTile.x+
dir.x;



let ty =
bestTile.y+
dir.y;



if(
typeof world.isWalkable==="function" &&
world.isWalkable(tx,ty)
){



destination={

x:tx,

y:ty

};



break;



}



}









// Falls direkt daneben nichts frei ist,
// in einem kleinen Radius ein begehbares Feld suchen.


if(!destination){



for(
let radius=2;
radius<=8 && !destination;
radius++
){



for(
let dy=-radius;
dy<=radius && !destination;
dy++
){



for(
let dx=-radius;
dx<=radius;
dx++
){



if(
Math.abs(dx)!==radius &&
Math.abs(dy)!==radius
)
continue;



let tx =
bestTile.x+
dx;



let ty =
bestTile.y+
dy;



if(
typeof world.isWalkable==="function" &&
world.isWalkable(tx,ty)
){



destination={

x:tx,

y:ty

};



break;



}



}



}



}



}







if(!destination){



console.log(
"❌ Ressource gefunden, aber kein begehbares Feld daneben:",
target
);



return;



}








player.x =
destination.x;



player.y =
destination.y;



console.log(
"🚀 Teleportiert zu",
target,
"| Ressource:",
bestTile.x+","+bestTile.y,
"| Spieler:",
destination.x+","+destination.y
);



return;



}








// ======================
// ITEM GEBEN
// ======================



if(
args[0]==="give"
){



let itemName =
args[1];



let amount =
parseInt(
args[2]
)
||
1;







if(
itemName==="all"
){



Object.values(
this.game.items
)
.forEach(
item=>{



if(
item.type==="resource"
){



this.game.backpack.add(
item,
100
);



}



}
);



return;



}







let item =
this.game.items[
itemName.toUpperCase()
];





if(item){



this.game.backpack.add(
item,
amount
);



}



}



}










draw(ctx){



if(
!this.open &&
!this.passwordMode
)
return;



ctx.save();







// ======================
// PASSWORTFENSTER
// ======================



if(
this.passwordMode
){



ctx.fillStyle=
"rgba(0,0,0,0.9)";



ctx.fillRect(
20,
20,
500,
75
);



ctx.strokeStyle="#777";


ctx.lineWidth=2;



ctx.strokeRect(
20,
20,
500,
75
);





ctx.fillStyle=
"white";



ctx.font=
"18px Arial";



ctx.fillText(
"🔒 Debug-Konsole – Passwort:",
30,
47
);





let masked =
"•".repeat(
this.passwordInput.length
);



ctx.font=
"22px Arial";



ctx.fillText(
"> "+masked,
30,
78
);



ctx.restore();



return;



}








// ======================
// NORMALE KONSOLE
// ======================



ctx.fillStyle=
"rgba(0,0,0,0.8)";



ctx.fillRect(
20,
20,
500,
40
);







ctx.fillStyle=
"white";



ctx.font=
"22px Arial";





ctx.fillText(
"> "+this.input,
30,
48
);







ctx.restore();



}




}
