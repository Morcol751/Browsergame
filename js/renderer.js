
export class Renderer {


constructor(ctx,items){


this.ctx=ctx;

this.ctx.imageSmoothingEnabled = false;

this.items=items;


this.tileSize=32;

this.tiles = {};

this.grassRotation = [];

this.tiles.grass = new Image();
this.tiles.grass.src = "./assets/tiles/grass.png";

this.tiles.stone = new Image();
this.tiles.stone.src = "./assets/tiles/stone.png";

this.tiles.sand = new Image();
this.tiles.sand.src = "./assets/tiles/sand.png";

this.tiles.water = new Image();
this.tiles.water.src = "./assets/tiles/water.png";

this.tiles.tree = new Image();
this.tiles.tree.src = "./assets/tiles/tree.png";

this.tiles.rubber_tree = new Image();
this.tiles.rubber_tree.src = "./assets/tiles/rubber_tree.png";

this.tiles.coal = new Image();
this.tiles.coal.src = "./assets/tiles/coal.png";

this.tiles.copper = new Image();
this.tiles.copper.src = "./assets/tiles/copper.png";

this.tiles.iron = new Image();
this.tiles.iron.src = "./assets/tiles/iron.png";

this.tiles.silver = new Image();
this.tiles.silver.src = "./assets/tiles/silver.png";

this.tiles.gold = new Image();
this.tiles.gold.src = "./assets/tiles/gold.png";

this.tiles.diamond = new Image();
this.tiles.diamond.src = "./assets/tiles/diamond.png";

this.tiles.cobalt = new Image();
this.tiles.cobalt.src = "./assets/tiles/cobalt.png";

this.tiles.mithril = new Image();
this.tiles.mithril.src = "./assets/tiles/mithril.png";

this.tiles.obsidian = new Image();
this.tiles.obsidian.src = "./assets/tiles/obsidian.png";

this.tiles.adamant = new Image();
this.tiles.adamant.src = "./assets/tiles/adamant.png";

this.tiles.workbench = new Image();
this.tiles.workbench.src = "./assets/buildings/workbench_sprite.png";

this.tiles.furnace = new Image();
this.tiles.furnace.src = "./assets/buildings/furnace_sprite.png";

this.tiles.mechanical_workbench = new Image();
this.tiles.mechanical_workbench.src = "./assets/buildings/mechanical_workbench.png";

this.tiles.cooking_station = new Image();
this.tiles.cooking_station.src = "./assets/buildings/cooking_station.png";

this.tiles.wood_bridge = new Image();
this.tiles.wood_bridge.src = "./assets/tiles/wood_bridge.png";



this.tooltip =
document.getElementById("tooltip");


this.mouseX=0;

this.mouseY=0;



}









setMouse(x,y){


this.mouseX=x;

this.mouseY=y;


}

getGrassRotation(x,y){

let key =
x+"_"+y;


if(this.grassRotation[key]===undefined){

this.grassRotation[key] =
Math.floor(Math.random()*4);

}


return this.grassRotation[key];

}







draw(

world,

player,

camera,

canvas,

mouseX,

mouseY,

audio,

settingsOpen

){



let ctx=this.ctx;







// ======================
// MAP
// ======================


ctx.fillStyle="#222";

ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);









let startX =
Math.floor(

camera.x-
canvas.width/2/
this.tileSize

);



let startY =
Math.floor(

camera.y-
canvas.height/2/
this.tileSize

);






let endX =
startX+
Math.ceil(
canvas.width/
this.tileSize
)+2;



let endY =
startY+
Math.ceil(
canvas.height/
this.tileSize
)+2;


// Mehrteilige Gebäude nach dem Terrain-Pass zeichnen, damit
// ihre Child-Tiles das große Sprite nicht wieder mit Gras übermalen.
let workbenchesToDraw=[];
let mechanicalWorkbenchesToDraw=[];
let cookingStationsToDraw=[];
let furnacesToDraw=[];









for(
let y=startY;
y<endY;
y++
){



for(
let x=startX;
x<endX;
x++
){



let tile =
world.getTile(
x,
y
);






// ======================
// GEBÄUDE
// ======================


if(
tile!==0 &&
tile.building
){


let screenX =
Math.floor(
(x-camera.x)
*
this.tileSize
+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)
*
this.tileSize
+
canvas.height/2
);


// Holzbrücke: festes 32x32-Tile, keine Drehung und keine Nachbarerkennung.
if(tile.building==="wood_bridge"){

ctx.drawImage(
this.tiles.wood_bridge,
screenX,
screenY,
this.tileSize,
this.tileSize
);

continue;

}

// Normale Landgebäude können auf Gras oder Sand stehen.
// Bei Sand wird der gespeicherte Untergrund weitergezeichnet.
if(tile.underlyingOre===14){

ctx.drawImage(
this.tiles.sand,
screenX,
screenY,
this.tileSize,
this.tileSize
);

}
else{

let rotation =
this.getGrassRotation(x,y);


ctx.save();

ctx.translate(
screenX+this.tileSize/2,
screenY+this.tileSize/2
);

ctx.rotate(
rotation*Math.PI/2
);

ctx.drawImage(
this.tiles.grass,
-this.tileSize/2,
-this.tileSize/2,
this.tileSize,
this.tileSize
);

ctx.restore();

}


// ======================
// OFEN 1x2 (1 breit, 2 hoch)
// ======================

if(
tile.building==="furnace"
){

if(
tile.buildingPart==="origin"
){

furnacesToDraw.push({

x:screenX,

y:screenY

});

}

continue;

}



// ======================
// HANDWERKSBANK 2x1
// ======================

if(
tile.building==="crafting_table"
){

if(
tile.buildingPart==="origin"
){

workbenchesToDraw.push({

x:screenX,

y:screenY

});

}

continue;

}


// ======================
// MECHANISCHE WERKBANK 2x1
// ======================

if(
tile.building==="mechanical_workbench"
){

if(
tile.buildingPart==="origin"
){

mechanicalWorkbenchesToDraw.push({

x:screenX,

y:screenY

});

}

continue;

}


// ======================
// KOCHSTATION 2x1
// ======================

if(
tile.building==="cooking_station"
){

if(
tile.buildingPart==="origin"
){

cookingStationsToDraw.push({

x:screenX,

y:screenY

});

}

continue;

}


continue;

}








let ore=0;



if(tile!==0)
{

ore=tile.ore;

}


// ======================
// GRASS TEXTUR
// ======================


if(ore===0){


let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



let rotation =
this.getGrassRotation(x,y);



ctx.save();



ctx.translate(
screenX+this.tileSize/2,
screenY+this.tileSize/2
);



ctx.rotate(
rotation*Math.PI/2
);



ctx.drawImage(

this.tiles.grass,

-this.tileSize/2,

-this.tileSize/2,

this.tileSize,

this.tileSize

);



ctx.restore();



continue;

}

// ======================
// WASSER TEXTUR
// ======================

if(ore===13){

let screenX=
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);

let screenY=
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);

ctx.drawImage(
this.tiles.water,
screenX,
screenY,
this.tileSize,
this.tileSize
);

continue;

}

