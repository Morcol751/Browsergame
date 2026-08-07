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









showMessage(text){


this.message=text;


this.messageTime=
Date.now()+2500;


}









save(show=true){



let game=this.game;



let tiles=[];






// =================================
// WELT SPEICHERN
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



let tile =
game.world.tiles[y][x];



if(tile!==0){



tiles.push({

x:x,

y:y,

o:tile.ore,

q:tile.quality || 1

});



}



}



}








let data={



player:{


x:game.player.x,

y:game.player.y


},






world:{


width:game.world.width,


height:game.world.height,


tiles:tiles,


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



localStorage.setItem(

"factorioSave",

json

);





console.log(

"Spiel gespeichert:",

Math.round(
json.length/1024
),

"KB"

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









load(){



let save =
localStorage.getItem(
"factorioSave"
);





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
// NORMALE TILES LADEN
// =================================


if(
data.world &&
data.world.tiles
){



for(
let tile of data.world.tiles
){



game.world.tiles[tile.y][tile.x]={


ore:tile.o,


quality:tile.q


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









reset(){



localStorage.removeItem(

"factorioSave"

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