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


if(
slot<0 ||
slot>8
)
return;





// =================================
// EINZELITEMS VERSCHIEBEN
// Werkzeuge + Gebäude
// =================================


if(
item.type==="tool" ||
item.type==="building"
){



for(
let i=0;
i<this.slots.length;
i++
){



if(
i!==slot &&
this.slots[i] &&
this.slots[i].item.id===item.id
){



// altes Item entfernen

this.slots[i]=null;



}



}



}







this.slots[slot]={

item:item,

amount:amount

};



}









getSlot(index){


return this.slots[index];


}



}