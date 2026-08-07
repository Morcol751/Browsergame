import {ITEMS} from "./items.js";
import {drawItemIcon,drawIngredientLine} from "./itemicons.js";


export class Workbench{


constructor(backpack,audio,game){


this.backpack=backpack;

this.audio=audio;

this.game=game;


this.open=false;


this.category="Verarbeitung";


this.mouseX=0;
this.mouseY=0;



this.scroll=0;

this.maxScroll=0;





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


if(!this.open)
return;



if(e.key==="Escape"){


this.close();


}



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




window.addEventListener(
"wheel",
(e)=>{


if(!this.open)
return;


this.scroll+=
e.deltaY*0.3;



this.scroll =
Math.max(
0,
Math.min(
this.scroll,
this.maxScroll
)
);



});




}









openMenu(){


this.open=true;


this.scroll=0;



if(this.game){

this.game.inputLocked=true;


}



}







close(){


this.open=false;


if(this.game){

this.game.inputLocked=false;


}



}









getLayout(canvas){


let width=900;

let height=600;



return {


x:
canvas.width/2-width/2,


y:
canvas.height/2-height/2,


width,

height


};



}









handleClick(){


let canvas =
document.getElementById("game");


let l =
this.getLayout(canvas);





// =====================
// KATEGORIEN
// =====================


if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+90 &&
this.mouseY<=l.y+140
){

this.category="Verarbeitung";

}



if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+150 &&
this.mouseY<=l.y+200
){

this.category="Werkzeuge";

}



if(
this.mouseX>=l.x+40 &&
this.mouseX<=l.x+240
&&
this.mouseY>=l.y+210 &&
this.mouseY<=l.y+260
){

this.category="Förderbänder";

}






// =====================
// REZEPTE
// =====================


let recipes =
this.getRecipes();



recipes.forEach(
(recipe,index)=>{


let y =
l.y+140+
index*90-
this.scroll;




if(

this.mouseX>=l.x+700 &&

this.mouseX<=l.x+820 &&

this.mouseY>=y-30 &&

this.mouseY<=y+15

){


this.craft(recipe);


}



});




}









