import {ITEMS} from "./items.js";

export class Inventory{


constructor(backpack){



this.backpack=backpack;



this.slots =
new Array(9).fill(null);



this.selectedSlot=null;





this.hand=ITEMS.HAND;



}









select(index){



if(
index<0 ||
index>8
)
return;




if(
this.selectedSlot===index
){


this.selectedSlot=null;


}
else{


this.selectedSlot=index;


}



}









getSelectedItem(){



if(
this.selectedSlot===null
)
return null;



return this.slots[
this.selectedSlot
];



}









getSelectedTool(){



let entry =
this.getSelectedItem();



if(
!entry
)
return this.hand;





let item =
entry.item;



if(
item.type==="tool"
){

return item;

}




return this.hand;



}









removeSelected(){



if(
this.selectedSlot===null
)
return;



this.slots[
this.selectedSlot
]=null;



}









assignSlot(slot,item,amount=1){

if(slot<0 || slot>8)
return;

for(let i=0;i<this.slots.length;i++){

if(
i!==slot &&
this.slots[i] &&
this.slots[i].item.id===item.id
){

this.slots[i]=null;

}

}

if(item.type==="tool"){

this.slots[slot]={
item:item,
amount:1
};

return;

}

let backpackEntry=
this.backpack.items.find(
entry=>entry.item.id===item.id
);

if(backpackEntry){

this.slots[slot]=backpackEntry;

}
else{

this.slots[slot]={
item:item,
amount:amount
};

}

}





clearItemFromSlots(itemId){

for(let i=0;i<this.slots.length;i++){

if(
this.slots[i] &&
this.slots[i].item &&
this.slots[i].item.id===itemId
){

this.slots[i]=null;

if(this.selectedSlot===i){

this.selectedSlot=null;

}

}

}

}





relinkStackableSlots(){

for(let i=0;i<this.slots.length;i++){

let slot=this.slots[i];

if(
!slot ||
!slot.item ||
slot.item.type==="tool"
)
continue;

let backpackEntry=
this.backpack.items.find(
entry=>
entry.item &&
entry.item.id===slot.item.id
);

if(backpackEntry){

this.slots[i]=backpackEntry;

}
else{

this.slots[i]=null;

if(this.selectedSlot===i){

this.selectedSlot=null;

}

}

}

}





useSelectedConsumable(playerStats,player=null){

let entry=this.getSelectedItem();

if(
!entry ||
!entry.item ||
!playerStats
)
return false;

let item=entry.item;

if(item.type==="food"){

if(playerStats.hunger>=playerStats.maxHunger){

if(player){

player.showMessage(
"Du bist bereits satt"
);

}

return false;

}

let restore=
Math.max(
0,
Number(item.hungerRestore) || 0
);

if(restore<=0)
return false;


playerStats.hunger=
Math.min(
playerStats.maxHunger,
playerStats.hunger+restore
);

this.backpack.removeItem(
item,
1
);

if(player){

player.showMessage(
"+"+restore+" Hunger"
);

}

return true;

}

if(item.type==="drink"){

if(playerStats.thirst>=playerStats.maxThirst){

if(player){

player.showMessage(
"Du hast keinen Durst"
);

}

return false;

}

let restore=
Math.max(
0,
Number(item.thirstRestore) || 0
);

if(restore<=0)
return false;


playerStats.thirst=
Math.min(
playerStats.maxThirst,
playerStats.thirst+restore
);

this.backpack.removeItem(
item,
1
);

if(player){

player.showMessage(
"+"+restore+" Durst"
);

}

return true;

}

return false;

}


getSlot(index){


return this.slots[index];


}



}