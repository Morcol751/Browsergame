export class Input{


constructor(inventory, game){



this.inventory =
inventory;


this.game =
game;







window.addEventListener(
"keydown",
(e)=>{








// ======================
// INVENTAR SLOTS
// ======================


const key =
parseInt(e.key);



if(
key >= 1 &&
key <= 9
){



let slot =
key-1;



this.inventory.select(
slot
);




// ======================
// BUILDING ÜBER HOTBAR TASTE
// ======================



// Slot wurde deaktiviert

if(
this.inventory.selectedSlot===null
){



if(
this.game &&
this.game.building
){


this.game.building.cancel();


}



return;


}






let entry =
this.inventory.slots[

this.inventory.selectedSlot

];







if(
entry
){



let item =
entry.item;



if(
item &&
item.type==="building"
){



this.game.building.startPlacing(
item
);



}
else{



if(
this.game &&
this.game.building
){


this.game.building.cancel();


}



}



}
else{



if(
this.game &&
this.game.building
){


this.game.building.cancel();


}



}



}












// ======================
// EINSTELLUNGEN
// ======================


if(
e.key==="Escape"
){



if(this.game){


this.game.toggleSettings();



}






// zusätzlich Bau abbrechen


if(
this.game &&
this.game.building
){


this.game.building.cancel();


}



}



});



}



}