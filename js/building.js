import {ITEMS} from "./items.js";


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





case "mechanical_workbench":


return {

width:2,

height:1

};


case "cooking_station":


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


// Platzierungsfläche kommt direkt vom Item.
// land  = Gras oder Sand
// water = ausschließlich Wasser
// any   = Gras, Sand oder Wasser
// Neue Wassergebäude brauchen später also nur
// placementSurface:"water" in items.js.
let surface =
(this.placing && this.placing.placementSurface)
||
"land";


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


let isGrass =
tile===0;

let isSand =
tile!==0 &&
tile.ore===14 &&
!tile.building;

let isWater =
tile!==0 &&
tile.ore===13 &&
!tile.building;


if(surface==="water"){

if(!isWater)
return false;

}
else if(surface==="any"){

if(
!isGrass &&
!isSand &&
!isWater
)
return false;

}
else{

// Standard: Landgebäude niemals auf Wasser.
if(
!isGrass &&
!isSand
)
return false;

}

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


let oldTile = this.world.tiles[pos.y+dy][pos.x+dx];
let underlyingOre = (oldTile!==0 && oldTile.ore) ? oldTile.ore : 0;

this.world.tiles
[pos.y+dy]
[pos.x+dx]
=
{

building:this.placing.id,
underlyingOre:underlyingOre,

buildingPart:buildingPart,

ore:0,

quality:1

};


if(
typeof this.world.notifyTileChanged==="function"
){

this.world.notifyTileChanged(
pos.x+dx,
pos.y+dy
);

}



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

height:size.height,

// Untergrund jedes Gebäudefeldes speichern, damit beim
// Entfernen Sand/Wasser sauber wiederhergestellt wird.
underlyingTiles:(()=>{
let result=[];
for(let dx=0;dx<size.width;dx++){
for(let dy=0;dy<size.height;dy++){
let tile=this.world.tiles[pos.y+dy][pos.x+dx];
result.push({
dx:dx,
dy:dy,
ore:tile.underlyingOre || 0
});
}
}
return result;
})()

});








if(
this.inventory.backpack
){

this.inventory.backpack.removeItem(
this.placing,
1
);

}


let selectedEntry=
this.inventory.getSelectedItem();

let hasMore=
!!(
selectedEntry &&
selectedEntry.item &&
selectedEntry.item.id===this.placing.id &&
selectedEntry.amount>0
);


if(this.inventory.backpack.audio){

this.inventory.backpack.audio.playSound(
"place_building"
);

}


if(!hasMore){

this.cancel();

}



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



let savedUnderlying = 0;

if(Array.isArray(building.underlyingTiles)){
let saved=building.underlyingTiles.find(
t=>t.dx===dx && t.dy===dy
);
if(saved) savedUnderlying=saved.ore || 0;
}
else if(building.id==="wood_bridge"){
// Kompatibilität mit alten Brücken-Saves.
savedUnderlying=13;
}
else{
savedUnderlying=building.underlyingOre || 0;
}

if(savedUnderlying===13 || savedUnderlying===14){
this.world.tiles[building.y+dy][building.x+dx]={
ore:savedUnderlying,
quality:1
};

if(typeof this.world.notifyTileChanged==="function")
this.world.notifyTileChanged(building.x+dx,building.y+dy);
}
else{
this.world.removeTile(
building.x+dx,
building.y+dy
);
}



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
ITEMS.WOOD,
10
);


}





if(
building.id==="furnace"
){
this.inventory.backpack.add(ITEMS.STONE,10);
}


if(
building.id==="mechanical_workbench"
){

this.inventory.backpack.add(
ITEMS.WOOD_PLANKS,
2
);

this.inventory.backpack.add(
ITEMS.WOOD_ROD,
4
);

this.inventory.backpack.add(
ITEMS.IRON_BAR,
1
);

}


if(
building.id==="cooking_station"
){

this.inventory.backpack.add(
ITEMS.WOOD_PLANKS,
4
);

this.inventory.backpack.add(
ITEMS.STONE,
4
);

this.inventory.backpack.add(
ITEMS.IRON_BAR,
1
);

}


if(building.id==="wood_bridge"){
this.inventory.backpack.add(ITEMS.WOOD_BRIDGE,1);
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