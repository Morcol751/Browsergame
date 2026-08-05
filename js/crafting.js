export class Crafting {



constructor(backpack){


this.backpack = backpack;


this.open=false;


this.mouseX=0;
this.mouseY=0;






window.addEventListener(
"keydown",
(e)=>{


if(
e.key.toLowerCase()==="c"
){

this.open =
!this.open;

}


});








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


if(!this.open)
return;



this.handleClick();



});


}









getLayout(canvas){



let width=1300;

let height=420;



let x =
canvas.width/2-width/2;


let y =
canvas.height/2-height/2;



return {

x:x,

y:y,

width:width,

height:height,


nameX:x+50,

costX:x+300,

buttonX:x+500,


rows:[
y+160,
y+230
]


};



}









handleClick(){



let canvas =
document.getElementById("game");



let l =
this.getLayout(canvas);



let row1=l.rows[0];
let row2=l.rows[1];





if(

this.mouseX >= l.buttonX &&

this.mouseX <= l.buttonX+120 &&

this.mouseY >= row1 &&

this.mouseY <= row1+45

){

this.craftCraftingTable();

}





if(

this.mouseX >= l.buttonX &&

this.mouseX <= l.buttonX+120 &&

this.mouseY >= row2 &&

this.mouseY <= row2+45

){

this.craftFurnace();

}



}









craftCraftingTable(){



let wood =

this.backpack.items.find(

e=>e.item.id==="wood"

);




if(!wood || wood.amount<10)
return;





wood.amount-=10;



if(wood.amount<=0){


this.backpack.items.splice(

this.backpack.items.indexOf(wood),

1

);


}






import("./items.js")
.then(
module=>{


this.backpack.add(
module.ITEMS.CRAFTING_TABLE,
1
);


if(this.backpack.audio){

this.backpack.audio.playSound(
"craft"
);

}

});



}









craftFurnace(){



let stone =

this.backpack.items.find(

e=>e.item.id==="stone"

);





if(!stone || stone.amount<10)
return;





stone.amount-=10;



if(stone.amount<=0){


this.backpack.items.splice(

this.backpack.items.indexOf(stone),

1

);


}






import("./items.js")
.then(
module=>{


this.backpack.add(

module.ITEMS.FURNACE,

1

);

if(this.backpack.audio){

this.backpack.audio.playSound(
"craft"
);

}


});



}









hasWood(){


let wood =

this.backpack.items.find(

e=>e.item.id==="wood"

);



return wood && wood.amount>=10;



}









hasStone(){


let stone =

this.backpack.items.find(

e=>e.item.id==="stone"

);



return stone && stone.amount>=10;



}









draw(
ctx,
canvas
){



if(!this.open)
return;





let l =
this.getLayout(canvas);



let row1=l.rows[0];
let row2=l.rows[1];





ctx.save();



// ===============================
// RESET CANVAS STATE
// ===============================


ctx.font="20px Arial";

ctx.textAlign="left";

ctx.textBaseline="alphabetic";

ctx.fillStyle="white";









// ===============================
// HINTERGRUND
// ===============================


ctx.fillStyle="rgba(0,0,0,0.9)";


ctx.fillRect(

l.x,

l.y,

l.width,

l.height

);






ctx.strokeStyle="white";

ctx.lineWidth=3;


ctx.strokeRect(

l.x,

l.y,

l.width,

l.height

);









// ===============================
// TITEL
// ===============================


ctx.font="32px Arial";

ctx.textAlign="center";


ctx.fillStyle="white";


ctx.fillText(

"Crafting",

canvas.width/2,

l.y+45

);









// ===============================
// ÜBERSCHRIFTEN
// ===============================


ctx.font="26px Arial";


ctx.fillText(

"Werkbänke",

l.x+300,

l.y+100

);



ctx.fillText(

"Maschinen",

l.x+1000,

l.y+100

);









// ===============================
// TRENNLINIE
// ===============================


ctx.strokeStyle="#777";

ctx.lineWidth=2;


ctx.beginPath();


ctx.moveTo(

l.x+650,

l.y+70

);


ctx.lineTo(

l.x+650,

l.y+370

);


ctx.stroke();









// ===============================
// REZEPTE
// ===============================


ctx.textAlign="left";

ctx.font="20px Arial";

ctx.fillStyle="white";




// -------------------------------
// HANDWERKSBANK
// -------------------------------


ctx.fillText(

"Handwerksbank",

l.nameX,

row1+30

);



ctx.fillText(

"10 Holz",

l.costX,

row1+30

);



this.drawButton(

ctx,

l.buttonX,

row1,

120,

45,

this.hasWood()

);







// -------------------------------
// OFEN
// -------------------------------


ctx.font="20px Arial";

ctx.textAlign="left";


ctx.fillText(

"Ofen",

l.nameX,

row2+30

);



ctx.font="20px Arial";

ctx.fillText(

"10 Stein",

l.costX,

row2+30

);



this.drawButton(

ctx,

l.buttonX,

row2,

120,

45,

this.hasStone()

);









// ===============================
// MASCHINEN
// ===============================


ctx.font="18px Arial";

ctx.textAlign="center";


ctx.fillText(

"(später)",

l.x+1000,

row1+30

);






ctx.restore();



}









drawButton(
ctx,
x,
y,
w,
h,
active
){



ctx.save();



if(active){

ctx.fillStyle="#2ecc71";

}
else{

ctx.fillStyle="#555";

}





ctx.fillRect(

x,

y,

w,

h

);







ctx.strokeStyle="#aaa";


ctx.strokeRect(

x,

y,

w,

h

);






ctx.font="18px Arial";

ctx.textAlign="center";

ctx.textBaseline="alphabetic";


ctx.fillStyle="white";


ctx.fillText(

"Bauen",

x+w/2,

y+29

);



ctx.restore();



}



}