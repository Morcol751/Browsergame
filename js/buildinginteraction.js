export class BuildingInteraction{


constructor(
player,
buildingSystem,
backpack,
workbench
){


this.player=player;


this.buildingSystem=buildingSystem;


this.backpack=backpack;


this.workbench=workbench;


this.nearBuilding=null;





window.addEventListener(
"keydown",
(e)=>{



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







if(
e.key.toLowerCase()==="e"
){


if(
this.nearBuilding &&
this.nearBuilding.id==="crafting_table"
){



if(this.workbench){


this.workbench.openMenu();


}



}



}



});



}









update(){



this.nearBuilding=null;





for(
let building of this.buildingSystem.buildings
){





let dx =
this.player.x-
(
building.x+
building.width/2
);




let dy =
this.player.y-
(
building.y+
building.height/2
);






let distance =
Math.sqrt(
dx*dx+
dy*dy
);







if(
distance<3
){



this.nearBuilding=building;


break;


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





if(
this.nearBuilding.id==="crafting_table"
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