getRecipes(){


if(
this.category==="Verarbeitung"
){


return [

{

name:"3x Holzbretter",

icon:"🪵",

input:ITEMS.WOOD,

amount:1,

output:ITEMS.WOOD_PLANKS,

outputAmount:3


}

];


}







if(
this.category==="Werkzeuge"
){


return [


{

name:"Holzaxt",

icon:"🪓",

ingredients:[

{
item:ITEMS.WOOD_PLANKS,
amount:5
}

],

output:ITEMS.WOOD_AXE,

outputAmount:1


},



{

name:"Holzspitzhacke",

icon:"⛏",

ingredients:[

{
item:ITEMS.WOOD_PLANKS,
amount:5
}

],

output:ITEMS.WOOD_PICKAXE,

outputAmount:1


},




{

name:"Steinaxt",

icon:"🪓",

ingredients:[

{
item:ITEMS.STONE,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.STONE_AXE,

outputAmount:1


},




{

name:"Steinspitzhacke",

icon:"⛏",

ingredients:[

{
item:ITEMS.STONE,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.STONE_PICKAXE,

outputAmount:1


},



{

name:"Kupferaxt",

icon:"🪓",

ingredients:[

{
item:ITEMS.COPPER_BAR,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.COPPER_AXE,

outputAmount:1


},




{

name:"Kupferspitzhacke",

icon:"⛏",

ingredients:[

{
item:ITEMS.COPPER_BAR,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.COPPER_PICKAXE,

outputAmount:1


},


{

name:"Eisenaxt",

icon:"🪓",

ingredients:[

{
item:ITEMS.IRON_BAR,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.IRON_AXE,

outputAmount:1


},




{

name:"Eisenspitzhacke",

icon:"⛏",

ingredients:[

{
item:ITEMS.IRON_BAR,
amount:3
},

{
item:ITEMS.WOOD_PLANKS,
amount:2
}

],

output:ITEMS.IRON_PICKAXE,

outputAmount:1


}



];


}






if(
this.category==="Förderbänder"
){


return [];

}



return [];


}









hasItem(item,amount){


let entry =
this.backpack.items.find(
e=>e.item.id===item.id
);



return (
entry &&
entry.amount>=amount
);



}









removeItem(item,amount){


let entry =
this.backpack.items.find(
e=>e.item.id===item.id
);



if(!entry)
return;



entry.amount-=amount;



if(entry.amount<=0){


this.backpack.items.splice(

this.backpack.items.indexOf(entry),

1

);


}



}









craft(recipe){



// Verarbeitung


if(recipe.input){



if(
!this.hasItem(
recipe.input,
recipe.amount
)
)
return;




this.removeItem(

recipe.input,

recipe.amount

);




this.backpack.add(

recipe.output,

recipe.outputAmount

);




if(this.audio){

this.audio.playSound(
"craft"
);


}



return;


}









// Werkzeuge


for(
let ing of recipe.ingredients
){


if(
!this.hasItem(
ing.item,
ing.amount
)
)
return;


}






for(
let ing of recipe.ingredients
){


this.removeItem(

ing.item,

ing.amount

);


}







this.backpack.add(

recipe.output,

recipe.outputAmount

);






if(this.audio){

this.audio.playSound(
"craft"
);


}




}









draw(ctx,canvas){



if(!this.open)
return;




let l =
this.getLayout(canvas);




ctx.save();






ctx.fillStyle=
"rgba(0,0,0,0.9)";


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








ctx.fillStyle="white";

ctx.textAlign="center";


ctx.font="32px Arial";


ctx.fillText(

"Handwerksbank",

canvas.width/2,

l.y+45

);








// Kategorien


ctx.font="22px Arial";

ctx.textAlign="left";



let cats=[

"Verarbeitung",

"Werkzeuge",

"Förderbänder"

];



cats.forEach(
(cat,i)=>{


if(
this.category===cat
){

ctx.fillStyle="yellow";

}
else{

ctx.fillStyle="white";

}



ctx.fillText(

cat,

l.x+40,

l.y+110+i*60

);



});









// =====================
// REZEPTE
// =====================


let recipes =
this.getRecipes();



this.maxScroll =
Math.max(
0,
recipes.length*90-350
);



ctx.save();


ctx.beginPath();


ctx.rect(

l.x+300,

l.y+90,

550,

400

);


ctx.clip();





ctx.textAlign="left";


ctx.font="20px Arial";



recipes.forEach(
(recipe,index)=>{


let y =
l.y+140+
index*90-
this.scroll;




// NAME

ctx.fillStyle="white";

drawItemIcon(
ctx,
recipe.output,
l.x+330,
y-25,
30
);

ctx.textAlign="left";
ctx.textBaseline="alphabetic";
ctx.font="20px Arial";

ctx.fillText(
recipe.name,
l.x+370,
y
);


// MATERIALIEN

ctx.fillStyle="#aaa";

let ingredients =
recipe.input
? [{item:recipe.input,amount:recipe.amount}]
: recipe.ingredients;

drawIngredientLine(
ctx,
ingredients || [],
l.x+330,
y+25
);


// BUTTON AKTIV?


let canCraft=true;



if(recipe.input){


canCraft =
this.hasItem(
recipe.input,
recipe.amount
);


}
else if(recipe.ingredients){



for(
let ing of recipe.ingredients
){


if(
!this.hasItem(
ing.item,
ing.amount
)
){


canCraft=false;


}



}


}







// BUTTON


ctx.fillStyle =
canCraft
?
"#2ecc71"
:
"#555";



ctx.fillRect(

l.x+700,

y-30,

120,

45

);






ctx.fillStyle="white";


ctx.textAlign="center";


ctx.font="18px Arial";


ctx.fillText(

"Bauen",

l.x+760,

y

);




ctx.textAlign="left";


ctx.font="20px Arial";



});



ctx.restore();







ctx.font="16px Arial";


ctx.fillStyle="white";


ctx.fillText(

"[ESC] Schließen",

l.x+40,

l.y+l.height-30

);





ctx.restore();



}



}