export class Enemies{

constructor(game){

this.game=game;
this.enemies=[];

this.maxEnemies=7;


// ==================================================
// MONSTER-SPAWNBEREICHE AB WELT-SPAWN
// ==================================================
//
// Hier stellst du später für JEDEN Monstertyp separat ein,
// wie weit er vom Welt-Spawn entfernt vorkommen darf.
//
// Beispiel:
// spawnMinDistance:300,
// spawnMaxDistance:500
//
// Der Alien-Krabbler darf aktuell nur zwischen
// 100 und 300 Tiles Entfernung vom Spawn erscheinen.

this.alienCrawlerSpawnMinDistance=100;
this.alienCrawlerSpawnMaxDistance=300;


// Monster werden weiterhin anhand der Entfernung
// zum SPIELER erzeugt / entfernt, damit nicht die ganze
// Welt voller aktiver Monster liegt.

this.playerSpawnMinDistance=50;
this.playerSpawnMaxDistance=150;

this.despawnDistance=210;
this.spawnCheckInterval=1200;
this.lastSpawnCheck=0;

this.sprite=new Image();
this.sprite.src="./assets/enemies/alien_crawler_walk.png";

this.frameWidth=96;
this.frameHeight=96;
this.frames=4;
this.animationSpeed=140;

}

update(world,player){

if(!world || !player)
return;

let now=Date.now();

this.despawnFarEnemies(player);

if(now-this.lastSpawnCheck>=this.spawnCheckInterval){

this.lastSpawnCheck=now;

while(this.enemies.length<this.maxEnemies){

if(!this.spawnEnemy(world,player))
break;

}

}

for(let enemy of this.enemies){

this.updateEnemy(enemy,world,player,now);

}

}

despawnFarEnemies(player){

this.enemies=this.enemies.filter(
enemy=>{

let dx=enemy.x-player.x;
let dy=enemy.y-player.y;
let distance=Math.sqrt(dx*dx+dy*dy);

return distance<=this.despawnDistance;

}
);

}

spawnEnemy(world,player){

for(let attempt=0;attempt<80;attempt++){

let distance=
this.playerSpawnMinDistance+
Math.random()*(this.playerSpawnMaxDistance-this.playerSpawnMinDistance);

let angle=Math.random()*Math.PI*2;

let x=Math.floor(player.x+Math.cos(angle)*distance);
let y=Math.floor(player.y+Math.sin(angle)*distance);

if(x<0 || y<0 || x>=world.width || y>=world.height)
continue;


// ==================================================
// SPAWNBEREICH DES ALIEN-KRABBLERS
// ==================================================
//
// Wichtig:
// Diese Entfernung wird NICHT vom Spieler gemessen,
// sondern vom festen Welt-Spawn.
//
// Dadurch bleiben die ersten 100 Tiles um den Spawn
// garantiert monsterfrei.

let dxFromSpawn=
(x+0.5)-world.spawnX;

let dyFromSpawn=
(y+0.5)-world.spawnY;

let distanceFromSpawn=
Math.sqrt(
dxFromSpawn*dxFromSpawn+
dyFromSpawn*dyFromSpawn
);


if(
distanceFromSpawn<this.alienCrawlerSpawnMinDistance ||
distanceFromSpawn>this.alienCrawlerSpawnMaxDistance
)
continue;


if(!this.canEnemyOccupy(world,x+0.5,y+0.5))
continue;

if(this.isTooCloseToOtherEnemy(x+0.5,y+0.5,8))
continue;

this.enemies.push({

id:"alien_crawler",
name:"Alien-Krabbler",

x:x+0.5,
y:y+0.5,

speed:0.045+Math.random()*0.015,
direction:"down",
moving:false,
frame:Math.floor(Math.random()*this.frames),
lastFrameTime:Date.now(),

wanderAngle:Math.random()*Math.PI*2,
nextWanderChange:Date.now()+800+Math.random()*1600,
pauseUntil:0,
touchLogged:false,

maxHP:20,
hp:20,
attack:4,
defense:1,
combatSpeed:9,

// ======================
// DROPS
// ======================

drops:[
{
item:"RAW_BUG_MEAT",
min:1,
max:3,
chance:0.80
},
{
item:"CHITIN",
min:1,
max:3,
chance:0.60
}
],

path:[],
pathIndex:0,
nextPathUpdate:0,
lastPathTargetX:null,
lastPathTargetY:null

});

return true;

}

return false;

}

isTooCloseToOtherEnemy(x,y,minDistance){

for(let enemy of this.enemies){

let dx=enemy.x-x;
let dy=enemy.y-y;

if(Math.sqrt(dx*dx+dy*dy)<minDistance)
return true;

}

return false;

}

updateEnemy(enemy,world,player,now){

let dxToPlayer=player.x-enemy.x;
let dyToPlayer=player.y-enemy.y;
let distanceToPlayer=Math.sqrt(dxToPlayer*dxToPlayer+dyToPlayer*dyToPlayer);

let angle;

let chasing =
distanceToPlayer<14;


if(chasing){

let targetTileX =
Math.floor(
player.x
);

let targetTileY =
Math.floor(
player.y
);


// Pfad nicht jedes Frame neu berechnen.
// Neu berechnen, wenn:
// - noch kein Pfad existiert
// - Ziel-Tile sich verändert hat
// - der alte Pfad verbraucht ist
// - der regelmäßige Refresh fällig ist

if(
now>=enemy.nextPathUpdate ||
enemy.path.length===0 ||
enemy.pathIndex>=enemy.path.length ||
enemy.lastPathTargetX!==targetTileX ||
enemy.lastPathTargetY!==targetTileY
){


enemy.path =
this.findLocalPath(
world,
enemy.x,
enemy.y,
targetTileX,
targetTileY,
24
);


enemy.pathIndex=0;

enemy.nextPathUpdate =
now+350;


enemy.lastPathTargetX =
targetTileX;

enemy.lastPathTargetY =
targetTileY;


}


// Nächstes Wegpunkt-Tile ansteuern.
// Jeder Wegpunkt ist ein begehbares Tile-Zentrum.

if(
enemy.path.length>0 &&
enemy.pathIndex<enemy.path.length
){


let waypoint =
enemy.path[
enemy.pathIndex
];


let wx =
waypoint.x+0.5;


let wy =
waypoint.y+0.5;


let wdx =
wx-enemy.x;


let wdy =
wy-enemy.y;


let waypointDistance =
Math.sqrt(
wdx*wdx+
wdy*wdy
);


if(waypointDistance<0.18){


enemy.pathIndex++;


if(
enemy.pathIndex<
enemy.path.length
){


waypoint =
enemy.path[
enemy.pathIndex
];


wx =
waypoint.x+0.5;


wy =
waypoint.y+0.5;


angle =
Math.atan2(
wy-enemy.y,
wx-enemy.x
);


}
else{


angle =
Math.atan2(
dyToPlayer,
dxToPlayer
);


}


}
else{


angle =
Math.atan2(
wdy,
wdx
);


}


}
else{


// Falls lokal kein Pfad gefunden wurde,
// bleibt die alte direkte Verfolgung als Fallback.

angle =
Math.atan2(
dyToPlayer,
dxToPlayer
);


}


}
else{


// Nicht im Aggro-Bereich:
// alten Verfolgungspfad verwerfen.

enemy.path=[];

enemy.pathIndex=0;

enemy.lastPathTargetX=null;

enemy.lastPathTargetY=null;


if(now>=enemy.nextWanderChange){


enemy.wanderAngle+=(Math.random()-0.5)*1.8;

enemy.nextWanderChange=now+900+Math.random()*2200;


if(Math.random()<0.20){


enemy.pauseUntil=now+300+Math.random()*900;


}


}


angle=enemy.wanderAngle;


}


if(now<enemy.pauseUntil){


enemy.moving=false;

enemy.frame=0;

return;


}


let speed=enemy.speed;

let moveX=Math.cos(angle)*speed;

let moveY=Math.sin(angle)*speed;

let moved=false;


if(
this.canEnemyOccupy(
world,
enemy.x+moveX,
enemy.y+moveY
)
){


enemy.x+=moveX;

enemy.y+=moveY;

moved=true;


}
else if(
this.canEnemyOccupy(
world,
enemy.x+moveX,
enemy.y
)
){


enemy.x+=moveX;

moved=true;


}
else if(
this.canEnemyOccupy(
world,
enemy.x,
enemy.y+moveY
)
){


enemy.y+=moveY;

moved=true;


}
else{


// Während der Verfolgung bedeutet "festgefahren":
// Pfad sofort verwerfen und beim nächsten Frame neu suchen.

if(chasing){


enemy.path=[];

enemy.pathIndex=0;

enemy.nextPathUpdate=0;


}
else{


enemy.wanderAngle=Math.random()*Math.PI*2;

enemy.nextWanderChange=now+300;


}


}


if(Math.abs(moveX)>Math.abs(moveY)){


enemy.direction=moveX>=0?"right":"left";


}
else{


enemy.direction=moveY>=0?"down":"up";


}


enemy.moving=moved;


if(enemy.moving){


if(now-enemy.lastFrameTime>=this.animationSpeed){


enemy.frame=(enemy.frame+1)%this.frames;

enemy.lastFrameTime=now;


}


}
else{


enemy.frame=0;

enemy.lastFrameTime=now;


}


if(
distanceToPlayer<1.05 &&
!enemy.touchLogged
){


enemy.touchLogged=true;


if(
this.game &&
this.game.combat &&
typeof this.game.combat.startCombat==="function"
){


this.game.combat.startCombat(
enemy
);


}


}


if(distanceToPlayer>=1.5){


enemy.touchLogged=false;


}


}





// ======================
// LOKALE WEGFINDUNG (A*)
// ======================
//
// Nur im Nahbereich des Monsters.
// Dadurch suchen die Krabbler um Bäume, Steine,
// Erze, Wasser und Gebäude herum, ohne jemals
// die komplette Welt als Pathfinding-Grid zu behandeln.
//
// maxRadius=24 reicht locker für den aktuellen
// Aggro-Radius von 14 Tiles.
// ======================

findLocalPath(
world,
startWorldX,
startWorldY,
targetX,
targetY,
maxRadius=24
){


let startX =
Math.floor(
startWorldX
);


let startY =
Math.floor(
startWorldY
);


if(
startX===targetX &&
startY===targetY
)
return [];


// Ziel muss selbst begehbar sein.
// Falls der Spieler sehr nah an einer Kante steht,
// suchen wir das nächste erreichbare Tile um ihn herum.

let resolvedTarget =
this.findNearestWalkableTarget(
world,
targetX,
targetY,
startX,
startY
);


if(!resolvedTarget)
return [];


targetX=resolvedTarget.x;

targetY=resolvedTarget.y;


let minX =
Math.max(
0,
startX-maxRadius
);


let maxX =
Math.min(
world.width-1,
startX+maxRadius
);


let minY =
Math.max(
0,
startY-maxRadius
);


let maxY =
Math.min(
world.height-1,
startY+maxRadius
);


if(
targetX<minX ||
targetX>maxX ||
targetY<minY ||
targetY>maxY
)
return [];


let key =
(x,y)=>
x+","+y;


let heuristic =
(x,y)=>
Math.abs(targetX-x)+
Math.abs(targetY-y);


let open=[{

x:startX,
y:startY,
g:0,
f:heuristic(startX,startY)

}];


let cameFrom =
new Map();


let bestG =
new Map();


bestG.set(
key(startX,startY),
0
);


let closed =
new Set();


let directions=[

{x:1,y:0},
{x:-1,y:0},
{x:0,y:1},
{x:0,y:-1},

{x:1,y:1},
{x:1,y:-1},
{x:-1,y:1},
{x:-1,y:-1}

];


let iterations=0;

let maxIterations=3500;


while(
open.length>0 &&
iterations<maxIterations
){


iterations++;


// Bei kleinem lokalen Grid reicht eine lineare Suche.
// Maximal 7 Gegner und nur alle ~350 ms,
// deshalb bleibt das deutlich günstiger als globales Pathfinding.

let bestIndex=0;


for(
let i=1;
i<open.length;
i++
){


if(open[i].f<open[bestIndex].f)
bestIndex=i;


}


let current =
open.splice(
bestIndex,
1
)[0];


let currentKey =
key(
current.x,
current.y
);


if(closed.has(currentKey))
continue;


closed.add(currentKey);


if(
current.x===targetX &&
current.y===targetY
){


let path=[];

let walkKey=currentKey;

let cx=current.x;

let cy=current.y;


while(
!(
cx===startX &&
cy===startY
)
){


path.push({

x:cx,
y:cy

});


let previous =
cameFrom.get(
walkKey
);


if(!previous)
break;


cx=previous.x;

cy=previous.y;

walkKey=
key(
cx,
cy
);


}


path.reverse();

return path;


}


for(
let dir of directions
){


let nx =
current.x+
dir.x;


let ny =
current.y+
dir.y;


if(
nx<minX ||
nx>maxX ||
ny<minY ||
ny>maxY
)
continue;


let nextKey =
key(
nx,
ny
);


if(closed.has(nextKey))
continue;


// Das Monster muss mit seiner kompletten Fuß-Hitbox
// auf dem Kandidaten-Tile stehen können.

if(
!this.canEnemyOccupy(
world,
nx+0.5,
ny+0.5
)
)
continue;


// Bei Diagonalen kein "Ecken schneiden":
// Beide angrenzenden orthogonalen Tiles müssen frei sein.

if(
dir.x!==0 &&
dir.y!==0
){


if(
!this.canEnemyOccupy(
world,
current.x+dir.x+0.5,
current.y+0.5
)
||
!this.canEnemyOccupy(
world,
current.x+0.5,
current.y+dir.y+0.5
)
)
continue;


}


let stepCost =
(
dir.x!==0 &&
dir.y!==0
)
?
1.41421356237
:
1;


let newG =
current.g+
stepCost;


let oldG =
bestG.get(
nextKey
);


if(
oldG!==undefined &&
newG>=oldG
)
continue;


bestG.set(
nextKey,
newG
);


cameFrom.set(
nextKey,
{

x:current.x,
y:current.y

}
);


open.push({

x:nx,
y:ny,

g:newG,

f:
newG+
heuristic(
nx,
ny
)

});


}


}


return [];


}





// ======================
// NÄCHSTES BEGEHBARES ZIEL
// ======================

findNearestWalkableTarget(
world,
targetX,
targetY,
fromX,
fromY
){


if(
this.canEnemyOccupy(
world,
targetX+0.5,
targetY+0.5
)
){


return {

x:targetX,
y:targetY

};


}


for(
let radius=1;
radius<=3;
radius++
){


let candidates=[];


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


if(
Math.abs(dx)!==radius &&
Math.abs(dy)!==radius
)
continue;


let x=
targetX+dx;


let y=
targetY+dy;


if(
x<0 ||
y<0 ||
x>=world.width ||
y>=world.height
)
continue;


if(
!this.canEnemyOccupy(
world,
x+0.5,
y+0.5
)
)
continue;


let ddx=
x-fromX;


let ddy=
y-fromY;


candidates.push({

x:x,
y:y,

distance:
ddx*ddx+
ddy*ddy

});


}


}


if(candidates.length>0){


candidates.sort(
(a,b)=>
a.distance-b.distance
);


return {

x:candidates[0].x,
y:candidates[0].y

};


}


}


