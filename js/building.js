export class BuildingSystem{


constructor(world,inventory){


this.world=world;

this.inventory=inventory;


this.placing=null;


this.buildings=[];


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
"keydown",
(e)=>{


if(
e.key==="Escape"
){

this.cancel();

}


});






}







setCamera(camera,canvas){


this.camera=camera;

this.canvas=canvas;


}









startPlacing(item){


console.log("BUILD START", item);


if(!item)
return;


if(item.type!=="building")
return;


this.placing=item;


}









cancel(){


this.placing=null;


}









getSize(){



if(!this.placing)
return {

width:1,

height:1

};






switch(this.placing.id){



case "crafting_table":


return {

width:2,

height:1

};





case "furnace":


return {

width:1,

height:2

};





default:


return {

width:1,

height:1

};



}



}









getMouseWorld(){



return {


x:
Math.floor(
this.camera.x+
(
this.mouseX-
this.canvas.width/2
)
/32
),





y:
Math.floor(
this.camera.y+
(
this.mouseY-
this.canvas.height/2
)
/32
)



};



}









canPlace(x,y){



let size =
this.getSize();





for(
let dx=0;
dx<size.width;
dx++
){



for(
let dy=0;
dy<size.height;
dy++
){



let tile =
this.world.getTile(
x+dx,
y+dy
);





if(tile!==0)
return false;



}



}





return true;



}









place(){



if(!this.placing)
return;





let pos =
this.getMouseWorld();





if(
!this.canPlace(
pos.x,
pos.y
)
)
return;





let size =
this.getSize();






for(
let dx=0;
dx<size.width;
dx++
){



for(
let dy=0;
dy<size.height;
dy++
){



let buildingPart =
(dx===0 && dy===0)
?
"origin"
:
"child";


this.world.tiles
[pos.y+dy]
[pos.x+dx]
=
{

building:this.placing.id,

buildingPart:buildingPart,

ore:0,

quality:1

};



}



}





// Gebäude speichern

this.buildings.push({

id:this.placing.id,

name:this.placing.name,

icon:this.placing.icon,

x:pos.x,

y:pos.y,

width:size.width,

height:size.height

});








if(
this.inventory.backpack
){



this.inventory.backpack.removeItem(
this.placing
);



}









if(
this.inventory.selectedSlot!==null
){


this.inventory.slots[
this.inventory.selectedSlot
]=null;


}






if(this.inventory.backpack.audio){

this.inventory.backpack.audio.playSound(
"place_building"
);

}

this.cancel();



}









removeAt(x,y){



let index =
this.buildings.findIndex(
b=>

x>=b.x &&
x<b.x+b.width &&

y>=b.y &&
y<b.y+b.height

);




if(index===-1)
return;





let building =
this.buildings[index];





for(
let dx=0;
dx<building.width;
dx++
){



for(
let dy=0;
dy<building.height;
dy++
){



this.world.removeTile(
building.x+dx,
building.y+dy
);



}



}






this.buildings.splice(
index,
1
);

if(this.inventory.backpack.audio){

this.inventory.backpack.audio.playSound(
"remove_building"
);

}




// Ressourcen zurückgeben

if(
building.id==="crafting_table"
){


this.inventory.backpack.add(
{
id:"wood",
name:"Holz",
icon:"🌲",
type:"resource",
stack:100
},
10
);


}





if(
building.id==="furnace"
){


this.inventory.backpack.add(
{
id:"stone",
name:"Stein",
icon:"🪨",
type:"resource",
stack:100
},
10
);


}



}









update(camera,canvas){


this.camera=camera;

this.canvas=canvas;


}









drawPreview(ctx){



if(!this.placing)
return;





let pos =
this.getMouseWorld();





let size =
this.getSize();





let valid =
this.canPlace(
pos.x,
pos.y
);





ctx.save();





ctx.fillStyle =
valid
?
"rgba(0,120,255,0.5)"
:
"rgba(255,0,0,0.5)";






ctx.fillRect(


(pos.x-this.camera.x)
*
32+
this.canvas.width/2,



(pos.y-this.camera.y)
*
32+
this.canvas.height/2,



size.width*32,


size.height*32



);






ctx.restore();



}



}