// ======================
// SAND TEXTUR
// ======================

if(ore===14){

let screenX=
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);

let screenY=
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);

ctx.drawImage(
this.tiles.sand,
screenX,
screenY,
this.tileSize,
this.tileSize
);

continue;

}

// ======================
// STEIN TEXTUR
// ======================

if(ore===12){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.stone,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}

// ======================
// Baum TEXTUR
// ======================

if(ore===1){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.tree,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// KAUTSCHUKBAUM TEXTUR
// ======================

if(ore===15){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);

let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);

ctx.drawImage(
this.tiles.rubber_tree,
screenX,
screenY,
this.tileSize,
this.tileSize
);

continue;

}


// ======================
// Kohle TEXTUR
// ======================

if(ore===2){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.coal,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Kupfer TEXTUR
// ======================

if(ore===3){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.copper,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Eisen TEXTUR
// ======================

if(ore===4){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.iron,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Silber TEXTUR
// ======================

if(ore===5){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.silver,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Gold TEXTUR
// ======================

if(ore===6){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.gold,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Diamant TEXTUR
// ======================

if(ore===7){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.diamond,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Kobalt TEXTUR
// ======================

if(ore===8){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.cobalt,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Mithril TEXTUR
// ======================

if(ore===9){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.mithril,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Obsidian TEXTUR
// ======================

if(ore===10){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.obsidian,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


// ======================
// Adamant TEXTUR
// ======================

if(ore===11){

let screenX =
Math.floor(
(x-camera.x)*this.tileSize+
canvas.width/2
);


let screenY =
Math.floor(
(y-camera.y)*this.tileSize+
canvas.height/2
);



ctx.drawImage(

this.tiles.adamant,

screenX,

screenY,

this.tileSize,

this.tileSize

);



continue;

}


switch(ore){



case 0:

ctx.fillStyle="#4caf50";

break;



case 1:

ctx.fillStyle="#8b5a2b";

break;



case 2:

ctx.fillStyle="#202020";

break;



case 3:

ctx.fillStyle="#b87333";

break;



case 4:

ctx.fillStyle="#8888885d";

break;



case 5:

ctx.fillStyle="#dad6d6";

break;



case 6:

ctx.fillStyle="gold";

break;



case 7:

ctx.fillStyle="cyan";

break;



case 8:

ctx.fillStyle="blue";

break;



case 9:

ctx.fillStyle="purple";

break;



case 10:

ctx.fillStyle="#130a47";

break;



case 11:

ctx.fillStyle="pink";

break;



case 12:

ctx.fillStyle="#666";

break;



}









ctx.fillRect(


(x-camera.x)
*
this.tileSize
+
canvas.width/2,



(y-camera.y)
*
this.tileSize
+
canvas.height/2,



this.tileSize,



this.tileSize


);






}



}




// ======================
// HANDWERKSBÄNKE ÜBER TERRAIN
// ======================

for(
let workbench of workbenchesToDraw
){

ctx.drawImage(
this.tiles.workbench,
workbench.x,
workbench.y,
this.tileSize*2,
this.tileSize
);

}


// ======================
// MECHANISCHE WERKBÄNKE ÜBER TERRAIN
// ======================

for(
let workbench of mechanicalWorkbenchesToDraw
){

ctx.drawImage(
this.tiles.mechanical_workbench,
workbench.x,
workbench.y,
this.tileSize*2,
this.tileSize
);

}


// ======================
// KOCHSTATIONEN ÜBER TERRAIN
// ======================

for(
let station of cookingStationsToDraw
){

ctx.drawImage(
this.tiles.cooking_station,
station.x,
station.y,
this.tileSize*2,
this.tileSize
);

}


// ======================
// ÖFEN ÜBER TERRAIN
// ======================

for(
let furnace of furnacesToDraw
){

ctx.drawImage(
this.tiles.furnace,
furnace.x,
furnace.y,
this.tileSize,
this.tileSize*2
);

}



// ======================
// MINING BALKEN
// ======================


if(

player.miningTile &&

player.mining

){



let tx =
player.miningTile.x;



let ty =
player.miningTile.y;






let progress =

(
Date.now()-
player.mineStart
)
/
player.mineTime;




progress=Math.max(
0,
Math.min(
1,
progress
)
);





let barWidth=40;

let barHeight=6;






let screenX =

(tx-camera.x)
*
this.tileSize
+
canvas.width/2
-
barWidth/2;



let screenY =

(ty-camera.y)
*
this.tileSize
+
canvas.height/2
-
15;








ctx.fillStyle="black";


ctx.fillRect(

screenX,

screenY,

barWidth,

barHeight

);



ctx.fillStyle="lime";


ctx.fillRect(

screenX,

screenY,

barWidth*progress,

barHeight

);




}









// ======================
// PLAYER
// ======================


player.draw(

ctx,

camera,

canvas,

this.tileSize

);











// ======================
// MELDUNGEN
// ======================


if(

player.message &&

Date.now()<player.messageTime

){



ctx.save();



ctx.fillStyle="red";

ctx.font="18px Arial";

ctx.textAlign="center";



ctx.fillText(

player.message,

canvas.width/2,

canvas.height/2-50

);



ctx.restore();



}









// ======================
// HOVER TOOLTIP
// ======================


let worldMouseX =

Math.floor(

camera.x+

(
mouseX-
canvas.width/2
)
/this.tileSize

);



let worldMouseY =

Math.floor(

camera.y+

(
mouseY-
canvas.height/2
)
/this.tileSize

);







let hovered =

world.getTile(

worldMouseX,

worldMouseY

);







if(

hovered!==0

){



this.tooltip.style.display="block";





if(
hovered.building
){


let item =
Object.values(this.items).find(
i=>i.id===hovered.building
);



if(item){

this.tooltip.innerHTML =
item.name;

}
else{

this.tooltip.innerHTML =
hovered.building;

}



}

else{


if(
hovered.ore===13 ||
hovered.ore===14
){


// Wasser und Sand haben bewusst keine Seltenheit
// und kein Vorkommen-Limit.

this.tooltip.innerHTML =
world.getOreName(
hovered.ore
);


}
else{


let quality =
hovered.quality || 1;


this.tooltip.innerHTML =

world.getOreName(
hovered.ore
)

+

"<br>"

+

world.getQualityName(
quality
)

+

"<br>"

+

world.getAmount(
quality
)

+

" Vorkommen";


}


}





this.tooltip.style.left =
(mouseX+15)+"px";


this.tooltip.style.top =
(mouseY+15)+"px";





}
else{


this.tooltip.style.display="none";


}














}








// ======================
// SETTINGS UI
// ======================

drawSettingsUI(
ctx,
canvas,
mouseX,
mouseY,
audio,
settingsOpen
){

let gearX =
canvas.width-90;



let gearY =
canvas.height-90;







ctx.save();





ctx.fillStyle =

this.settingsHover(
mouseX,
mouseY,
canvas
)

?

"#555"

:

"#303030";






ctx.fillRect(

gearX,

gearY,

60,

60

);






ctx.strokeStyle="#777";

ctx.lineWidth=3;



ctx.strokeRect(

gearX,

gearY,

60,

60

);







ctx.font="32px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";



ctx.fillStyle="white";



ctx.fillText(

"⚙",

gearX+30,

gearY+25

);






ctx.font="13px Arial";


ctx.fillStyle="#ccc";



ctx.fillText(

"(ESC)",

gearX+30,

gearY+48

);





ctx.restore();









// ======================
// SETTINGS
// ======================


if(settingsOpen){



this.drawSettings(

ctx,

canvas,

audio

);



}

}



// ======================
// SPAWN NAVIGATOR
// ======================

drawSpawnNavigator(
ctx,
world,
player,
canvas
){

let spawnDX =
world.spawnX-player.x;


let spawnDY =
world.spawnY-player.y;



let distance =
Math.sqrt(
spawnDX*spawnDX+
spawnDY*spawnDY
);



if(distance>50){



ctx.save();



let angle =
Math.atan2(
spawnDY,
spawnDX
);




// Position unter der Minimap

let arrowX =
canvas.width-135;


let arrowY =
280;





ctx.translate(
arrowX,
arrowY
);



ctx.rotate(
angle+Math.PI/2
);





ctx.fillStyle="yellow";



ctx.beginPath();



ctx.moveTo(
0,
-25
);



ctx.lineTo(
14,
15
);



ctx.lineTo(
0,
8
);



ctx.lineTo(
-14,
15
);



ctx.closePath();



ctx.fill();



ctx.restore();








ctx.save();



ctx.fillStyle="yellow";


ctx.font="18px Arial";


ctx.textAlign="center";



ctx.fillText(

"🏠 Spawn "+
Math.floor(distance)+
" Felder",

arrowX,

arrowY+45

);



ctx.restore();



}

}



drawSettings(

ctx,

canvas,

audio

){



let width=420;

let height=280;



let x =
canvas.width/2-width/2;



let y =
canvas.height/2-height/2+120;







ctx.save();





ctx.fillStyle =
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


ctx.font="28px Arial";


ctx.textAlign="center";



ctx.fillText(

"Einstellungen",

canvas.width/2,

y+45

);







ctx.font="18px Arial";



ctx.fillText(

"🎵 Musik",

canvas.width/2,

y+100

);




ctx.fillText(

"🔊 Sounds",

canvas.width/2,

y+170

);








ctx.fillStyle="#444";


ctx.fillRect(

x+80,

y+115,

260,

15

);



ctx.fillStyle="lime";


ctx.fillRect(

x+80,

y+115,

260*audio.musicVolume,

15

);








ctx.fillStyle="#444";


ctx.fillRect(

x+80,

y+185,

260,

15

);



ctx.fillStyle="cyan";


ctx.fillRect(

x+80,

y+185,

260*audio.soundVolume,

15

);





ctx.restore();



}












// ======================
// HOVER
// ======================


settingsHover(
x,
y,
canvas
){



let gearX =
canvas.width-90;



let gearY =
canvas.height-90;





return(

x>=gearX &&

x<=gearX+60 &&

y>=gearY &&

y<=gearY+60

);



}





}