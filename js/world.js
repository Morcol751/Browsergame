import {
COLLISION,
TILE_COLLISION,
BUILDING_COLLISION
} from "./collision.js";


export class World{


constructor(width,height){


this.width=width;
this.height=height;


this.spawnX=width/2;
this.spawnY=height/2;


this.tiles=[];

this.veins=[];

this.grassRotation=[];

// Einzelne X/Y-Felder können die Standard-Kollision überschreiben.
this.tileCollisionOverrides = new Map();


// Listener für Änderungen an einzelnen Welt-Tiles.
// Die WorldMap nutzt das, um nur den betroffenen
// Kartenpixel zu aktualisieren.
this.tileChangeListeners = [];




for(let y=0;y<this.height;y++){


this.tiles[y]=[];

this.grassRotation[y]=[];


for(let x=0;x<this.width;x++){


this.tiles[y][x]=0;


// zufällige Drehung für Gras
this.grassRotation[y][x] =
Math.floor(Math.random()*4);


}


}



this.generateRivers();

this.generateOres();

this.generateTrees();

this.convertRubberTrees();

this.generateStone();
}








// ==================================================
// FLÜSSE + SANDUFER
// ==================================================
// 3-4 organische Flüsse. Wasser = ore 13, Sand = ore 14.
// Die Flüsse werden VOR Ressourcen erzeugt. Wasser bleibt immer frei.
// Auf Sand dürfen später gezielt nur bestimmte Ressourcen entstehen.

generateRivers(){


// 6-7 Flüsse auf der Welt.
const riverCount = 6 + Math.floor(Math.random()*2);


// Gewünschter Abstand zwischen Flüssen, wenn sie über längere
// Strecken ungefähr parallel zueinander verlaufen.
const minParallelDistance = 500;


// Kreuzungen/Zusammenflüsse bleiben erlaubt. Deshalb wird ein
// neuer Fluss nur verworfen, wenn er an VIELEN Vergleichspunkten
// zu einem vorhandenen Fluss zu nah liegt.
const parallelSampleDistance = 24;
const maxAttemptsPerRiver = 100;


let acceptedRivers=[];



// ==================================================
// FLUSS-KANDIDAT ERZEUGEN
// ==================================================
//
// Der Fluss läuft grundsätzlich von einer Weltseite zur anderen,
// bekommt aber eine langsam wechselnde seitliche Fließrichtung.
// Dadurch entstehen große, unregelmäßige S-Kurven statt einer
// fast geraden Linie mit kleinem Zufallszittern.
// ==================================================

const buildRiverCandidate = ()=>{


let horizontal = Math.random()<0.5;
let points=[];
let steps = horizontal ? this.width : this.height;


let cross = horizontal
? this.height*(0.08+Math.random()*0.84)
: this.width*(0.08+Math.random()*0.84);


// Seitliche Geschwindigkeit des Flusses.
let crossVelocity =
(Math.random()-0.5)*1.6;


// Zielrichtung, in die der Fluss langsam hineinbiegt.
let targetVelocity =
(Math.random()-0.5)*3.6;


// Nach dieser Strecke wird ein neuer Bogen angesteuert.
let nextDirectionChange =
90 + Math.floor(Math.random()*170);


// Kleine zweite Bewegung, damit die Bögen nicht mathematisch
// perfekt aussehen.
let softDrift=0;


for(let i=0;i<steps;i+=3){


// Alle ca. 90-260 Tiles bekommt der Fluss ein neues
// seitliches Richtungsziel. Das sorgt für große Kurven.
if(i>=nextDirectionChange){


targetVelocity =
(Math.random()-0.5)*4.2;


nextDirectionChange =
i + 90 + Math.floor(Math.random()*170);


}


// Langsam zur neuen Zielrichtung hinbiegen.
crossVelocity +=
(targetVelocity-crossVelocity)*0.035;


// Leichte natürliche Unruhe, ohne Zickzack zu erzeugen.
softDrift +=
(Math.random()-0.5)*0.07;

softDrift *= 0.94;


// Geschwindigkeit begrenzen, damit der Fluss zwar starke Bögen
// macht, aber nicht plötzlich quer über die halbe Karte springt.
crossVelocity = Math.max(
-2.4,
Math.min(2.4,crossVelocity)
);


cross +=
(crossVelocity+softDrift)*3;


let x = horizontal ? i : Math.round(cross);
let y = horizontal ? Math.round(cross) : i;


// Flüsse dürfen am Kartenrand kurz hinauslaufen und später
// wieder hineinkurven.
if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
continue;


points.push({x,y});


}


return {

horizontal,
points

};


};




// ==================================================
// ZU LANGE PARALLEL?
// ==================================================

const runsTooParallel = (candidate,existing)=>{


// Senkrecht verlaufende Flüsse dürfen sich kreuzen.
if(candidate.horizontal!==existing.horizontal)
return false;


let closeSamples=0;
let comparedSamples=0;


for(
let i=0;
i<candidate.points.length;
i+=parallelSampleDistance
){


let a=candidate.points[i];


let start=Math.max(
0,
i-parallelSampleDistance
);


let end=Math.min(
existing.points.length-1,
i+parallelSampleDistance
);


let nearest=Infinity;


for(
let j=start;
j<=end;
j+=6
){


let b=existing.points[j];


if(!b)
continue;


let dx=a.x-b.x;
let dy=a.y-b.y;


let d=Math.sqrt(
dx*dx+
dy*dy
);


if(d<nearest)
nearest=d;


}


if(nearest===Infinity)
continue;


comparedSamples++;


if(nearest<minParallelDistance)
closeSamples++;


}


if(comparedSamples===0)
return false;


// Ein kurzer Kontakt / eine Kreuzung bleibt okay.
// Erst wenn >= 30 % des Verlaufs zu nah sind,
// gilt der Kandidat als zu parallel.
return (
closeSamples/comparedSamples
)>=0.30;


};




// ==================================================
// FLUSSZEICHNUNG
// ==================================================
//
// WICHTIG:
// Wasser und Sand werden jetzt getrennt erzeugt.
// Erst kommen ALLE Wasserläufe, danach erst die Sandufer.
// Dadurch kann Sand niemals bereits vorhandenes Wasser
// überschreiben und mitten im Fluss eine Sandbrücke bilden.
// ==================================================

// ==================================================
// FLÜSSE AUSWÄHLEN + ZEICHNEN
// ==================================================

for(let r=0;r<riverCount;r++){


let accepted=null;


for(
let attempt=0;
attempt<maxAttemptsPerRiver;
attempt++
){


let candidate=buildRiverCandidate();


if(candidate.points.length<50)
continue;


let rejected=false;


for(let existing of acceptedRivers){


if(runsTooParallel(candidate,existing)){

rejected=true;
break;

}


}


if(rejected)
continue;


accepted=candidate;
break;


}


if(!accepted)
continue;


acceptedRivers.push(accepted);


}



// ==================================================
// PASS 1: ALLE FLÜSSE ALS WASSER ZEICHNEN
// ==================================================

for(let river of acceptedRivers){


for(let pnt of river.points){


let waterRadius =
2 + Math.floor(Math.random()*3); // ca. 5-9 Tiles


for(let dy=-waterRadius;dy<=waterRadius;dy++){


for(let dx=-waterRadius;dx<=waterRadius;dx++){


let x=pnt.x+dx;
let y=pnt.y+dy;


if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
continue;


let d=Math.sqrt(dx*dx+dy*dy);


if(d<=waterRadius){


this.tiles[y][x]={

ore:13,
quality:1

};


}


}


}


}


}




// ==================================================
// SEEN + VIELE FLUSSARME
// ==================================================
//
// Hauptidee:
//
// - Hauptflüsse bleiben klar erkennbare Hauptläufe.
// - Jeder Hauptfluss bekommt viele kleinere Seitenarme.
// - Viele Seen entstehen AM ENDE oder entlang dieser Arme.
// - Weitere Seen liegen frei auf dem Festland.
// - Seen werden NICHT mehr mitten auf Hauptflüsse gesetzt.
// - Sand entsteht weiterhin erst danach für ALLES Wasser.
//
// Dadurch wirkt das Gewässernetz eher wie:
//
// Hauptfluss -> Seitenarm -> See
//
// statt:
// Hauptfluss -> zufälliger großer See direkt im Fluss.
// ==================================================


const paintWaterCircle = (cx,cy,radius)=>{


for(let dy=-radius;dy<=radius;dy++){


for(let dx=-radius;dx<=radius;dx++){


let x=Math.round(cx+dx);
let y=Math.round(cy+dy);


if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
continue;


let d=Math.sqrt(dx*dx+dy*dy);


// Unregelmäßiger Rand statt perfektem Kreis.
let edge =
radius*(
0.86+
Math.random()*0.22
);


if(d>edge)
continue;


this.tiles[y][x]={

ore:13,
quality:1

};


}


}


};



const paintWaterPath = (points,minRadius,maxRadius)=>{


for(let pnt of points){


let radius =
minRadius+
Math.floor(
Math.random()*
(maxRadius-minRadius+1)
);


paintWaterCircle(
pnt.x,
pnt.y,
radius
);


}


};



const distanceToMainRiver = (x,y)=>{


let nearest=Infinity;


for(let river of acceptedRivers){


for(
let i=0;
i<river.points.length;
i+=18
){


let p=river.points[i];


let dx=p.x-x;
let dy=p.y-y;


let d=
Math.sqrt(
dx*dx+
dy*dy
);


if(d<nearest)
nearest=d;


}


}


return nearest;


};



// --------------------------------------------------
// VIELE FLUSSARME
// --------------------------------------------------
//
// 4-7 Arme pro Hauptfluss.
// Sie sind deutlich schmaler als der Hauptfluss,
// laufen 180-600 Tiles ins Land und können sich
// stärker winden.
//
// Ihre Endpunkte werden gespeichert, damit dort
// bevorzugt Seen entstehen können.
// --------------------------------------------------

let armEndpoints=[];

let armMidpoints=[];


for(let river of acceptedRivers){


let armCount =
4 + Math.floor(Math.random()*4);


for(let a=0;a<armCount;a++){


if(river.points.length<20)
continue;


let startIndex =
Math.floor(
river.points.length*(
0.08+
Math.random()*0.84
)
);


let start =
river.points[
Math.min(
river.points.length-1,
startIndex
)
];


let x=start.x;
let y=start.y;


let length =
180 + Math.floor(Math.random()*421);


// Seitenarme sollen grob vom Hauptfluss wegziehen.
// Dafür nehmen wir zunächst eine zufällige Richtung,
// vermeiden aber absichtlich fast-parallele Starts.
let angle =
Math.random()*Math.PI*2;


if(river.horizontal){

// Bei horizontalem Hauptfluss bevorzugt nach oben/unten.
angle =
(
Math.random()<0.5
? -Math.PI/2
: Math.PI/2
)
+
(Math.random()-0.5)*1.15;

}
else{

// Bei vertikalem Hauptfluss bevorzugt nach links/rechts.
angle =
(
Math.random()<0.5
? Math.PI
: 0
)
+
(Math.random()-0.5)*1.15;

}


let turnVelocity =
(Math.random()-0.5)*0.045;


let targetTurn =
(Math.random()-0.5)*0.06;


let nextTurnChange =
35 + Math.floor(Math.random()*70);


let points=[];


for(let step=0;step<length;step+=2){


if(step>=nextTurnChange){


targetTurn =
(Math.random()-0.5)*0.075;


nextTurnChange =
step+
35+
Math.floor(Math.random()*85);


}


turnVelocity +=
(targetTurn-turnVelocity)*0.045;


turnVelocity +=
(Math.random()-0.5)*0.004;


turnVelocity *=0.975;


angle += turnVelocity;


x += Math.cos(angle)*2;
y += Math.sin(angle)*2;


if(
x<3 ||
y<3 ||
x>=this.width-3 ||
y>=this.height-3
)
break;


points.push({

x:Math.round(x),
y:Math.round(y)

});


}


if(points.length<12)
continue;


paintWaterPath(
points,
1,
2
);


// Endpunkt für Seen merken.
let endPoint =
points[
points.length-1
];


armEndpoints.push({

x:endPoint.x,
y:endPoint.y

});


// Zusätzlich einen Punkt im hinteren Drittel merken,
// damit manche Seen nicht ausschließlich exakt am Ende liegen.
let midIndex =
Math.floor(
points.length*(
0.55+
Math.random()*0.30
)
);


let midPoint =
points[
Math.min(
points.length-1,
midIndex
)
];


armMidpoints.push({

x:midPoint.x,
y:midPoint.y

});


}


}



// --------------------------------------------------
// SEE MALEN
// --------------------------------------------------
//
// Ein See besteht aus mehreren überlappenden Blobs.
// Dadurch bleibt seine Form unregelmäßig.
// --------------------------------------------------

const paintOrganicLake = (lakeX,lakeY,sizeClass)=>{


let radiusX;
let radiusY;


if(sizeClass==="small"){

radiusX=8+Math.random()*12;
radiusY=7+Math.random()*11;

}
else if(sizeClass==="medium"){

radiusX=18+Math.random()*22;
radiusY=15+Math.random()*20;

}
else{

radiusX=38+Math.random()*42;
radiusY=30+Math.random()*38;

}


let blobs =
5 + Math.floor(Math.random()*6);


for(let b=0;b<blobs;b++){


let offsetX =
(Math.random()-0.5)*
radiusX*0.95;


let offsetY =
(Math.random()-0.5)*
radiusY*0.95;


let blobRadius =
Math.max(
5,
Math.round(
Math.min(
radiusX,
radiusY
)*
(
0.42+
Math.random()*0.46
)
)
);


paintWaterCircle(
lakeX+offsetX,
lakeY+offsetY,
blobRadius
);


}


};



// --------------------------------------------------
// SEEN AN FLUSSARMEN
// --------------------------------------------------
//
// Der größte Teil der Seen entsteht an Seitenarmen.
// Der Arm läuft also sichtbar in den See hinein.
// --------------------------------------------------

let usedArmLakePoints=[];


let armLakeCandidates =
[
...armEndpoints,
...armMidpoints
];


// Kandidaten mischen.
for(
let i=armLakeCandidates.length-1;
i>0;
i--
){


let j=
Math.floor(
Math.random()*(i+1)
);


let tmp=
armLakeCandidates[i];

armLakeCandidates[i]=
armLakeCandidates[j];

armLakeCandidates[j]=tmp;


}


// 26-38 Seen bevorzugt an Armen,
// sofern genug Arme entstanden sind.
let desiredArmLakes =
26 + Math.floor(Math.random()*13);


let armLakesMade=0;


for(let candidate of armLakeCandidates){


if(armLakesMade>=desiredArmLakes)
break;


// Seen sollen sich nicht ständig direkt überlappen.
let tooClose=false;


for(let used of usedArmLakePoints){


let dx=
candidate.x-used.x;

let dy=
candidate.y-used.y;


if(
Math.sqrt(
dx*dx+
dy*dy
)<90
){

tooClose=true;
break;

}


}


if(tooClose)
continue;


// Ein Arm darf am Hauptfluss starten,
// aber der See selbst soll nicht direkt im Hauptfluss liegen.
if(
distanceToMainRiver(
candidate.x,
candidate.y
)<45
)
continue;


let roll=Math.random();

let sizeClass =
roll<0.48
? "small"
: (
roll<0.84
? "medium"
: "large"
);


paintOrganicLake(
candidate.x,
candidate.y,
sizeClass
);


usedArmLakePoints.push(candidate);

armLakesMade++;


}



// --------------------------------------------------
// FREIE FESTLAND-SEEN
// --------------------------------------------------
//
// Zusätzlich 18-28 Seen frei in der Landschaft.
// Sie müssen einen deutlichen Abstand zu Hauptflüssen haben,
// damit sie wirklich wie eigenständige Seen wirken.
// --------------------------------------------------

let inlandLakeCount =
18 + Math.floor(Math.random()*11);


let inlandMade=0;

let inlandAttempts=0;


while(
inlandMade<inlandLakeCount &&
inlandAttempts<inlandLakeCount*60
){


inlandAttempts++;


let lakeX =
60+
Math.random()*
Math.max(
1,
this.width-120
);


let lakeY =
60+
Math.random()*
Math.max(
1,
this.height-120
);


// Nicht mitten auf Hauptflüsse.
if(
distanceToMainRiver(
lakeX,
lakeY
)<120
)
continue;


// Nicht zu dicht an andere bewusst platzierte Seen.
let tooClose=false;


for(let used of usedArmLakePoints){


let dx=
lakeX-used.x;

let dy=
lakeY-used.y;


if(
Math.sqrt(
dx*dx+
dy*dy
)<110
){

tooClose=true;
break;

}


}


if(tooClose)
continue;


let roll=Math.random();

let sizeClass =
roll<0.50
? "small"
: (
roll<0.87
? "medium"
: "large"
);


paintOrganicLake(
lakeX,
lakeY,
sizeClass
);


usedArmLakePoints.push({

x:lakeX,
y:lakeY

});


inlandMade++;


}



// ==================================================
// PASS 2: SANDUFER AUS DER FERTIGEN WASSERFLÄCHE
// ==================================================
//
// Sand wird NUR auf Gras gesetzt.
// Wasser (ore 13) kann daher niemals von Sand überschrieben werden.
// Uferbreite bleibt wie bisher bei 1-2 Tiles.
// ==================================================

let waterTiles=[];


for(let y=0;y<this.height;y++){


for(let x=0;x<this.width;x++){


let tile=this.tiles[y][x];


if(
tile!==0 &&
tile.ore===13
){


waterTiles.push({x,y});


}


}


}



for(let water of waterTiles){


let sandWidth =
1 + Math.floor(Math.random()*2);


for(let dy=-sandWidth;dy<=sandWidth;dy++){


for(let dx=-sandWidth;dx<=sandWidth;dx++){


if(dx===0 && dy===0)
continue;


let x=water.x+dx;
let y=water.y+dy;


if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
continue;


// Nur Gras darf zu Sand werden.
if(this.tiles[y][x]!==0)
continue;


let d=Math.sqrt(dx*dx+dy*dy);


if(d>sandWidth)
continue;


this.tiles[y][x]={

ore:14,
quality:1

};


}


}


}



// ==================================================
// SICHERER SPIELERSPAWN
// ==================================================
//
// Flüsse dürfen jetzt direkt durch das Spawngebiet laufen.
// Falls der eigentliche Spawnpunkt Wasser ist, wird nur eine
// kleine 5x5-Sandfläche erzeugt. Der Fluss bleibt ansonsten
// vollständig bestehen.
// ==================================================

let spawnX=Math.floor(this.spawnX);
let spawnY=Math.floor(this.spawnY);


let spawnTile=this.getTile(
spawnX,
spawnY
);


if(
spawnTile!==0 &&
spawnTile.ore===13
){


for(let dy=-2;dy<=2;dy++){


for(let dx=-2;dx<=2;dx++){


let x=spawnX+dx;
let y=spawnY+dy;


if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
continue;


let tile=this.tiles[y][x];


// Nur Wasser am unmittelbaren Startpunkt ersetzen.
if(
tile!==0 &&
tile.ore===13
){


this.tiles[y][x]={

ore:14,
quality:1

};


}


}


}


}


}




generateOres(){


const worldScale =
(this.width * this.height) /
(1600 * 1600);

let totalVeins =
Math.round(
3200 * worldScale
);



for(let i=0;i<totalVeins;i++){



let x;
let y;


let tries=0;



do{


x=Math.floor(
Math.random()*this.width
);


y=Math.floor(
Math.random()*this.height
);



tries++;


}
while(

this.distanceFromSpawn(x,y)<80
&&
tries<100

);





if(this.isTooClose(x,y))
continue;





let distance =
this.distanceFromSpawn(x,y);



let ore =
this.chooseOre(distance);





let size =
this.getVeinSize(ore);





this.createVein(

x,

y,

ore,

size

);





this.veins.push({

x:x,

y:y

});



}



}









generateTrees(){


const worldScale =
(this.width * this.height) /
(1600 * 1600);


// Gleiche Grundmenge wie vorher:
// 200 Waldzentren auf 1600x1600, hochskaliert mit der Welt.
let forests =
Math.round(
95 * worldScale
);



for(let i=0;i<forests;i++){


let centerX =
Math.floor(
Math.random()*this.width
);


let centerY =
Math.floor(
Math.random()*this.height
);


if(
this.distanceFromSpawn(centerX,centerY)<80
)
continue;


// Die bisherige Waldgröße bleibt als Mengenbasis erhalten.
let size =
Math.floor(
Math.random()*6
)+8;


// Statt eines perfekten Kreises bekommt jeder Wald mehrere
// leicht versetzte natürliche Teilbereiche.
// Die Spawn-Chance wird entsprechend reduziert, damit die
// Gesamtmenge ungefähr auf dem bisherigen Niveau bleibt.
let lobes =
2 + Math.floor(Math.random()*3);


for(let l=0;l<lobes;l++){


let angle =
Math.random()*Math.PI*2;


let offset =
Math.random()*size*0.75;


let lobeX =
Math.round(
centerX+
Math.cos(angle)*offset
);


let lobeY =
Math.round(
centerY+
Math.sin(angle)*offset
);


let radius =
size*(
0.55+
Math.random()*0.35
);


for(
let x=Math.floor(-radius);
x<=Math.ceil(radius);
x++
){


for(
let y=Math.floor(-radius);
y<=Math.ceil(radius);
y++
){


let distance =
Math.sqrt(
x*x+y*y
);


if(distance>radius)
continue;


let chance =
(1-(distance/radius))
*
(0.72/lobes);


if(
Math.random()>chance
)
continue;


let treeX =
lobeX+x;


let treeY =
lobeY+y;


if(
treeX<0 ||
treeY<0 ||
treeX>=this.width ||
treeY>=this.height
)
continue;


let treeBase =
this.tiles[treeY][treeX];


// Bäume dürfen auf Gras und Sand entstehen.
if(
treeBase!==0 &&
!(treeBase.ore===14 && !treeBase.building)
)
continue;


this.tiles[treeY][treeX]={

ore:1,

quality:
this.generateWoodQuality(),

underlyingOre:
treeBase!==0 &&
treeBase.ore===14
? 14
: 0

};


}


}


}


// Kleine natürliche Ausläufer um denselben Wald.
// Das sind keine zusätzlichen Ressourcen-Budgets:
// die Hauptflächen oben wurden dafür bewusst lockerer gemacht.
let fringeAttempts =
Math.round(
size*1.8
);


for(let f=0;f<fringeAttempts;f++){


let angle =
Math.random()*Math.PI*2;


let distance =
size*(
0.65+
Math.random()*1.25
);


let treeX =
Math.round(
centerX+
Math.cos(angle)*distance
);


let treeY =
Math.round(
centerY+
Math.sin(angle)*distance
);


if(
treeX<0 ||
treeY<0 ||
treeX>=this.width ||
treeY>=this.height
)
continue;


let treeBase =
this.tiles[treeY][treeX];


if(
treeBase!==0 &&
!(treeBase.ore===14 && !treeBase.building)
)
continue;


// Nicht jeder Ausläufer wird tatsächlich gesetzt.
if(Math.random()>0.42)
continue;


this.tiles[treeY][treeX]={

ore:1,

quality:
this.generateWoodQuality(),

underlyingOre:
treeBase!==0 &&
treeBase.ore===14
? 14
: 0

};


}


}


}




convertRubberTrees(){

// Ein Drittel aller erzeugten Bäume wird zu Kautschukbäumen.
// Dadurch bleibt die Gesamtzahl der Bäume praktisch unverändert.
// Kautschuk kann mitten in normalen Wäldern vorkommen, wird aber
// deutlich in Richtung Flüsse, Seitenarme und Seen gewichtet.

let trees=[];

for(let y=0;y<this.height;y++){
for(let x=0;x<this.width;x++){

let tile=this.tiles[y][x];

if(tile!==0 && !tile.building && tile.ore===1){
trees.push({x,y});
}

}
}

let target=Math.round(trees.length/3);

const nearWater=(x,y)=>{

// Kleine Umgebung reicht aus, damit Uferbereiche stark bevorzugt
// werden, ohne die Weltgeneration unnötig teuer zu machen.
let radius=8;

for(let dy=-radius;dy<=radius;dy++){
for(let dx=-radius;dx<=radius;dx++){

if(dx*dx+dy*dy>radius*radius)
continue;

let tx=x+dx;
let ty=y+dy;

if(tx<0 || ty<0 || tx>=this.width || ty>=this.height)
continue;

let t=this.tiles[ty][tx];

if(t!==0 && t.ore===13)
return true;

}
}

return false;

};

// Gewichtete Zufallsauswahl ohne zusätzliche Bäume zu erzeugen.
// Wassernahe Bäume erhalten ein deutlich höheres Gewicht, trotzdem
// bleiben Kautschukbäume auch innerhalb normaler Wälder möglich.
for(let tree of trees){

let weight=nearWater(tree.x,tree.y) ? 5 : 1;

tree.key=Math.pow(Math.random(),1/weight);

}

trees.sort((a,b)=>b.key-a.key);

for(let i=0;i<target;i++){

let tree=trees[i];
let tile=this.tiles[tree.y][tree.x];

if(tile===0 || tile.ore!==1)
continue;

tile.ore=15;

}

}





generateStone(){


const worldScale =
(this.width * this.height) /
(1600 * 1600);


// Gleiche Grundmenge wie vorher:
// 500 Steinfeld-Zentren auf 1600x1600.
let stones =
Math.round(
175 * worldScale
);



for(let i=0;i<stones;i++){


let centerX =
Math.floor(
Math.random()*this.width
);


let centerY =
Math.floor(
Math.random()*this.height
);


if(
this.distanceFromSpawn(centerX,centerY)<100
)
continue;


let stoneCenterBase =
this.tiles[centerY][centerX];


if(
stoneCenterBase!==0 &&
!(stoneCenterBase.ore===14 && !stoneCenterBase.building)
)
continue;


// Bisherige Größenbasis 4-9 bleibt erhalten.
let size =
Math.floor(
Math.random()*6
)+4;


// Auch Steinfelder werden aus mehreren kleinen,
// versetzten Teilflächen aufgebaut statt aus einem runden Fleck.
let lobes =
2 + Math.floor(Math.random()*3);


for(let l=0;l<lobes;l++){


let angle =
Math.random()*Math.PI*2;


let offset =
Math.random()*size*0.8;


let lobeX =
Math.round(
centerX+
Math.cos(angle)*offset
);


let lobeY =
Math.round(
centerY+
Math.sin(angle)*offset
);


let radius =
size*(
0.55+
Math.random()*0.4
);


for(
let dx=Math.floor(-radius);
dx<=Math.ceil(radius);
dx++
){


for(
let dy=Math.floor(-radius);
dy<=Math.ceil(radius);
dy++
){


let distance =
Math.sqrt(
dx*dx+
dy*dy
);


if(distance>radius)
continue;


let chance =
(1-(distance/radius))
*
(0.78/lobes);


if(
Math.random()>chance
)
continue;


let sx =
lobeX+dx;


let sy =
lobeY+dy;


if(
sx<0 ||
sy<0 ||
sx>=this.width ||
sy>=this.height
)
continue;


let stoneBase =
this.tiles[sy][sx];


if(
stoneBase!==0 &&
!(stoneBase.ore===14 && !stoneBase.building)
)
continue;


this.tiles[sy][sx]={

ore:12,

quality:
this.generateStoneQuality(),

underlyingOre:
stoneBase!==0 &&
stoneBase.ore===14
? 14
: 0

};


}


}


}


// Ein paar lockere Brocken am Rand des Steinfelds.
let fringeAttempts =
Math.round(
size*1.4
);


for(let f=0;f<fringeAttempts;f++){


let angle =
Math.random()*Math.PI*2;


let distance =
size*(
0.65+
Math.random()*1.15
);


let sx =
Math.round(
centerX+
Math.cos(angle)*distance
);


let sy =
Math.round(
centerY+
Math.sin(angle)*distance
);


if(
sx<0 ||
sy<0 ||
sx>=this.width ||
sy>=this.height
)
continue;


let stoneBase =
this.tiles[sy][sx];


if(
stoneBase!==0 &&
!(stoneBase.ore===14 && !stoneBase.building)
)
continue;


if(Math.random()>0.38)
continue;


this.tiles[sy][sx]={

ore:12,

quality:
this.generateStoneQuality(),

underlyingOre:
stoneBase!==0 &&
stoneBase.ore===14
? 14
: 0

};


}


}


}






distanceFromSpawn(x,y){


let dx=x-this.spawnX;

let dy=y-this.spawnY;



return Math.sqrt(

dx*dx+

dy*dy

);



}









chooseOre(distance){


// ==================================================
// ERZVERTEILUNG
// ==================================================
//
// Ziel: deutlich weichere Abstufung als vorher.
// Entfernung vom Spawn erhöht weiterhin die Chance
// auf seltene Erze, aber KEIN Erz kann mehr durch
// überlappende Grenzwerte "verschwinden".
//
// Gewichte werden normalisiert und anschließend
// sauber ausgewürfelt.
// ==================================================


// 0 nahe Spawn, bis ungefähr 1 am äußeren Kartenbereich.
let distanceFactor =
Math.min(
1,
Math.max(
0,
distance/1700
)
);


// Grundgewichte.
// Reihenfolge: Kohle, Kupfer, Eisen, Silber, Gold,
// Diamant, Kobalt, Mithril, Obsidian, Adamant.
let weights = [

{type:2,  weight:14.5}, // Kohle
{type:3,  weight:17.0}, // Kupfer
{type:4,  weight:17.0}, // Eisen
{type:5,  weight:14.0}, // Silber
{type:6,  weight:13.5}, // Gold
{type:7,  weight:10.0}, // Diamant
{type:8,  weight:9.0},  // Kobalt
{type:9,  weight:8.5},  // Mithril
{type:10, weight:7.5},  // Obsidian
{type:11, weight:6.0}   // Adamant

];


// Mit Entfernung werden häufige Erze etwas schwächer
// und seltene Erze etwas stärker.
// Die Veränderung bleibt absichtlich moderat.
for(let entry of weights){


switch(entry.type){


case 2:
entry.weight *=
1.18 - distanceFactor*0.32;
break;


case 3:
entry.weight *=
1.12 - distanceFactor*0.20;
break;


case 4:
entry.weight *=
1.10 - distanceFactor*0.16;
break;


case 5:
entry.weight *=
0.95 + distanceFactor*0.18;
break;


case 6:
entry.weight *=
0.90 + distanceFactor*0.30;
break;


case 7:
entry.weight *=
0.84 + distanceFactor*0.46;
break;


case 8:
entry.weight *=
0.78 + distanceFactor*0.62;
break;


case 9:
entry.weight *=
0.72 + distanceFactor*0.82;
break;


case 10:
entry.weight *=
0.66 + distanceFactor*1.05;
break;


case 11:
entry.weight *=
0.55 + distanceFactor*1.55;
break;


}


}


let totalWeight=0;


for(let entry of weights){

totalWeight +=
entry.weight;

}


let roll =
Math.random()*totalWeight;


for(let entry of weights){


roll -=
entry.weight;


if(roll<=0)
return entry.type;


}


// Sicherheitsfallback.
return 2;


}




getVeinSize(type){


switch(type){


case 2:return 7;

case 3:return 6;

case 4:return 6;

case 5:return 6;

case 6:return 5;

case 7:return 5;

case 8:return 5;

case 9:return 4;

case 10:return 4;

case 11:return 3;


}



}









isTooClose(x,y){



for(let v of this.veins){


let dx=x-v.x;

let dy=y-v.y;


let d=Math.sqrt(
dx*dx+
dy*dy
);



if(d<35)
return true;



}



return false;



}









createVein(x,y,type,size){


// ==================================================
// NATÜRLICHE ERZADER
// ==================================================
//
// Die Erzart, Aderanzahl und Grundgröße bleiben unverändert.
// Nur die Form wird organischer:
//
// - mehrere leicht versetzte Teilbereiche
// - unregelmäßige Ränder
// - kleine Ausläufer
//
// Dadurch entstehen weniger perfekte Kreise,
// ohne die Erzmenge massiv zu erhöhen.
// ==================================================


let lobes =
2 + Math.floor(Math.random()*3);


for(let l=0;l<lobes;l++){


let angle =
Math.random()*Math.PI*2;


let offset =
Math.random()*size*0.7;


let lobeX =
Math.round(
x+
Math.cos(angle)*offset
);


let lobeY =
Math.round(
y+
Math.sin(angle)*offset
);


let radius =
size*(
0.55+
Math.random()*0.4
);


for(
let dx=Math.floor(-radius);
dx<=Math.ceil(radius);
dx++
){


for(
let dy=Math.floor(-radius);
dy<=Math.ceil(radius);
dy++
){


let dist =
Math.sqrt(
dx*dx+
dy*dy
);


if(dist>radius)
continue;


// Weil mehrere Teilflächen erzeugt werden,
// wird die Chance pro Teilfläche reduziert.
// So bleibt die Gesamtmenge ungefähr
// auf dem bisherigen Niveau.
let chance =
(1-(dist/radius))
*
(1.55/lobes);


if(
Math.random()>chance
)
continue;


let nx =
lobeX+dx;


let ny =
lobeY+dy;


if(
nx<0 ||
ny<0 ||
nx>=this.width ||
ny>=this.height
)
continue;


let baseTile =
this.tiles[ny][nx];


let canUseGrass =
baseTile===0;


let canUseSand =
(type===2 || type===3) &&
baseTile!==0 &&
baseTile.ore===14 &&
!baseTile.building;


if(
!canUseGrass &&
!canUseSand
)
continue;


this.tiles[ny][nx]={

ore:type,

quality:
this.generateQuality(),

underlyingOre:
canUseSand
? 14
: 0

};


}


}


}



// ==================================================
// KLEINE AUSLÄUFER
// ==================================================
//
// Ein paar einzelne Erzstücke direkt um die Hauptader.
// Keine weit verstreuten Einzelspawns.
// ==================================================


let fringeAttempts =
Math.max(
2,
Math.round(size*1.6)
);


for(
let f=0;
f<fringeAttempts;
f++
){


let angle =
Math.random()*Math.PI*2;


let distance =
size*(
0.65+
Math.random()*0.9
);


let nx =
Math.round(
x+
Math.cos(angle)*distance
);


let ny =
Math.round(
y+
Math.sin(angle)*distance
);


if(
nx<0 ||
ny<0 ||
nx>=this.width ||
ny>=this.height
)
continue;


let baseTile =
this.tiles[ny][nx];


let canUseGrass =
baseTile===0;


let canUseSand =
(type===2 || type===3) &&
baseTile!==0 &&
baseTile.ore===14 &&
!baseTile.building;


if(
!canUseGrass &&
!canUseSand
)
continue;


if(
Math.random()>0.34
)
continue;


this.tiles[ny][nx]={

ore:type,

quality:
this.generateQuality(),

underlyingOre:
canUseSand
? 14
: 0

};


}


}




generateQuality(){


let r=Math.random();




if(r<0.02)
return 3;




if(r<0.20)
return 2;




return 1;



}









generateWoodQuality(){


let r=Math.random();




if(r<0.005)
return 3;




if(r<0.10)
return 2;




return 1;



}









generateStoneQuality(){


let r=Math.random();




if(r<0.01)
return 3;




if(r<0.15)
return 2;




return 1;



}









getAmount(q){


if(q===3)
return 5;



if(q===2)
return 3;



return 1;



}









getTile(x,y){


if(

x<0 ||
y<0 ||
x>=this.width ||
y>=this.height

)
return 0;



return this.tiles[y][x];


}





// ==================================================
// TILE-KOLLISION
// ==================================================

getTileCollision(x,y){

// Außerhalb der Welt ist immer blockiert.
if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
){
return COLLISION.NICHT_PASSIERBAR;
}


// Erst prüfen, ob dieses konkrete X/Y-Feld überschrieben wurde.
let key = x+","+y;

if(this.tileCollisionOverrides.has(key)){
return this.tileCollisionOverrides.get(key);
}


let tile = this.tiles[y][x];


// Gras ist bei dir als 0 gespeichert.
if(tile===0){
return TILE_COLLISION[0] ?? COLLISION.NICHT_PASSIERBAR;
}


// Gebäude haben eigene Regeln.
if(tile.building){
return (
BUILDING_COLLISION[tile.building] ??
COLLISION.NICHT_PASSIERBAR
);
}


// Ressourcen / Bäume / Steine / Erze über ore-ID.
return (
TILE_COLLISION[tile.ore] ??
COLLISION.NICHT_PASSIERBAR
);

}