return null;


}


canEnemyOccupy(world,x,y){

// ======================
// FUSS-HITBOX DES GEGNERS
// ======================
//
// Wie beim Spieler wird nicht nur der Mittelpunkt geprüft.
// Stattdessen müssen alle vier Ecken der kleinen Fuß-Hitbox
// auf begehbaren Welt-Tiles liegen. Dadurch können Gegner
// nicht mehr an Bäumen, Erzen, Steinen, Wasser oder Gebäuden
// vorbeischneiden bzw. optisch darüber laufen.

const EPSILON=0.0001;

const hitboxWidth=0.70;

const hitboxTopOffset=0.05;
const hitboxBottomOffset=0.38;

const left=x-hitboxWidth/2;
const right=x+hitboxWidth/2;

const top=y+hitboxTopOffset;
const bottom=y+hitboxBottomOffset;

const tileLeft=Math.floor(left);
const tileRight=Math.floor(right-EPSILON);
const tileTop=Math.floor(top);
const tileBottom=Math.floor(bottom-EPSILON);

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


removeEnemy(enemy){


let index=
this.enemies.indexOf(
enemy
);


if(index!==-1){


this.enemies.splice(
index,
1
);


return true;


}


return false;


}



draw(ctx,camera,canvas,tileSize=32){

if(!camera || !canvas)
return;

let directionRow={

down:0,
left:1,
right:2,
up:3

};

ctx.save();
ctx.imageSmoothingEnabled=false;

for(let enemy of this.enemies){

let row=directionRow[enemy.direction] ?? 0;
let frame=enemy.moving ? enemy.frame : 0;

let sourceX=frame*this.frameWidth;
let sourceY=row*this.frameHeight;

let drawWidth=Math.round(tileSize*1.35);
let drawHeight=Math.round(tileSize*1.35);

let screenX=(enemy.x-camera.x)*tileSize+canvas.width/2-drawWidth/2;
let screenY=(enemy.y-camera.y)*tileSize+canvas.height/2-drawHeight*0.72;

if(screenX<-80 || screenY<-80 || screenX>canvas.width+80 || screenY>canvas.height+80)
continue;

ctx.drawImage(
this.sprite,
sourceX,
sourceY,
this.frameWidth,
this.frameHeight,
Math.floor(screenX),
Math.floor(screenY),
drawWidth,
drawHeight
);

}

ctx.restore();

}

}
