
export class Renderer {


constructor(ctx,items){


this.ctx=ctx;

this.items=items;


this.tileSize=32;


this.tooltip =
document.getElementById("tooltip");


this.mouseX=0;

this.mouseY=0;



}









setMouse(x,y){


this.mouseX=x;

this.mouseY=y;


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

(x-camera.x)
*
this.tileSize
+
canvas.width/2;



let screenY =

(y-camera.y)
*
this.tileSize
+
canvas.height/2;







ctx.fillStyle="#555";



ctx.fillRect(

screenX,

screenY,

this.tileSize,

this.tileSize

);






ctx.font="26px Arial";

ctx.textAlign="center";

ctx.textBaseline="middle";



if(
tile.building==="furnace"
){


ctx.fillText(

"🔥",

screenX+16,

screenY+16

);



}





if(
tile.building==="crafting_table"
){



ctx.fillText(

"🔨",

screenX+16,

screenY+16

);



}





continue;



}













let ore=0;



if(tile!==0)
{

ore=tile.ore;

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

ctx.fillStyle="#888";

break;



case 5:

ctx.fillStyle="#ccc";

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

ctx.fillStyle="#111";

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
// SPAWN NAVIGATOR
// ======================


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





this.tooltip.style.left =
(mouseX+15)+"px";


this.tooltip.style.top =
(mouseY+15)+"px";





}
else{


this.tooltip.style.display="none";


}












// ======================
// SETTINGS BUTTON
// ======================


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