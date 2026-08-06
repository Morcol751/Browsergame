import {ITEMS} from "./items.js";



export class Player{



constructor(x,y,audio){


this.x=x;
this.y=y;


this.speed=0.2;


// ======================
// CHARAKTER SPRITE
// ======================

this.sprite=new Image();
this.sprite.src="./assets/player/player_walk.png";

this.spriteFrameWidth=32;
this.spriteFrameHeight=48;
this.spriteFrames=4;

this.direction="down";
this.walking=false;
this.animationFrame=0;
this.animationTimer=0;
this.animationSpeed=120;


this.keys={};



this.mouseX=0;
this.mouseY=0;



this.mining=false;


this.mineStart=0;

this.miningTile=null;


this.mineTime=10000;



this.audio=audio;



this.message="";

this.messageTime=0;






window.addEventListener(
"keydown",
(e)=>{


this.keys[
e.key.toLowerCase()
]=true;


});







window.addEventListener(
"keyup",
(e)=>{


this.keys[
e.key.toLowerCase()
]=false;


});









window.addEventListener(
"mousedown",
(e)=>{


if(e.button===0){


this.mining=true;


}



});









window.addEventListener(
"mouseup",
(e)=>{


if(e.button===0){


this.mining=false;


this.stopMining();


this.mineStart=0;

this.miningTile=null;


}



});



}







stopMining(){


if(this.audio){


this.audio.stopMiningSound();


}



}








update(world){

let moved=false;


// ======================
// VERTIKALE BEWEGUNG
// ======================

if(this.keys["w"]){

this.direction="up";

let newY=this.y-this.speed;

if(
!world ||
this.canOccupy(world,this.x,newY)
){
this.y=newY;
moved=true;
}

}


if(this.keys["s"]){

this.direction="down";

let newY=this.y+this.speed;

if(
!world ||
this.canOccupy(world,this.x,newY)
){
this.y=newY;
moved=true;
}

}


// ======================
// HORIZONTALE BEWEGUNG
// ======================

if(this.keys["a"]){

this.direction="left";

let newX=this.x-this.speed;

if(
!world ||
this.canOccupy(world,newX,this.y)
){
this.x=newX;
moved=true;
}

}


if(this.keys["d"]){

this.direction="right";

let newX=this.x+this.speed;

if(
!world ||
this.canOccupy(world,newX,this.y)
){
this.x=newX;
moved=true;
}

}


this.walking=moved;

if(this.walking){

let now=Date.now();

if(now-this.animationTimer>=this.animationSpeed){
this.animationFrame=(this.animationFrame+1)%this.spriteFrames;
this.animationTimer=now;
}

}
else{
this.animationFrame=0;
this.animationTimer=Date.now();
}

}




// ======================
// SPIELER-KOLLISIONSBOX
// ======================
//
// x/y beschreiben das 1x1-Tile, auf dem die Füße des
// Spielers stehen. Der 32x48-Sprite darf weiterhin 16 Pixel
// nach oben über dieses Tile hinausragen.
//
// Für die Kollision prüfen wir aber die KOMPLETTE 1x1-Fläche.
// Dadurch kann kein Teil des Spieler-Tiles mehr in einen Stein,
// ein Erz, einen Baum oder ein Gebäude hineinrutschen.
//
// Das kleine EPSILON verhindert, dass eine exakt berührte
// Tile-Kante schon als das nächste Tile gewertet wird.
// ======================

canOccupy(world,x,y){

if(!world)
return true;


const EPSILON=0.001;


// ======================
// FUSS-HITBOX
// ======================
//
// x = horizontale MITTE des Spielers
// y = Weltposition des Spielers
//
// Der Sprite ist 32x48 Pixel.
// Kollidieren soll nur der Bereich
// direkt um die Füße.
// ======================


// Seitlich symmetrisch.
// 0.90 = 90 % eines Tiles breit.
const hitboxWidth = 0.60;


// Fußbereich vertikal.
//
// WICHTIG:
// Diese Werte sind relativ zu y,
// NICHT von 0 bis 1 innerhalb eines Tiles.
const hitboxTopOffset = 0.15;

const hitboxBottomOffset = 0.425;



// ======================
// HITBOX-GRENZEN
// ======================


const left =
x -
hitboxWidth/2;


const right =
x +
hitboxWidth/2;


const top =
y +
hitboxTopOffset;


const bottom =
y +
hitboxBottomOffset;



// ======================
// BETROFFENE TILES
// ======================


const tileLeft =
Math.floor(
left
);


const tileRight =
Math.floor(
right-EPSILON
);


const tileTop =
Math.floor(
top
);


const tileBottom =
Math.floor(
bottom-EPSILON
);



// ======================
// KOLLISION
// ======================


return(

world.isWalkable(
tileLeft,
tileTop
)

&&

world.isWalkable(
tileRight,
tileTop
)

&&

world.isWalkable(
tileLeft,
tileBottom
)

&&

world.isWalkable(
tileRight,
tileBottom
)

);


}






setMouse(x,y){


this.mouseX=x;

this.mouseY=y;


}








showMessage(text){


this.message=text;


this.messageTime=
Date.now()+2000;


}








getRequiredTool(ore){


switch(ore){



// Kohle
case 2:

return {

tier:2,

name:"Steinspitzhacke"

};




// Kupfer
case 3:

return {

tier:2,

name:"Steinspitzhacke"

};





// Eisen
case 4:

return {

tier:3,

name:"Kupferspitzhacke"

};





// Silber
case 5:

return {

tier:4,

name:"Eisenspitzhacke"

};





// Gold
case 6:

return {

tier:5,

name:"Silberspitzhacke"

};





// Diamant
case 7:

return {

tier:6,

name:"Goldspitzhacke"

};





// Kobalt
case 8:

return {

tier:7,

name:"Diamantspitzhacke"

};





// Mithril
case 9:

return {

tier:8,

name:"Kobaltspitzhacke"

};





// Obsidian
case 10:

return {

tier:9,

name:"Mithrilspitzhacke"

};





// Adamant
case 11:

return {

tier:10,

name:"Obsidianhacke"

};



}



return null;


}







getMineTime(tool){


let base=10000;


let reduction =
tool.tier*700;



let time =
base-reduction;



if(time<3000)

time=3000;



return time;



}





mine(
world,
camera,
canvas,
inventory,
backpack
){



let tool =
inventory.getSelectedTool();







let worldX =
Math.floor(

camera.x+
(
this.mouseX-
canvas.width/2
)
/32

);




let worldY =
Math.floor(

camera.y+
(
this.mouseY-
canvas.height/2
)
/32

);







let dx =
worldX-this.x;


let dy =
worldY-this.y;



let distance =
Math.sqrt(
dx*dx+
dy*dy
);






if(distance>3){


this.stopMining();

return;


}







let tile =
world.getTile(
worldX,
worldY
);


// GEBÄUDE NICHT MIT HAND ABBauen
if(
tile.building
){

this.stopMining();

this.showMessage(
"Benutze X zum Entfernen"
);

this.miningTile=null;
this.mineStart=0;

return;

}




if(tile===0){


this.stopMining();

return;


}









// ==================================================
// WERKZEUG PRÜFUNG
// ==================================================


// HOLZ

if(tile.ore===1){



if(
tool.toolType!=="axe" &&
tool.id!=="hand"
){



this.stopMining();


this.showMessage(
"Du brauchst eine Axt"
);



return;



}


}








// ==================================================
// STEIN
// ==================================================


if(tile.ore===12){



let required = {

tier:1,

name:"Holzspitzhacke"

};





if(
tool.toolType!=="pickaxe" ||
tool.tier < required.tier
){



this.stopMining();


this.showMessage(
"Du brauchst eine "+
required.name
);



this.miningTile=null;

this.mineStart=0;



return;



}




}








// ERZE

if(
tile.ore>=2 &&
tile.ore!==12
){



let required =
this.getRequiredTool(
tile.ore
);






if(
tool.toolType!=="pickaxe" ||
tool.tier < required.tier
){



this.stopMining();


this.showMessage(
"Du brauchst eine "+
required.name
);



this.miningTile=null;

this.mineStart=0;



return;



}



}









// ==================================================
// NEUER ABBauVORGANG
// ==================================================


if(

!this.miningTile ||

this.miningTile.x!==worldX ||

this.miningTile.y!==worldY

){



this.stopMining();





this.miningTile={


x:worldX,


y:worldY,


ore:tile.ore,


quality:tile.quality


};








if(tile.ore===12){


this.mineTime=5000;


}
else{


this.mineTime =
this.getMineTime(tool);


}






this.mineStart =
Date.now();







if(this.audio){



if(tile.ore===1){



this.audio.startMiningSound(
"chop_wood"
);



}
else{



this.audio.startMiningSound(
"mine_ore"
);



}



}



}









let elapsed =
Date.now()
-
this.mineStart;








if(elapsed>=this.mineTime){



this.stopMining();





if(this.audio){


this.audio.playSound(
"pickup_item"
);


}







let amount =
world.getAmount(
tile.quality || 1
);







// HOLZ

if(tile.ore===1){



backpack.add(

ITEMS.WOOD,

amount

);



}







// STEIN

if(tile.ore===12){



backpack.add(

ITEMS.STONE,

amount

);



}







// ERZE

if(tile.ore===2){


backpack.add(
ITEMS.COAL,
amount
);


}




if(tile.ore===3){


backpack.add(
ITEMS.COPPER_ORE,
amount
);


}




if(tile.ore===4){


backpack.add(
ITEMS.IRON_ORE,
amount
);


}






if(tile.ore===5){


backpack.add(
ITEMS.SILVER_ORE,
amount
);


}





if(tile.ore===6){


backpack.add(
ITEMS.GOLD_ORE,
amount
);


}





if(tile.ore===7){


backpack.add(
ITEMS.DIAMOND_ORE,
amount
);


}





if(tile.ore===8){


backpack.add(
ITEMS.COBALT_ORE,
amount
);


}





if(tile.ore===9){


backpack.add(
ITEMS.MITHRIL_ORE,
amount
);


}





if(tile.ore===10){


backpack.add(
ITEMS.OBSIDIAN,
amount
);


}





if(tile.ore===11){


backpack.add(
ITEMS.ADAMANT_ORE,
amount
);


}









world.removeTile(

worldX,

worldY

);





this.mineStart=0;

this.miningTile=null;



}



}












draw(
ctx,
camera,
canvas,
tileSize
){

let directionRow={
down:0,
left:1,
right:2,
up:3
};

let row=directionRow[this.direction] ?? 0;

let sourceX=
this.animationFrame*this.spriteFrameWidth;

let sourceY=
row*this.spriteFrameHeight;

// Füße bleiben auf dem ursprünglichen 32x32-Spielertile.
// Der 32x48-Charakter ragt 16 Pixel nach oben heraus.
let screenX=Math.floor(
canvas.width/2-tileSize/2
);

let screenY=Math.floor(
canvas.height/2+tileSize/2-this.spriteFrameHeight
);

ctx.save();
ctx.imageSmoothingEnabled=false;

ctx.drawImage(
this.sprite,
sourceX,
sourceY,
this.spriteFrameWidth,
this.spriteFrameHeight,
screenX,
screenY,
tileSize,
Math.round(tileSize*1.5)
);

ctx.restore();

}


}
