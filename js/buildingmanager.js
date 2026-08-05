import {ITEMS} from "./items.js";


export class BuildingManager{


constructor(world,backpack){


this.world=world;

this.backpack=backpack;


this.buildings=[];


}









canPlace(x,y,building){



for(
let bx=0;
bx<building.width;
bx++
){


for(
let by=0;
by<building.height;
by++
){



let tile =
this.world.getTile(
x+bx,
y+by
);



if(tile!==0)
return false;





let exists =
this.buildings.find(
b=>

x+bx>=b.x &&
x+bx<b.x+b.width &&

y+by>=b.y &&
y+by<b.y+b.height

);



if(exists)
return false;



}



}



return true;



}









place(x,y,building){



if(
!this.canPlace(
x,
y,
building
)
)
return false;





this.buildings.push({


id:building.id,


name:building.name,


icon:building.icon,


x:x,


y:y,


width:building.width,


height:building.height



});



return true;



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
return null;





let building =
this.buildings[index];






// ==================================
// ALLE BELEGTEN TILES ENTFERNEN
// ==================================


for(
let bx=building.x;
bx<building.x+building.width;
bx++
){


for(
let by=building.y;
by<building.y+building.height;
by++
){


this.world.removeTile(
bx,
by
);



}


}








// ==================================
// GEBÄUDE AUS LISTE ENTFERNEN
// ==================================


this.buildings.splice(
index,
1
);








// ==================================
// RESSOURCEN ZURÜCKGEBEN
// ==================================


if(
building.id==="crafting_table"
){


this.backpack.add(
ITEMS.WOOD,
10
);


}





if(
building.id==="furnace"
){


this.backpack.add(
ITEMS.STONE,
10
);


}





return building;



}









getBuildingAt(x,y){



return this.buildings.find(
b=>

x>=b.x &&
x<b.x+b.width &&

y>=b.y &&
y<b.y+b.height

);



}



}