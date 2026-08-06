export class Minimap {


constructor(canvas){


this.canvas = canvas;


this.ctx =
canvas.getContext("2d");



this.size = 220;


this.radius = 50;



this.canvas.width =
this.size;


this.canvas.height =
this.size;



this.tileSize =
this.size /
(this.radius*2);



}









draw(
world,
player
){



let ctx=this.ctx;



let center =
this.size/2;







ctx.clearRect(
0,
0,
this.size,
this.size
);






ctx.save();






ctx.beginPath();


ctx.arc(

center,

center,

center,

0,

Math.PI*2

);


ctx.clip();








ctx.fillStyle="#111";


ctx.fillRect(

0,

0,

this.size,

this.size

);









// ======================
// WELT
// ======================


for(
let y=-this.radius;
y<this.radius;
y++
){



for(
let x=-this.radius;
x<this.radius;
x++
){



if(
Math.sqrt(
x*x+y*y
)
>
this.radius
)

continue;








let tile =
world.getTile(

Math.floor(player.x+x),

Math.floor(player.y+y)

);






if(tile===0)
continue;








switch(tile.ore){



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



default:

ctx.fillStyle="#4caf50";



}








ctx.fillRect(

center+
x*this.tileSize,


center+
y*this.tileSize,


this.tileSize,


this.tileSize

);



}



}











// ======================
// SPAWN MARKER
// ======================


let spawnDX =
world.spawnX-player.x;



let spawnDY =
world.spawnY-player.y;



let spawnDistance =
Math.sqrt(

spawnDX*spawnDX+

spawnDY*spawnDY

);







// nur anzeigen wenn im Radius

if(
spawnDistance <= this.radius
){



ctx.fillStyle="yellow";


ctx.beginPath();


ctx.arc(


center+
spawnDX*this.tileSize,


center+
spawnDY*this.tileSize,


5,


0,


Math.PI*2


);


ctx.fill();



}











// ======================
// SPIELER
// ======================


ctx.fillStyle="red";


ctx.beginPath();


ctx.arc(

center,

center,

6,

0,

Math.PI*2

);


ctx.fill();







ctx.restore();



}



}