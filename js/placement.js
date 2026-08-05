export class Placement{


constructor(
world,
buildingManager,
inventory,
backpack
){


this.world = world;

this.buildingManager =
buildingManager;

this.inventory =
inventory;

this.backpack =
backpack;

this.activeBuilding=null;



this.mouseX=0;
this.mouseY=0;



this.camera=null;
this.canvas=null;



window.addEventListener(
"mousemove",
(e)=>{


let canvas =
document.getElementById("game");


let rect =
canvas.getBoundingClientRect();


this.mouseX =
e.clientX-rect.left;


this.mouseY =
e.clientY-rect.top;


});





window.addEventListener(
"mousedown",
(e)=>{


if(e.button!==0)
return;


this.handleClick();


});


}







setCamera(camera,canvas){


this.camera=camera;

this.canvas=canvas;


}









getWorldMouse(){



let x =
Math.floor(

this.camera.x+

(
this.mouseX-
this.canvas.width/2
)
/32

);



let y =
Math.floor(

this.camera.y+

(
this.mouseY-
this.canvas.height/2
)
/32

);



return {
x,
y
};


}









handleClick(){



if(
!this.camera ||
!this.canvas
)
return;




let pos =
this.getWorldMouse();





let selected =
this.inventory.selectedSlot;



if(selected===null)
return;



let slot =
this.inventory.slots[selected];



if(!slot)
return;



let item =
slot.item;





// ======================
// GEBÄUDE SETZEN
// ======================


if(
item.type==="building"
){


let success =
this.buildingManager.place(
pos.x,
pos.y,
item
);



if(success){



let index =
this.backpack.items.indexOf(slot);



if(index!==-1){


if(slot.amount>1){

slot.amount--;

}
else{

this.backpack.items.splice(
index,
1
);


}


}



}



return;


}






// ======================
// GEBÄUDE ABBRECHEN
// ======================


let building =
this.buildingManager.getBuildingAt(
pos.x,
pos.y
);




if(
building
){



let tool =
this.inventory.getSelectedTool();



if(
tool.toolType==="axe"
){



this.buildingManager.removeAt(
pos.x,
pos.y
);


}



}



}




}