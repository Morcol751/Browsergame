import {drawItemIcon} from "./itemicons.js";

export class Hotbar{


constructor(
inventory,
backpack,
crafting,
building
){


this.inventory=inventory;

this.backpack=backpack;

this.crafting=crafting;

this.building=building;



this.slotSize=56;

this.slotSpacing=8;

this.slotCount=9;


this.buttonSize=70;



this.mouseX=0;

this.mouseY=0;




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



let canvas =
document.getElementById("game");


let rect =
canvas.getBoundingClientRect();


let x =
e.clientX-rect.left;


let y =
e.clientY-rect.top;








// ======================
// BACKPACK BUTTON
// ======================


if(
this.isBackpackButtonHovered()
){


this.backpack.open =
!this.backpack.open;


return;


}






// ======================
// CRAFTING BUTTON
// ======================


if(
this.isCraftingButtonHovered()
){


this.crafting.open =
!this.crafting.open;


return;


}









// ======================
// BACKPACK INTERAKTION
// ======================

if(this.backpack.open){

    // Kategorien + Itemauswahl werden zentral vom Backpack behandelt.
    // true bedeutet: Der Klick gehörte zum Backpack und darf nicht
    // an Hotbar/Welt weitergereicht werden.
    if(this.backpack.handleClick(x,y)){
        return;
    }

}









// ======================
// HOTBAR SLOT
// ======================


let slot =
this.getSlotAtMouse(
x,
y,
canvas
);



if(slot!==null){



let entry =
this.inventory.slots[slot];





if(
this.backpack.selectedItem
){



this.inventory.assignSlot(
slot,
this.backpack.selectedItem.item,
this.backpack.selectedItem.amount
);



this.backpack.clearSelection();


// Ein Item wurde nur einem Slot zugewiesen.
// Ein alter Gebäude-Platzierungsmodus darf dabei
// nicht aktiv bleiben.
this.building.cancel();


return;


}







if(entry){



let item =
entry.item;



if(
item &&
item.type==="building"
){



this.inventory.select(slot);


// Derselbe Slot wurde deaktiviert.
// Dann MUSS auch der Platzierungsmodus enden.
if(
this.inventory.selectedSlot===null
){


this.building.cancel();


return;


}


// Gebäude-Slot ist aktiv:
// exakt dieses Gebäude platzieren.
this.building.startPlacing(
item
);



return;


}



}







// Normaler Slot / leerer Slot:
// Auswahl umschalten und jeden eventuell
// aktiven Gebäude-Platzierungsmodus beenden.
this.inventory.select(slot);


this.building.cancel();



}



});



}

draw(
ctx,
canvas
){



const totalWidth =
this.slotCount*
this.slotSize+
(
this.slotCount-1
)
*
this.slotSpacing;



const startX =
(canvas.width-totalWidth)/2;



const y =
canvas.height-
this.slotSize-
20;




ctx.save();


ctx.textAlign="center";

ctx.textBaseline="middle";

ctx.font="28px Arial";





for(
let i=0;
i<this.slotCount;
i++
){



let x =
startX+
i*
(
this.slotSize+
this.slotSpacing
);





ctx.fillStyle="#303030";


ctx.fillRect(
x,
y,
this.slotSize,
this.slotSize
);






ctx.lineWidth=3;



if(
i===this.inventory.selectedSlot
){


ctx.strokeStyle="yellow";


}
else{


ctx.strokeStyle="#777";


}




ctx.strokeRect(
x,
y,
this.slotSize,
this.slotSize
);







let entry =
this.inventory.slots[i];



if(entry){



let item =
entry.item;



if(item){


ctx.fillStyle="white";


drawItemIcon(
ctx,
item,
x+(this.slotSize-32)/2,
y+8,
32
);


}



}







ctx.font="14px Arial";

ctx.fillStyle="#ccc";


ctx.fillText(
(i+1).toString(),
x+this.slotSize/2,
y+this.slotSize-10
);


ctx.font="28px Arial";



}









// ======================
// BUTTON POSITIONEN
// ======================


let spacing = 10;


let totalButtons =
this.buttonSize*2 +
spacing;



let bx =
canvas.width/2 -
totalButtons/2;



let by = 20;



let cx =
bx +
this.buttonSize +
spacing;



let cy = 20;









// ======================
// BACKPACK BUTTON
// ======================


ctx.fillStyle =
this.isBackpackButtonHovered()
?
"#555"
:
"#303030";



ctx.fillRect(
bx,
by,
this.buttonSize,
this.buttonSize
);



ctx.strokeStyle="#777";


ctx.strokeRect(
bx,
by,
this.buttonSize,
this.buttonSize
);



ctx.fillStyle="white";

ctx.font="36px Arial";


ctx.fillText(
"🎒",
bx+this.buttonSize/2,
by+this.buttonSize/2-8
);



ctx.font="14px Arial";

ctx.fillStyle="#ccc";


ctx.fillText(
"(B)",
bx+this.buttonSize/2,
by+this.buttonSize-10
);









// ======================
// CRAFTING BUTTON
// ======================


ctx.fillStyle =
this.isCraftingButtonHovered()
?
"#555"
:
"#303030";



ctx.fillRect(
cx,
cy,
this.buttonSize,
this.buttonSize
);



ctx.strokeStyle="#777";


ctx.strokeRect(
cx,
cy,
this.buttonSize,
this.buttonSize
);



ctx.fillStyle="white";

ctx.font="36px Arial";


ctx.fillText(
"🔨",
cx+this.buttonSize/2,
cy+this.buttonSize/2-8
);



ctx.font="14px Arial";

ctx.fillStyle="#ccc";


ctx.fillText(
"(C)",
cx+this.buttonSize/2,
cy+this.buttonSize-10
);



ctx.restore();



}









getSlotAtMouse(x,y,canvas){



let totalWidth =
this.slotCount*this.slotSize+
(
this.slotCount-1
)
*
this.slotSpacing;



let startX =
(canvas.width-totalWidth)/2;





let slotY =
canvas.height-
this.slotSize-
20;





for(
let i=0;
i<this.slotCount;
i++
){



let slotX =
startX+
i*
(
this.slotSize+
this.slotSpacing
);



if(
x>=slotX &&
x<=slotX+this.slotSize &&
y>=slotY &&
y<=slotY+this.slotSize
){


return i;


}



}



return null;



}









isBackpackButtonHovered(){



let spacing = 10;


let totalButtons =
this.buttonSize*2 +
spacing;



let bx =
window.innerWidth/2 -
totalButtons/2;



return(
this.mouseX>=bx &&
this.mouseX<=bx+this.buttonSize &&
this.mouseY>=20 &&
this.mouseY<=20+this.buttonSize
);



}









isCraftingButtonHovered(){



let spacing = 10;


let totalButtons =
this.buttonSize*2 +
spacing;



let bx =
window.innerWidth/2 -
totalButtons/2;



let cx =
bx +
this.buttonSize +
spacing;



return(
this.mouseX>=cx &&
this.mouseX<=cx+this.buttonSize &&
this.mouseY>=20 &&
this.mouseY<=20+this.buttonSize
);



}



}