isWalkable(x,y){

return (
this.getTileCollision(x,y)===
COLLISION.DRUEBERLAUFEN
);

}



setTileCollision(x,y,collision){

if(
x<0 ||
y<0 ||
x>=this.width ||
y>=this.height
)
return false;


if(
collision!==COLLISION.NICHT_PASSIERBAR &&
collision!==COLLISION.DRUEBERLAUFEN
)
return false;


this.tileCollisionOverrides.set(
x+","+y,
collision
);

return true;

}



clearTileCollision(x,y){

this.tileCollisionOverrides.delete(
x+","+y
);

}



exportTileCollisionOverrides(){

let result=[];

for(let [key,collision] of this.tileCollisionOverrides){

let parts=key.split(",");

result.push({
x:Number(parts[0]),
y:Number(parts[1]),
c:collision
});

}

return result;

}



importTileCollisionOverrides(data){

this.tileCollisionOverrides.clear();

if(!Array.isArray(data))
return;

for(let entry of data){

this.setTileCollision(
entry.x,
entry.y,
entry.c
);

}

}








getOreName(id){


return [

"Gras",

"Holz",

"Kohle",

"Kupfer",

"Eisen",

"Silber",

"Gold",

"Diamant",

"Kobalt",

"Mithril",

"Obsidian",

"Adamant",

"Stein",

"Wasser",

"Sand",

"Kautschukbaum"


][id];



}









getQualityName(id){


return [


"",

"Normal",

"Selten",

"Legendär"


][id];



}









// ==================================================
// TILE-CHANGE EVENTS
// ==================================================

addTileChangeListener(listener){

if(
typeof listener!=="function"
)
return;

this.tileChangeListeners.push(
listener
);

}



notifyTileChanged(x,y){

for(
let listener of this.tileChangeListeners
){

listener(
x,
y
);

}

}






removeTile(x,y){


if(

x<0 ||
y<0 ||
x>=this.width ||
y>=this.height

)
return;



let tile=this.tiles[y][x];
let underlyingOre=
(tile!==0 && tile.underlyingOre)
? tile.underlyingOre
: 0;

if(underlyingOre===14){
this.tiles[y][x]={ore:14,quality:1};
}
else{
this.tiles[y][x]=0;
}


this.notifyTileChanged(
x,
y
);



}



}