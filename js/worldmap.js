export class WorldMap{


constructor(world){


this.world=world;


this.open=false;



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



});







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



});








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



});









window.addEventListener(
"mouseup",
()=>{


this.dragging=false;


});









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



});





}









draw(player){



if(!this.open)
return;



let ctx=this.ctx;


let world=this.world;



let scale =
this.canvas.width/world.width;



ctx.clearRect(
0,
0,
this.canvas.width,
this.canvas.height
);





ctx.fillStyle="#111";

ctx.fillRect(
0,
0,
this.canvas.width,
this.canvas.height
);








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
world.getTile(
x,
y
);



if(tile===0)
continue;




switch(tile.ore){



case 1:
ctx.fillStyle="#8b5a2b";
break;


case 2:
ctx.fillStyle="#222";
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


default:
ctx.fillStyle="#4caf50";


}




ctx.fillRect(

x*scale,

y*scale,

Math.ceil(scale),

Math.ceil(scale)

);



}

}



 



// Spawn


ctx.fillStyle="yellow";


ctx.beginPath();


ctx.arc(

world.spawnX*scale,

world.spawnY*scale,

6,

0,

Math.PI*2

);


ctx.fill();





// Spieler


ctx.fillStyle="red";


ctx.beginPath();


ctx.arc(

player.x*scale,

player.y*scale,

7,

0,

Math.PI*2

);


ctx.fill();



}









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



ctx.drawImage(

this.canvas,

-size/2,

-size/2,

size,

size

);



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