export class BuildingInteraction{


constructor(
player,
buildingSystem,
backpack,
workbench,
furnace,
mechanicalWorkbench
){


this.player=player;


this.buildingSystem=buildingSystem;


this.backpack=backpack;


this.workbench=workbench;


this.furnace=furnace;


this.mechanicalWorkbench=
mechanicalWorkbench;


this.nearBuilding=null;





window.addEventListener(
"keydown",
(e)=>{



// ======================
// GEBÄUDE ENTFERNEN
// ======================


if(
e.key.toLowerCase()==="x"
){


if(
this.nearBuilding
){



this.buildingSystem.removeAt(

this.nearBuilding.x,

this.nearBuilding.y

);



this.nearBuilding=null;



}



}






// ======================
// GEBÄUDE BENUTZEN
// ======================


if(
e.key.toLowerCase()==="e"
){


// HANDWERKSBANK


if(
this.nearBuilding &&
this.nearBuilding.id==="crafting_table"
){



if(this.workbench){


this.workbench.openMenu();


}



}



// OFEN


if(
this.nearBuilding &&
this.nearBuilding.id==="furnace"
){


if(this.furnace){


this.furnace.openMenu();


}


}



// MECHANISCHE WERKBANK


if(
this.nearBuilding &&
this.nearBuilding.id==="mechanical_workbench"
){


if(this.mechanicalWorkbench){


this.mechanicalWorkbench.openMenu();


}


}


}



});


}









update(){



this.nearBuilding=null;



let nearestDistance =
Infinity;



let nearestCenterDistance =
Infinity;







for(
let building of this.buildingSystem.buildings
){






// ======================
// NÄCHSTEN PUNKT DES
// GEBÄUDES BESTIMMEN
// ======================


let nearestX =
Math.max(

building.x,

Math.min(

this.player.x,

building.x+
building.width

)

);




let nearestY =
Math.max(

building.y,

Math.min(

this.player.y,

building.y+
building.height

)

);







// ======================
// DISTANZ ZUM RAND
// DES GEBÄUDES
// ======================


let dx =
this.player.x-
nearestX;



let dy =
this.player.y-
nearestY;




let distance =
Math.sqrt(

dx*dx+

dy*dy

);








// ======================
// ZUSÄTZLICHE DISTANZ
// ZUM GEBÄUDEMITTELPUNKT
//
// Wird nur benutzt,
// wenn zwei Gebäude exakt
// gleich nah am Spieler sind.
// ======================


let centerX =

building.x+
building.width/2;



let centerY =

building.y+
building.height/2;



let centerDX =

this.player.x-
centerX;



let centerDY =

this.player.y-
centerY;



let centerDistance =
Math.sqrt(

centerDX*centerDX+

centerDY*centerDY

);








// ======================
// INTERAKTIONSREICHWEITE
// ======================


if(
distance<1
){


// Ist dieses Gebäude näher
// als das bisher gefundene?


if(
distance<
nearestDistance
){


nearestDistance=
distance;


nearestCenterDistance=
centerDistance;


this.nearBuilding=
building;


}



// Falls beide exakt gleich
// nah am Rand sind:
//
// Das Gebäude nehmen,
// dessen Mittelpunkt näher ist.


else if(
distance===
nearestDistance &&
centerDistance<
nearestCenterDistance
){


nearestCenterDistance=
centerDistance;


this.nearBuilding=
building;


}



}



}



}









draw(ctx,canvas){



if(
!this.nearBuilding
)
return;




ctx.save();




ctx.fillStyle=
"rgba(0,0,0,0.75)";



ctx.fillRect(

canvas.width/2-150,

canvas.height-150,

300,

70

);





ctx.strokeStyle="white";


ctx.strokeRect(

canvas.width/2-150,

canvas.height-150,

300,

70

);





ctx.fillStyle="white";


ctx.font="16px Arial";


ctx.textAlign="center";






// ======================
// HANDWERKSBANK
// ======================


if(
this.nearBuilding.id==="crafting_table"
){



ctx.fillText(

"[E] Öffnen",

canvas.width/2,

canvas.height-130

);



}






// ======================
// OFEN
// ======================


if(
this.nearBuilding.id==="furnace"
){



ctx.fillText(

"[E] Öffnen",

canvas.width/2,

canvas.height-130

);



}



// ======================
// MECHANISCHE WERKBANK
// ======================


if(
this.nearBuilding.id==="mechanical_workbench"
){


ctx.fillText(

"[E] Öffnen",

canvas.width/2,

canvas.height-130

);


}






ctx.fillText(

"[X] Entfernen",

canvas.width/2,

canvas.height-100

);





ctx.restore();



}



}